import { distance, requiredTurnAt, signFitsTurn } from './geometry.js';
import { maxUsesFor, quotaCount, signById, transitionRuleFor } from './rules.js';

function result(code, ok, message, severity = 'error', details = null) {
  return { code, ok, message, severity, details };
}

export function validateCourse(course, pack) {
  const level = pack.levels[course.levelId];
  if (!level) return [result('level', false, `Unknown level ${course.levelId}`)];

  const stations = course.nodes.filter(n => n.kind === 'station');
  const signIds = stations.map(s => s.signId);
  const results = [];

  results.push(result(
    'count',
    stations.length >= level.stationCount.min && stations.length <= level.stationCount.max,
    `${stations.length} stations; required ${level.stationCount.min}–${level.stationCount.max}`
  ));

  const area = course.ring.width * course.ring.height;
  results.push(result(
    'ring',
    area >= level.ringArea.min && area <= level.ringArea.max,
    `${course.ring.width} × ${course.ring.height} ft = ${area.toLocaleString()} sq ft; allowed ${level.ringArea.min.toLocaleString()}–${level.ringArea.max.toLocaleString()}`
  ));

  const allowed = new Set(level.allowedSigns);
  const bad = stations.filter(s => !allowed.has(s.signId));
  results.push(result(
    'allowed',
    bad.length === 0,
    bad.length ? `${bad.length} station(s) use signs not allowed at this level` : 'All signs are level-appropriate',
    'error',
    bad
  ));

  const geometryBad = [];
  for (let i = 1; i < course.nodes.length - 1; i++) {
    const node = course.nodes[i];
    if (node.kind !== 'station') continue;
    const sign = signById(pack, node.signId);
    if (!sign) continue;
    const req = requiredTurnAt(course.nodes, i);
    if (!signFitsTurn(sign, req)) geometryBad.push({
      stationId: node.stationId,
      signId: node.signId,
      requiredExitTurn: req,
      signRequiresTurn: sign.motion?.turnDelta ?? 0
    });
  }
  results.push(result(
    'geometry',
    geometryBad.length === 0,
    geometryBad.length
      ? `${geometryBad.length} sign exit-direction/path mismatch(es)`
      : "Every sign's required exit direction matches the drawn path",
    'error',
    geometryBad
  ));

  const counts = {};
  signIds.forEach(id => counts[id] = (counts[id] || 0) + 1);
  const over = Object.entries(counts)
    .filter(([id, n]) => n > maxUsesFor(pack, course.levelId, id))
    .map(([id, n]) => ({ id, n, max: maxUsesFor(pack, course.levelId, id) }));
  results.push(result(
    'duplicates',
    over.length === 0,
    over.length ? `${over.length} sign-use limit violation(s)` : 'Sign-use limits satisfied',
    'error',
    over
  ));

  for (const quota of level.quotas || []) {
    const n = quotaCount(pack, course.levelId, signIds, quota);
    results.push(result(
      `quota:${quota.id}`,
      n >= quota.min,
      `${n}/${quota.min} ${quota.label}`,
      'error',
      { quota, count: n }
    ));
  }

  // Level-aware sequence / required-next validation.
  // Examples: FAST -> NORMAL (or SLOW where the level permits it),
  // Leave Dog -> legal recall/return exercise, etc.
  let sequenceError = null;
  for (let i = 0; i < stations.length; i++) {
    const id = stations[i].signId;
    const rule = transitionRuleFor(pack, course.levelId, id);
    if (!rule) continue;

    const nextId = stations[i + 1]?.signId ?? null;
    const atCourseEnd = i === stations.length - 1;

    if (atCourseEnd) {
      if (!rule.allowFinish) {
        sequenceError = {
          station: i + 1,
          id,
          nextId: 'FINISH',
          allowed: rule.next,
          reason: 'finish-not-allowed'
        };
        break;
      }
    } else if (!rule.next.includes(nextId)) {
      sequenceError = {
        station: i + 1,
        id,
        nextId,
        allowed: rule.next,
        reason: 'invalid-required-next'
      };
      break;
    }
  }

  results.push(result(
    'sequence',
    !sequenceError,
    sequenceError
      ? `Sequence/state rule violation at station ${sequenceError.station}`
      : 'Required sign sequences and pace changes are valid',
    'error',
    sequenceError
  ));

  if (level.noHalts) {
    const halts = stations.filter(s => pack.signs[s.signId]?.requiresHalt);
    results.push(result(
      'noHalts',
      halts.length === 0,
      halts.length ? `${halts.length} halt/stationary sign(s) are not permitted` : 'No halt exercises',
      'error',
      halts
    ));
  }

  for (const custom of pack.customValidators || []) {
    const customResults = custom(course, pack) || [];
    results.push(...customResults);
  }

  return results;
}

export function isCourseValid(course, pack) {
  return validateCourse(course, pack).every(r => r.ok || r.severity !== 'error');
}
