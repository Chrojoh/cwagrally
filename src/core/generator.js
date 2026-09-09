import { makeCourse, makeId } from './model.js';
import { equipmentPlacementConflicts, makeVariedRoute, recalcHeadings, requiredTurnAt, signFitsTurn } from './geometry.js';
import { maxUsesFor } from './rules.js';
import { isCourseValid } from './validator.js';

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chooseCount(pack, levelId) {
  const level = pack.levels[levelId];
  // Prefer a station count that is legal now and already satisfies the minimum
  // of later levels in the same progression track. This reduces setup changes.
  let preferredMin = level.stationCount.min;
  const track = level.progressionTrack || [];
  const here = track.indexOf(levelId);
  if (here >= 0) {
    for (const futureId of track.slice(here)) {
      const future = pack.levels[futureId];
      if (future) preferredMin = Math.max(preferredMin, future.stationCount.min);
    }
  }
  preferredMin = Math.min(preferredMin, level.stationCount.max);
  return preferredMin + Math.floor(Math.random() * (level.stationCount.max - preferredMin + 1));
}

function assignSigns({ pack, levelId, nodes, ring, includeSequences, preferredByStationId = null, forceSequence = false }) {
  const level = pack.levels[levelId];
  const stationIndices = nodes.map((n, i) => n.kind === 'station' ? i : -1).filter(i => i >= 0);
  const dependent = pack.dependentSigns || new Set();
  const preferredForIndex = nodeIndex => preferredByStationId?.get(nodes[nodeIndex]?.stationId) || null;

  const baseCandidates = new Map();
  for (const nodeIndex of stationIndices) {
    const req = requiredTurnAt(nodes, nodeIndex);
    const candidates = level.allowedSigns
      .map(id => pack.signs[id])
      .filter(Boolean)
      .filter(s => signFitsTurn(s, req))
      // Eliminate equipment choices that cannot physically fit this slot before
      // the quota allocator sees them. This prevents optional Table/Tunnel/Jump
      // exercises from crowding out perfectly valid non-equipment ARF choices.
      .filter(s => !s.space?.footprint || equipmentPlacementConflicts({
        nodes, nodeIndex, sign:s, ring, otherPlacements:[], buffer:1
      }).length === 0)
      // Sequence/state-dependent exercises are inserted only as complete chains.
      .filter(s => !dependent.has(s.id));
    if (!candidates.length) return null;
    baseCandidates.set(nodeIndex, candidates);
  }

  function available(sign, uses) {
    return (uses[sign.id] || 0) < maxUsesFor(pack, levelId, sign.id);
  }

  function distanceRuleFits(fromId, toId, aIndex, bIndex) {
    const rule = (pack.adjacentDistanceRules || [])
      .find(r => r.from.includes(fromId) && r.to.includes(toId));
    if (!rule) return true;

    const a = nodes[aIndex], b = nodes[bIndex];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (rule.target != null && Math.abs(d - rule.target) > (rule.tolerance ?? 1)) return false;
    if (rule.min != null && d + 1e-6 < rule.min) return false;
    if (rule.max != null && d - 1e-6 > rule.max) return false;
    return true;
  }

  function chooseInitialChain() {
    if (!includeSequences) return null;
    if (!forceSequence && Math.random() > 0.72) return null;

    const templates = (pack.chainTemplates?.[levelId] || [])
      .filter(chain => chain.every(id => level.allowedSigns.includes(id)));
    const placements = [];

    for (const chain of templates) {
      const len = chain.length;
      for (let p = 0; p <= stationIndices.length - len; p++) {
        const slots = stationIndices.slice(p, p + len);
        let ok = true;
        for (let k = 0; k < len; k++) {
          const sign = pack.signs[chain[k]];
          const req = requiredTurnAt(nodes, slots[k]);
          if (!sign || !signFitsTurn(sign, req)) { ok = false; break; }
          if (k > 0 && !distanceRuleFits(chain[k - 1], chain[k], slots[k - 1], slots[k])) { ok = false; break; }
        }
        if (!ok) continue;

        // Favor placements that preserve existing signs when upgrading.
        let preserve = 0;
        for (let k = 0; k < len; k++) {
          if (preferredForIndex(slots[k]) === chain[k]) preserve++;
        }
        const quotaGain = (level.quotas || []).reduce((gain, q) => {
          const set = new Set(q.signIds);
          return gain + chain.filter(id => set.has(id)).length;
        }, 0);
        placements.push({ chain, slots, preserve, quotaGain, jitter: Math.random() });
      }
    }

    if (!placements.length) return null;
    placements.sort((a, b) => {
      // During a forced sequence (used by the level-up solver), prefer a chain
      // that actually contributes to the target-level quota. Otherwise a
      // perfectly preserved pace chain could crowd out the ARF-class sequence
      // needed to reach the 8-exercise minimum without equipment.
      if (forceSequence && a.quotaGain !== b.quotaGain) return b.quotaGain - a.quotaGain;
      return b.preserve - a.preserve || b.jitter - a.jitter;
    });
    return placements[0];
  }

  for (let attempt = 0; attempt < 180; attempt++) {
    const uses = {};
    const assignments = new Map();
    let failed = false;

    const initialChain = chooseInitialChain();
    if (forceSequence && includeSequences && !initialChain) continue;
    if (initialChain) {
      for (let k = 0; k < initialChain.chain.length; k++) {
        const id = initialChain.chain[k];
        const idx = initialChain.slots[k];
        const sign = pack.signs[id];
        if (!available(sign, uses)) { failed = true; break; }
        assignments.set(idx, id);
        uses[id] = (uses[id] || 0) + 1;
      }
      if (failed) continue;
    }

    // Allocate quota signs first, but only from state-independent exercises.
    for (const quota of [...(level.quotas || [])].sort((a, b) => b.min - a.min)) {
      const quotaSet = new Set(quota.signIds);
      let have = [...assignments.values()].filter(id => quotaSet.has(id)).length;
      let need = Math.max(0, quota.min - have);

      while (need > 0) {
        const options = stationIndices
          .filter(i => !assignments.has(i))
          .map(i => {
            const signs = baseCandidates.get(i).filter(s => quotaSet.has(s.id) && available(s, uses));
            return { i, signs };
          })
          .filter(x => x.signs.length)
          .sort((a, b) => {
            const ap = a.signs.some(s => s.id === preferredForIndex(a.i)) ? -1 : 0;
            const bp = b.signs.some(s => s.id === preferredForIndex(b.i)) ? -1 : 0;
            return ap - bp || a.signs.length - b.signs.length || Math.random() - 0.5;
          });

        if (!options.length) { failed = true; break; }

        const pool = options.slice(0, Math.min(4, options.length));
        const pickSlot = pool[Math.floor(Math.random() * pool.length)];
        const preferredId = preferredForIndex(pickSlot.i);
        const signs = [...pickSlot.signs].sort((a, b) => {
          const au = uses[a.id] || 0, bu = uses[b.id] || 0;
          const ae = a.equipment ? 4 : 0, be = b.equipment ? 4 : 0;
          const ap = a.id === preferredId ? -6 : 0;
          const bp = b.id === preferredId ? -6 : 0;
          return (ap + au + ae * 0.25 + Math.random() * 0.3) - (bp + bu + be * 0.25 + Math.random() * 0.3);
        });
        const sign = signs[0];
        assignments.set(pickSlot.i, sign.id);
        uses[sign.id] = (uses[sign.id] || 0) + 1;
        need--;
      }
      if (failed) break;
    }
    if (failed) continue;

    const remaining = stationIndices
      .filter(i => !assignments.has(i))
      .map(i => ({ i, candidates: baseCandidates.get(i) }))
      .sort((a, b) => a.candidates.length - b.candidates.length || Math.random() - 0.5);

    for (const slot of remaining) {
      let candidates = slot.candidates.filter(s => available(s, uses));
      if (!candidates.length) { failed = true; break; }

      const preferredId = preferredForIndex(slot.i);
      candidates = [...candidates].sort((a, b) => {
        const au = uses[a.id] || 0, bu = uses[b.id] || 0;
        const ae = a.equipment ? 3 : 0, be = b.equipment ? 3 : 0;
        const ap = a.id === preferredId ? -5 : 0;
        const bp = b.id === preferredId ? -5 : 0;
        return (ap + au + ae + Math.random() * 0.7) - (bp + bu + be + Math.random() * 0.7);
      });
      const sign = candidates[0];
      assignments.set(slot.i, sign.id);
      uses[sign.id] = (uses[sign.id] || 0) + 1;
    }
    if (failed) continue;

    const withChain = assignments;

    const ids = [...withChain.values()];
    const quotasOk = (level.quotas || []).every(q => {
      const set = new Set(q.signIds);
      return ids.filter(id => set.has(id)).length >= q.min;
    });
    if (!quotasOk) continue;

    // Reject the sign assignment before building the course if any equipment
    // working envelope clashes with the ring, another station, another piece
    // of equipment, or an unrelated route segment.
    const placements = [];
    let footprintOk = true;
    for (const [nodeIndex, signId] of withChain.entries()) {
      const sign = pack.signs[signId];
      if (!sign?.space?.footprint) continue;
      const conflicts = equipmentPlacementConflicts({
        nodes, nodeIndex, sign, ring, otherPlacements: placements, buffer: 1
      });
      if (conflicts.length) {
        footprintOk = false;
        break;
      }
      placements.push({ nodeIndex, sign });
    }
    if (!footprintOk) continue;

    return withChain;
  }

  return null;
}

export function assignSignsToNodes({ pack, levelId, nodes, ring, includeSequences = false, preferredByStationId = null, forceSequence = false }) {
  return assignSigns({ pack, levelId, nodes, ring, includeSequences, preferredByStationId, forceSequence });
}

export function generateCourse({ pack, levelId, ring, includeSequences = false }) {
  const level = pack.levels[levelId];
  if (!level) throw new Error(`Unknown level ${levelId}`);

  const area = ring.width * ring.height;
  if (area < level.ringArea.min || area > level.ringArea.max) {
    throw new Error(`Ring area must be ${level.ringArea.min}–${level.ringArea.max} sq ft for ${level.name}.`);
  }

  // Try different counts/routes. The strict geometry matcher never widens to 180°.
  for (let attempt = 0; attempt < 100; attempt++) {
    const count = chooseCount(pack, levelId);
    let points;
    try {
      points = makeVariedRoute({ count, width: ring.width, height: ring.height });
    } catch {
      continue;
    }

    const nodes = points.map((p, i) => {
      if (i === 0) return { kind: 'start', stationId: makeId('start'), ...p, heading: 0 };
      if (i === points.length - 1) return { kind: 'finish', stationId: makeId('finish'), ...p, heading: 0 };
      return { kind: 'station', stationId: makeId('st'), signId: null, ...p, heading: 0, locked: false };
    });
    recalcHeadings(nodes);

    const assignments = assignSigns({ pack, levelId, nodes, ring, includeSequences });
    if (!assignments) continue;
    assignments.forEach((id, idx) => nodes[idx].signId = id);

    const course = makeCourse({ pack, levelId, ring, nodes });
    if (isCourseValid(course, pack)) return course;
  }

  throw new Error('Could not generate a fully valid course with this ring and rule combination. Try different ring dimensions or disable sequence exercises.');
}
