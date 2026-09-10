import { distance, equipmentFootprintFor, pointInEquipmentFootprint, requiredTurnAt, segmentsCross, signFitsTurn } from './geometry.js';
import { joinedRuleFor, maxUsesFor, quotaCount, signById, transitionRuleFor } from './rules.js';
import { officialStationCount, ringRuleIssues, ringRuleText, stationCountLabel } from './pack.js';
import { rectCorners, routeNoGoConflicts } from './venue.js';

function result(code, ok, message, severity = 'error', details = null) {
  return { code, ok, message, severity, details };
}

export function validateCourse(course, pack) {
  const level = pack.levels[course.levelId];
  if (!level) return [result('level', false, `Unknown level ${course.levelId}`)];

  const stations = course.nodes.filter(n => n.kind === 'station');
  const signIds = stations.map(s => s.signId);
  const results = [];

  const officialCount = officialStationCount(course, level);
  results.push(result(
    'count',
    officialCount >= level.stationCount.min && officialCount <= level.stationCount.max,
    `${officialCount} ${stationCountLabel(level)}; required ${level.stationCount.min}–${level.stationCount.max}`
  ));

  const ringIssues = ringRuleIssues(level, course.ring);
  const area = course.ring.width * course.ring.height;
  results.push(result(
    'ring',
    ringIssues.length === 0,
    ringIssues.length
      ? `${course.ring.width} × ${course.ring.height} ft = ${area.toLocaleString()} sq ft; ${ringIssues.join('; ')}`
      : `${course.ring.width} × ${course.ring.height} ft = ${area.toLocaleString()} sq ft; meets ${ringRuleText(level)}`,
    'error',
    ringIssues
  ));


  const noGoZones=course.noGoZones || [];
  if(noGoZones.length){
    const conflicts=routeNoGoConflicts(course.nodes,noGoZones,0.5);

    // Equipment working envelopes must also stay clear of venue obstacles.
    course.nodes.forEach((node,nodeIndex)=>{
      if(node.kind!=='station') return;
      const sign=pack.signs[node.signId];
      const fp=equipmentFootprintFor(sign,course.nodes,nodeIndex);
      if(!fp) return;
      for(const zone of noGoZones){
        const zc=rectCorners(zone,0.5);
        let overlap=fp.corners.some(c=>zc.length && c.x>=zc[0].x && c.x<=zc[1].x && c.y>=zc[0].y && c.y<=zc[2].y);
        if(!overlap) overlap=zc.some(c=>pointInEquipmentFootprint(c,fp,0.5));
        if(!overlap){
          for(let a=0;a<4 && !overlap;a++){
            for(let b=0;b<4;b++){
              if(segmentsCross(fp.corners[a],fp.corners[(a+1)%4],zc[b],zc[(b+1)%4])){
                overlap=true;break;
              }
            }
          }
        }
        if(overlap){
          conflicts.push({
            type:'equipment-in-no-go',
            zoneId:zone.id,
            zoneLabel:zone.label||'No-go zone',
            nodeIndex,
            stationId:node.stationId,
            signId:node.signId
          });
        }
      }
    });

    const dedup=[];
    const seen=new Set();
    for(const c of conflicts){
      const k=`${c.type}:${c.zoneId||c.zoneLabel}:${c.nodeIndex??c.segmentStartIndex??''}:${c.stationId||''}`;
      if(seen.has(k)) continue;
      seen.add(k);dedup.push(c);
    }
    results.push(result(
      'venue-no-go',
      dedup.length===0,
      dedup.length
        ? `${dedup.length} route/station/equipment conflict(s) with venue no-go zones`
        : `${noGoZones.length} venue no-go zone(s) are clear`,
      'error',
      dedup
    ));
  }

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
      signRequiresTurn: sign.motion?.turnOptions ?? sign.motion?.turnDelta ?? 0
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

  // Only enforce an ordinary-station minimum when the selected organization
  // explicitly defines one. A preferred design gap belongs in quality scoring,
  // not in legality.
  const spacingRule = level.ordinarySpacing || pack.ordinarySpacing || null;
  if (spacingRule?.min != null) {
    const spacingBad = [];
    for (let i = 0; i < stations.length - 1; i++) {
      const a = stations[i], b = stations[i + 1];
      const d = distance(a, b);
      const joined = joinedRuleFor(pack, a.signId, b.signId);
      const stated = (pack.adjacentDistanceRules || []).find(rule =>
        rule.from.includes(a.signId) && rule.to.includes(b.signId)
      );
      if (joined || stated) continue;
      if (d + 1e-6 < spacingRule.min) {
        spacingBad.push({
          station: i + 1,
          nextStation: i + 2,
          stationId: a.stationId,
          nextStationId: b.stationId,
          from: a.signId,
          to: b.signId,
          distance: d,
          minimum: spacingRule.min
        });
      }
    }
    results.push(result(
      'ordinary-spacing',
      spacingBad.length === 0,
      spacingBad.length
        ? `${spacingBad.length} ordinary station gap(s) are under the ${spacingRule.min}-ft organization minimum`
        : `Ordinary station spacing meets the ${spacingRule.min}-ft organization minimum`,
      'error',
      spacingBad
    ));
  }

  const joinedWarnings = [];
  for (let i = 0; i < stations.length - 1; i++) {
    const a = stations[i], b = stations[i + 1];
    const joined = joinedRuleFor(pack, a.signId, b.signId);
    if (!joined) continue;
    const d = distance(a, b);
    const warnAbove = joined.displayWarnAbove ?? 6;
    if (d > warnAbove + 1e-6) joinedWarnings.push({
      station: i + 1,
      nextStation: i + 2,
      stationId: a.stationId,
      nextStationId: b.stationId,
      from: a.signId,
      to: b.signId,
      distance: d,
      warnAbove
    });
  }
  if ((pack.joinedPairRules || []).length) {
    results.push(result(
      'joined-layout',
      joinedWarnings.length === 0,
      joinedWarnings.length
        ? `${joinedWarnings.length} joined sequence(s) are drawn unusually far apart`
        : 'Joined sequences are shown together',
      'warning',
      joinedWarnings
    ));
  }

  const counts = {};
  signIds.forEach(id => counts[id] = (counts[id] || 0) + 1);
  const over = Object.entries(counts)
    .filter(([id, n]) => n > maxUsesFor(pack, course.levelId, id))
    .map(([id, n]) => ({
      id, n, max: maxUsesFor(pack, course.levelId, id),
      stationIds: stations.filter(s => s.signId === id).map(s => s.stationId)
    }));
  results.push(result(
    'duplicates',
    over.length === 0,
    over.length ? `${over.length} sign-use limit violation(s)` : 'Sign-use limits satisfied',
    'error',
    over
  ));

  for (const quota of level.quotas || []) {
    const n = quotaCount(pack, course.levelId, signIds, quota);
    const minOk = n >= (quota.min ?? 0);
    const maxOk = quota.max == null || n <= quota.max;
    const target = quota.max == null
      ? `${quota.min}+`
      : quota.min === quota.max
        ? `${quota.min}`
        : `${quota.min}–${quota.max}`;
    results.push(result(
      `quota:${quota.id}`,
      minOk && maxOk,
      `${n}/${target} ${quota.label}`,
      'error',
      { quota, count: n }
    ));
  }

  // Level-aware sequence / required-next validation.
  let sequenceError = null;
  for (let i = 0; i < stations.length; i++) {
    const id = stations[i].signId;
    const rule = transitionRuleFor(pack, course.levelId, id);
    if (!rule) continue;

    const nextId = stations[i + 1]?.signId ?? null;
    const atCourseEnd = i === stations.length - 1;
    if (atCourseEnd) {
      if (!rule.allowFinish) {
        sequenceError = { station: i + 1, id, nextId: 'FINISH', allowed: rule.next, reason: 'finish-not-allowed' };
        break;
      }
    } else if (!rule.next.includes(nextId)) {
      sequenceError = { station: i + 1, id, nextId, allowed: rule.next, reason: 'invalid-required-next' };
      break;
    }
  }
  if (Object.keys(pack.transitionRules || {}).length || Object.keys(pack.sequenceNext || {}).length) {
    results.push(result(
      'sequence',
      !sequenceError,
      sequenceError ? `Sequence/state rule violation at station ${sequenceError.station}` : 'Required sign sequences are valid',
      'error',
      sequenceError
    ));
  }

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

  if (Array.isArray(level.requiredAuxiliary) && level.requiredAuxiliary.length) {
    const aux = course.auxiliary || [];
    const missing = level.requiredAuxiliary.filter(req =>
      !aux.some(a => a.signId === req.signId || a.id === req.id)
    );
    results.push(result(
      'auxiliary',
      missing.length === 0,
      missing.length ? `${missing.length} mandatory auxiliary exercise(s) are missing` : 'Mandatory auxiliary exercise(s) are present',
      'error',
      missing
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
