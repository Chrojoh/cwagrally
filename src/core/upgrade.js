import { cloneCourse, makeId, stationNodes, touchCourse } from './model.js';
import { angleDiff, distance, equipmentPlacementConflicts, headingBetween, normalizeAngle, recalcHeadings, requiredTurnAt, segmentsCross, signFitsTurn } from './geometry.js';
import { maxUsesFor } from './rules.js';
import { isCourseValid, validateCourse } from './validator.js';
import { assignSignsToNodes, progressionReserveFits } from './generator.js';
import { stationNodeRange } from './pack.js';

function insertIntoLargestGap(course, pack = null, reserveLevelId = null) {
  const minSpacing = course.ring.minSpacing;
  const margin = 2;
  const gaps = [];
  for (let i = 0; i < course.nodes.length - 1; i++) {
    const a = course.nodes[i], b = course.nodes[i + 1];
    gaps.push({ i, d: distance(a, b), a, b });
  }
  gaps.sort((a, b) => b.d - a.d);

  function preservesExistingEquipment(nodes) {
    if (!pack) return true;
    const placements = [];
    for (let nodeIndex = 1; nodeIndex < nodes.length - 1; nodeIndex++) {
      const node = nodes[nodeIndex];
      if (node?.kind !== 'station' || !node.signId) continue;
      const sign = pack.signs[node.signId];
      if (!sign?.space?.footprint) continue;
      const conflicts = equipmentPlacementConflicts({
        nodes, nodeIndex, sign, ring:course.ring,
        otherPlacements:placements, buffer:1
      });
      if (conflicts.length) return false;
      placements.push({ nodeIndex, sign });
    }
    return true;
  }

  for (const gap of gaps) {
    const mx = (gap.a.x + gap.b.x) / 2;
    const my = (gap.a.y + gap.b.y) / 2;
    const dx = gap.b.x - gap.a.x, dy = gap.b.y - gap.a.y;
    const len = Math.max(0.001, Math.hypot(dx, dy));
    const px = -dy / len, py = dx / len;
    const half = len / 2;
    const offset = len >= minSpacing * 2
      ? 0
      : Math.sqrt(Math.max(0, minSpacing * minSpacing - half * half)) + 0.35;
    const candidates = offset === 0
      ? [{ x: mx, y: my }]
      : [
          { x: mx + px * offset, y: my + py * offset },
          { x: mx - px * offset, y: my - py * offset }
        ];
    const inside = candidates
      .filter(p => p.x >= margin && p.x <= course.ring.width - margin && p.y >= margin && p.y <= course.ring.height - margin)
      .filter(p => distance(p, gap.a) + 1e-6 >= minSpacing && distance(p, gap.b) + 1e-6 >= minSpacing)
      .sort((u, v) => {
        const cu = Math.min(u.x, course.ring.width-u.x, u.y, course.ring.height-u.y);
        const cv = Math.min(v.x, course.ring.width-v.x, v.y, course.ring.height-v.y);
        return cv - cu;
      });

    for (const pos of inside) {
      const node = {
        kind: 'station', stationId: makeId('st'), signId: null,
        x: pos.x, y: pos.y, heading: 0, locked: false, upgradeAdded: true
      };
      const trialNodes = course.nodes.map(n => ({ ...n }));
      trialNodes.splice(gap.i + 1, 0, node);
      recalcHeadings(trialNodes);

      // Adding a station is supposed to be a cheap physical change. Never put
      // that new sign inside the working envelope of an existing obstacle just
      // because that happens to be the numerically largest gap.
      if (!preservesExistingEquipment(trialNodes)) continue;

      // If the lower/current level deliberately reserved future equipment bays,
      // keep those reservations intact while adding the required station count.
      // This is critical for CKC Excellent→Master: the extra Master station must
      // not consume one of the two existing nonconsecutive jump bays.
      if (pack && reserveLevelId && !progressionReserveFits(pack, reserveLevelId, trialNodes, course.ring)) continue;

      course.nodes.splice(gap.i + 1, 0, node);
      recalcHeadings(course.nodes);
      return node.stationId;
    }
  }
  return null;
}


function vecFromHeading(h) {
  const r = h * Math.PI / 180;
  return { x: Math.sin(r), y: -Math.cos(r) };
}

function insideRing(course, p, margin = 4) {
  return p.x >= margin && p.x <= course.ring.width - margin
      && p.y >= margin && p.y <= course.ring.height - margin;
}

function newSegmentCrossesExisting(course, a, b, ignoreTailSegments = 1) {
  const nodes = course.nodes;
  const stop = Math.max(0, nodes.length - 1 - ignoreTailSegments);
  for (let i = 0; i < stop - 1; i++) {
    if (segmentsCross(a, b, nodes[i], nodes[i + 1])) return true;
  }
  return false;
}

// Adding one station immediately before Finish is intentionally treated as a
// cheap real-world setup change. The old Finish may move a little so that the
// judge only has to place one extra sign rather than rework several stations.
function tryAddStationAtEnd(course) {
  const finishIndex = course.nodes.findIndex(n => n.kind === 'finish');
  if (finishIndex < 2) return null;

  const last = course.nodes[finishIndex - 1];
  const prev = course.nodes[finishIndex - 2];
  const oldFinish = course.nodes[finishIndex];

  const minD = course.ring.minSpacing || 4.5;
  // End additions are deliberately variable; no universal ordinary gap.
  const step = Math.max(minD + 1.5, 7 + Math.random() * 6);
  const incoming = headingBetween(prev, last);
  const oldFinishHeading = headingBetween(last, oldFinish);

  // Prefer continuing the existing path. Then allow small/simple direction
  // changes that a judge can lay out quickly.
  const candidates = [
    oldFinishHeading,
    incoming,
    normalizeAngle(incoming + 45),
    normalizeAngle(incoming - 45),
    normalizeAngle(incoming + 90),
    normalizeAngle(incoming - 90),
  ];

  // Remove duplicate headings while preserving preference order.
  const headings = [...new Set(candidates.map(h => Math.round(normalizeAngle(h) / 45) * 45 % 360))];

  for (const h of headings) {
    const v = vecFromHeading(h);
    const newStation = {
      kind: 'station',
      stationId: makeId('st'),
      signId: null,
      x: last.x + v.x * step,
      y: last.y + v.y * step,
      heading: h,
      locked: false,
      upgradeAddedAtEnd: true
    };

    const newFinish = {
      ...oldFinish,
      x: newStation.x + v.x * step,
      y: newStation.y + v.y * step
    };

    if (!insideRing(course, newStation) || !insideRing(course, newFinish)) continue;
    if (newSegmentCrossesExisting(course, last, newStation, 2)) continue;
    if (newSegmentCrossesExisting(course, newStation, newFinish, 2)) continue;

    const next = cloneCourse(course);
    const fi = next.nodes.findIndex(n => n.kind === 'finish');
    next.nodes.splice(fi, 0, newStation);
    next.nodes[fi + 1] = newFinish;
    recalcHeadings(next.nodes);
    return next;
  }

  return null;
}

function removeLeastDisruptive(course, pack) {
  const candidates = course.nodes
    .map((n, i) => ({ n, i }))
    .filter(x => x.n.kind === 'station' && !x.n.locked)
    .map(x => {
      const sign = pack.signs[x.n.signId];
      const turn = Math.abs(requiredTurnAt(course.nodes, x.i));
      const equipmentPenalty = sign?.equipment ? 100 : 0;
      return { ...x, score: turn + equipmentPenalty };
    })
    .sort((a, b) => a.score - b.score);
  const pick = candidates[0];
  if (!pick) return null;
  const [removed] = course.nodes.splice(pick.i, 1);
  return removed;
}

function assignmentAttempt(course, pack, targetLevelId) {
  const level = pack.levels[targetLevelId];
  const stations = course.nodes.map((n, i) => ({ n, i })).filter(x => x.n.kind === 'station');
  const uses = {};
  const quotas = (level.quotas || []).map(q => ({ ...q, set: new Set(q.signIds), count: 0 }));
  const followerSet = pack.sequenceFollowers;
  const assigned = new Map();
  const equipmentPlacements = [];
  let totalCost = 0;

  for (let pos = 0; pos < stations.length; pos++) {
    const { n: node, i: nodeIndex } = stations[pos];
    const req = requiredTurnAt(course.nodes, nodeIndex);
    const previousAssignedId = pos > 0 ? assigned.get(stations[pos - 1].n.stationId) : null;
    const pending = previousAssignedId ? pack.sequenceNext[previousAssignedId] : null;

    let candidates = (pending || level.allowedSigns)
      .map(id => pack.signs[id])
      .filter(Boolean)
      .filter(s => signFitsTurn(s, req))
      .filter(s => (uses[s.id] || 0) < maxUsesFor(pack, targetLevelId, s.id))
      .filter(s => pending || !(pack.dependentSigns || followerSet).has(s.id))
      .filter(s => {
        if (!s.space?.footprint) return true;
        const conflicts = equipmentPlacementConflicts({
          nodes: course.nodes,
          nodeIndex,
          sign: s,
          ring: course.ring,
          otherPlacements: equipmentPlacements,
          buffer: 1
        });
        return conflicts.length === 0;
      });

    if (!candidates.length) return null;

    const remaining = stations.length - pos;
    const urgent = quotas.filter(q => q.count < q.min && (q.min - q.count) >= remaining);
    if (urgent.length) {
      const filtered = candidates.filter(s => urgent.some(q => q.set.has(s.id)));
      if (filtered.length) candidates = filtered;
    }

    candidates.sort((a, b) => {
      const costA = a.id === node.signId ? 0 : (a.equipment ? 3 : 1);
      const costB = b.id === node.signId ? 0 : (b.equipment ? 3 : 1);
      const quotaA = quotas.reduce((v, q) => v + (q.count < q.min && q.set.has(a.id) ? -2 : 0), 0);
      const quotaB = quotas.reduce((v, q) => v + (q.count < q.min && q.set.has(b.id) ? -2 : 0), 0);
      return (costA + quotaA + Math.random() * 0.15) - (costB + quotaB + Math.random() * 0.15);
    });

    const chosen = candidates[0];
    assigned.set(node.stationId, chosen.id);
    if (chosen.space?.footprint) equipmentPlacements.push({ nodeIndex, sign: chosen });
    uses[chosen.id] = (uses[chosen.id] || 0) + 1;
    quotas.forEach(q => { if (q.set.has(chosen.id)) q.count++; });
    totalCost += chosen.id === node.signId ? 0 : (chosen.equipment ? 3 : 1);
  }

  if (!quotas.every(q => q.count >= q.min)) return null;

  // Reject a dangling sequence at the final station.
  const lastId = assigned.get(stations[stations.length - 1].n.stationId);
  if (pack.sequenceNext[lastId]) return null;

  return { assigned, totalCost };
}

function diffCourses(before, after) {
  const beforeStations=before.nodes.filter(n=>n.kind==='station');
  const afterStations=after.nodes.filter(n=>n.kind==='station');
  const b = new Map(beforeStations.map((n,i) => [n.stationId, {node:n,ordinal:i+1}]));
  const a = new Map(afterStations.map((n,i) => [n.stationId, {node:n,ordinal:i+1}]));
  const changes = [];

  for (const [id, oldEntry] of b) {
    const nextEntry = a.get(id);
    const oldNode=oldEntry.node;
    if (!nextEntry) {
      changes.push({ type: 'removed', stationId: id, from: oldNode.signId, beforeOrdinal:oldEntry.ordinal });
      continue;
    }
    const newNode=nextEntry.node;
    const moved = distance(oldNode, newNode) > 0.1;
    const swapped = oldNode.signId !== newNode.signId;
    if (moved) changes.push({
      type:'moved', stationId:id, feet:distance(oldNode,newNode),
      beforeOrdinal:oldEntry.ordinal, afterOrdinal:nextEntry.ordinal,
      from:oldNode.signId, to:newNode.signId
    });
    if (swapped) changes.push({
      type:'swapped', stationId:id, from:oldNode.signId, to:newNode.signId,
      beforeOrdinal:oldEntry.ordinal, afterOrdinal:nextEntry.ordinal
    });
    if (!moved && !swapped) changes.push({
      type:'kept', stationId:id, signId:newNode.signId,
      beforeOrdinal:oldEntry.ordinal, afterOrdinal:nextEntry.ordinal
    });
  }

  for (const [id, newEntry] of a) {
    if (!b.has(id)) changes.push({
      type:'added', stationId:id, to:newEntry.node.signId, afterOrdinal:newEntry.ordinal
    });
  }

  const counts = { kept: 0, swapped: 0, added: 0, removed: 0, moved: 0 };
  changes.forEach(c => counts[c.type]++);
  return {
    changes,
    counts,
    physicalSetupChanges: counts.swapped + counts.added + counts.removed + counts.moved
  };
}

export function upgradeCourse(current, pack, targetLevelId) {
  const target = pack.levels[targetLevelId];
  if (!target) throw new Error(`Unknown target level ${targetLevelId}`);
  if (target.generationEnabled === false) throw new Error(target.generationMessage || `Automatic level-up is not enabled for ${target.name} yet.`);
  const targetRange = stationNodeRange(target);

  const before = cloneCourse(current);

  function prepareBase(source) {
    const next = cloneCourse(source);
    next.parentCourseId = current.courseId;
    next.courseId = makeId('course');
    next.levelId = targetLevelId;
    next.name = `${pack.shortName} ${target.name}`;
    next.rulePackVersion = pack.version;
    next.organizationId = pack.id;

    const reserveLevelId = source.levelId;
    while (stationNodes(next).length < targetRange.min) {
      const inserted = insertIntoLargestGap(next, pack, reserveLevelId);
      if (!inserted) {
        throw new Error(`Could not add the required ${target.name} station without consuming an existing equipment working area or a reserved future-equipment bay.`);
      }
    }
    while (stationNodes(next).length > targetRange.max) removeLeastDisruptive(next, pack);
    recalcHeadings(next.nodes);
    return next;
  }

  function solve(candidate, structuralCost = 0, label = 'same-count') {
    const preferredByStationId = new Map(
      current.nodes.filter(n => n.kind === 'station').map(n => [n.stationId, n.signId])
    );

    let best = null;
    // Only packs/levels with actual sequence templates need the forced-sequence
    // search. CARO and CKC currently have no chain templates, so skipping the
    // empty forced pass keeps organization progression responsive.
    const hasSequenceTemplates = (pack.chainTemplates?.[targetLevelId] || []).length > 0;
    const modes = hasSequenceTemplates ? [false, true] : [false];

    for (const forceSequence of modes) {
      // Multiple organizations have overlapping quota families (for example
      // CKC stationary + level + jump quotas). A few more independent greedy
      // starts dramatically reduces false "no legal upgrade" failures without
      // changing the physical-layout preference model.
      for (let attempt = 0; attempt < 32; attempt++) {
        const assignment = assignSignsToNodes({
          pack,
          levelId: targetLevelId,
          nodes: candidate.nodes,
          ring: candidate.ring,
          includeSequences: forceSequence,
          forceSequence,
          preferredByStationId
        });
        if (!assignment) continue;

        const solved = cloneCourse(candidate);
        assignment.forEach((id, nodeIndex) => {
          if (solved.nodes[nodeIndex]?.kind === 'station') solved.nodes[nodeIndex].signId = id;
        });
        solved.nodes.filter(n => n.kind === 'station').forEach(n => {
          delete n.upgradeAdded;
          delete n.upgradeAddedAtEnd;
        });
        touchCourse(solved);
        recalcHeadings(solved.nodes);
        if (typeof pack.makeAuxiliary === 'function') solved.auxiliary = pack.makeAuxiliary(solved, pack) || [];

        // Do not spend a future mandatory-equipment bay merely to save a sign
        // swap at the current level. This keeps series progression practical.
        if (!progressionReserveFits(pack, targetLevelId, solved.nodes, solved.ring)) continue;

        const validation = validateCourse(solved, pack);
        if (validation.some(r => !r.ok && r.severity === 'error')) continue;

        let assignmentCost = 0;
        for (const n of solved.nodes) {
          if (n.kind !== 'station') continue;
          const oldId = preferredByStationId.get(n.stationId);
          if (!oldId) continue; // structural cost accounts for added stations
          if (oldId !== n.signId) assignmentCost += pack.signs[n.signId]?.equipment ? 3 : 1;
        }
        const total = assignmentCost + structuralCost;
        const candidateResult = {
          course: solved,
          solver: { total, structuralCost, label, forceSequence }
        };
        if (!best || total < best.solver.total) best = candidateResult;
      }
    }

    return best;
  }

  // Candidate A: preserve the current station count/layout as much as possible.
  const base = prepareBase(current);
  const solutions = [];

  const sameCount = solve(base, 0, 'same-count');
  if (sameCount) solutions.push(sameCount);

  const baseCount = stationNodes(base).length;
  const room = Math.max(0, targetRange.max - baseCount);
  const maxExtras = Math.min(3, room);

  // Candidate family B: add one station at the end when possible.
  // This is extremely cheap for a judge to build and often avoids multiple swaps.
  if (maxExtras >= 1) {
    const endAdded = tryAddStationAtEnd(base);
    if (endAdded) {
      const withEnd = solve(endAdded, 0.45, 'add-1-end');
      if (withEnd) solutions.push(withEnd);
    }
  }

  // Candidate family C: add up to three stations into the largest clean gaps.
  // Existing station coordinates are not moved. This deliberately favors
  // "keep almost everything, add a few signs" over rewriting the course.
  for (let extras = 1; extras <= maxExtras; extras++) {
    const variant = cloneCourse(base);
    let inserted = 0;
    for (let n = 0; n < extras; n++) {
      const id = insertIntoLargestGap(variant, pack, targetLevelId);
      if (!id) break;
      inserted++;
      recalcHeadings(variant.nodes);
    }
    if (inserted !== extras) continue;

    // Each added station costs less than one ordinary sign substitution.
    // Slightly increasing marginal cost prevents unnecessary additions when
    // the same number of swaps can solve the course.
    const structuralCost = extras * 0.55;
    const solved = solve(variant, structuralCost, `add-${extras}-gap`);
    if (solved) solutions.push(solved);
  }

  // Candidate family D: one cheap end addition plus additional gap stations.
  if (maxExtras >= 2) {
    const variant = tryAddStationAtEnd(base);
    if (variant) {
      let inserted = 1;
      for (let n = 1; n < maxExtras; n++) {
        const id = insertIntoLargestGap(variant, pack, targetLevelId);
        if (!id) break;
        inserted++;
        recalcHeadings(variant.nodes);
        const solved = solve(
          variant,
          0.45 + (inserted - 1) * 0.55,
          `add-${inserted}-mixed`
        );
        if (solved) solutions.push(solved);
      }
    }
  }

  if (!solutions.length) {
    throw new Error('Could not produce a legal minimum-change upgrade with the retained layout. The solver tried the existing station count plus added-flow variants while respecting level quotas, sign direction, sequences, and equipment footprints.');
  }

  // Pick the course requiring the least real setup effort.
  solutions.sort((a, b) =>
    a.solver.total - b.solver.total ||
    a.solver.structuralCost - b.solver.structuralCost
  );

  const chosen = solutions[0];
  const report = diffCourses(before, chosen.course);
  report.strategy = chosen.solver.label;
  report.optimizationCost = chosen.solver.total;
  report.addedAtEnd = chosen.solver.label.includes('end') || chosen.solver.label.includes('mixed');
  report.addedForFlow = report.counts.added > 0;
  report.strategyLabel = chosen.solver.label;

  return { course: chosen.course, report };
}

