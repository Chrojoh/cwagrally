import { makeCourse, makeId } from './model.js';
import { equipmentPlacementConflicts, makeVariedRoute, recalcHeadings, requiredTurnAt, signFitsTurn } from './geometry.js';
import { joinedRuleFor, maxUsesFor, refreshJoinedFlags } from './rules.js';
import { isCourseValid } from './validator.js';
import { evaluateCourseQuality } from './quality.js';
import { ringRuleIssues, ringRuleText, stationNodeRange } from './pack.js';

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
  const range = stationNodeRange(level);
  // Prefer a count that remains legal as the course advances in a simple
  // progression track. Branching organizations may define only a local track.
  let preferredMin = range.min;
  const track = level.progressionTrack || [];
  const here = track.indexOf(levelId);
  if (here >= 0) {
    for (const futureId of track.slice(here)) {
      const future = pack.levels[futureId];
      if (future) preferredMin = Math.max(preferredMin, stationNodeRange(future).min);
    }
  }
  preferredMin = Math.min(preferredMin, range.max);
  return preferredMin + Math.floor(Math.random() * (range.max - preferredMin + 1));
}

function chooseCountForRoute(pack, levelId, routeStyle) {
  // Zoom Angled Flow deliberately keeps the lower Zoom levels at 16 stations
  // and Zoom 2 at 17. This leaves enough long working gaps for the equipment
  // and special sign pools while still requiring only one added station when
  // progressing from Zoom 1/1.5 to Zoom 2.
  if (routeStyle === 'zoom-angled-flow') {
    if (levelId === 'Z1' || levelId === 'Z15') return 16;
    if (levelId === 'Z2') return 17;
  }
  return chooseCount(pack, levelId);
}


export function progressionReserveFits(pack, levelId, nodes, ring) {
  const requirements = pack.progressionReserve?.[levelId] || [];
  if (!requirements.length) return true;

  for (const req of requirements) {
    const min = Math.max(0, req.min || 0);
    if (!min) continue;

    const signIds = req.signIds || [];
    const options = [];
    for (let nodeIndex = 1; nodeIndex < nodes.length - 1; nodeIndex++) {
      if (nodes[nodeIndex]?.kind !== 'station') continue;
      const turn = requiredTurnAt(nodes, nodeIndex);
      const signs = signIds
        .map(id => pack.signs[id])
        .filter(Boolean)
        .filter(sign => sign.space?.footprint)
        .filter(sign => signFitsTurn(sign, turn));
      if (signs.length) options.push({ nodeIndex, signs });
    }

    // Scarce future equipment must have enough genuinely usable bays, not just
    // enough straight station dots. Backtracking checks the full working
    // footprint, unrelated route legs, ring edges and overlap between bays.
    const stationOrder = new Map();
    nodes.forEach((node, nodeIndex) => {
      if (node?.kind === 'station') stationOrder.set(nodeIndex, stationOrder.size);
    });
    const minStationSeparation = Math.max(1, req.minStationSeparation || 1);
    const anchorIds = new Set(req.anchorCurrentSignIds || []);
    const picks = [];

    // Some progressions need the *existing* lower-level equipment position to
    // remain one of the future working bays. CKC Advanced→Excellent is the
    // key example: Advanced already contains one jump, while Excellent needs
    // two nonconsecutive jumps. Reserving two arbitrary empty bays is not
    // enough if neither includes the actual Advanced jump station.
    const hasAssignedStationSigns = nodes.some(node => node?.kind === 'station' && node.signId);
    if (anchorIds.size && hasAssignedStationSigns) {
      for (let nodeIndex = 1; nodeIndex < nodes.length - 1; nodeIndex++) {
        const node = nodes[nodeIndex];
        if (node?.kind !== 'station' || !anchorIds.has(node.signId)) continue;
        const sign = pack.signs[node.signId];
        if (!sign?.space?.footprint || !signIds.includes(sign.id)) continue;
        const turn = requiredTurnAt(nodes, nodeIndex);
        if (!signFitsTurn(sign, turn)) return false;
        const conflicts = equipmentPlacementConflicts({
          nodes, nodeIndex, sign, ring, otherPlacements:picks,
          buffer:req.buffer ?? 1
        });
        if (conflicts.length) return false;
        picks.push({ nodeIndex, sign });
      }
      if ((req.requireAnchorCount || 0) > picks.length) return false;
    }

    function separatedFromPicks(nodeIndex) {
      const ord = stationOrder.get(nodeIndex);
      if (ord == null) return false;
      return picks.every(p => {
        const other = stationOrder.get(p.nodeIndex);
        return other == null || Math.abs(ord - other) >= minStationSeparation;
      });
    }

    function search(start, need) {
      if (need <= 0) return true;
      if (options.length - start < need) return false;
      for (let i = start; i < options.length; i++) {
        const slot = options[i];
        if (picks.some(p => p.nodeIndex === slot.nodeIndex)) continue;
        if (!separatedFromPicks(slot.nodeIndex)) continue;
        for (const sign of slot.signs) {
          const conflicts = equipmentPlacementConflicts({
            nodes,
            nodeIndex: slot.nodeIndex,
            sign,
            ring,
            otherPlacements: picks,
            buffer: req.buffer ?? 1
          });
          if (conflicts.length) continue;
          picks.push({ nodeIndex: slot.nodeIndex, sign });
          if (search(i + 1, need - 1)) return true;
          picks.pop();
        }
      }
      return false;
    }

    if (!search(0, Math.max(0, min - picks.length))) return false;
  }

  return true;
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
      .filter(s => s.generatorEligible !== false)
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
    if ((uses[sign.id] || 0) >= maxUsesFor(pack, levelId, sign.id)) return false;
    for (const quota of level.quotas || []) {
      if (quota.max == null || !quota.signIds.includes(sign.id)) continue;
      const set = new Set(quota.signIds);
      let used = 0;
      for (const [id, n] of Object.entries(uses)) if (set.has(id)) used += n;
      if (used >= quota.max) return false;
    }
    return true;
  }

  const stationOrdinal = new Map(stationIndices.map((nodeIndex, ordinal) => [nodeIndex, ordinal]));

  function assignmentCompatible(sign, nodeIndex, assignments) {
    // Organization/level packs can mark a family of exercises as nonconsecutive.
    // This is intentionally generic: CKC uses it for the two Excellent/Master
    // jump exercises, while other organizations can use the same mechanism.
    for (const rule of level.nonConsecutiveSets || []) {
      const set = new Set(rule.signIds || []);
      if (!set.has(sign.id)) continue;
      const ord = stationOrdinal.get(nodeIndex);
      const minSep = Math.max(2, rule.minStationSeparation || 2);
      for (const [otherIndex, otherId] of assignments.entries()) {
        if (!set.has(otherId)) continue;
        const otherOrd = stationOrdinal.get(otherIndex);
        if (ord != null && otherOrd != null && Math.abs(ord - otherOrd) < minSep) return false;
      }
    }

    // Check equipment against equipment already committed by this partial
    // assignment. This prevents the quota allocator from choosing two jump
    // bays that are individually legal but overlap each other's working area.
    if (sign.space?.footprint) {
      const otherPlacements = [];
      for (const [otherIndex, otherId] of assignments.entries()) {
        const otherSign = pack.signs[otherId];
        if (otherSign?.space?.footprint) otherPlacements.push({ nodeIndex:otherIndex, sign:otherSign });
      }
      if (equipmentPlacementConflicts({
        nodes, nodeIndex, sign, ring, otherPlacements, buffer:1
      }).length) return false;
    }
    return true;
  }

  function distanceRuleFits(fromId, toId, aIndex, bIndex) {
    // Joined front-position exercises are placed together after sign assignment.
    if (joinedRuleFor(pack, fromId, toId)) return true;

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

  function chainPlacements() {
    if (!includeSequences) return [];
    if (!forceSequence && Math.random() > 0.72) return [];

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

    placements.sort((a, b) => {
      if (forceSequence && a.quotaGain !== b.quotaGain) return b.quotaGain - a.quotaGain;
      return b.preserve - a.preserve || a.chain.length - b.chain.length || b.jitter - a.jitter;
    });
    return placements;
  }

  // Fresh generation gets a broad randomized search. Upgrade solving already
  // calls this function repeatedly with a preferred station map, so cap each
  // inner search to keep organization/level changes responsive instead of
  // multiplying 180 attempts by every upgrade candidate.
  const assignmentAttempts = preferredByStationId ? 80 : 180;
  for (let attempt = 0; attempt < assignmentAttempts; attempt++) {
    const uses = {};
    const assignments = new Map();
    let failed = false;

    const placements = chainPlacements();
    if (forceSequence && includeSequences && !placements.length) continue;

    // Normal generation inserts at most one optional sequence. During a forced
    // sequence solve (used by minimum-change upgrades), allow multiple disjoint
    // legal chains. This matters for levels whose quota can only be reached by
    // more than one leave-dog sequence without forcing optional equipment.
    let chainsUsed = 0;
    let forcedQuotaGain = 0;
    const chainLimit = forceSequence ? 3 : 1;
    for (const placement of placements) {
      if (chainsUsed >= chainLimit) break;
      if (placement.slots.some(idx => assignments.has(idx))) continue;

      const localUses = { ...uses };
      let ok = true;
      for (let k = 0; k < placement.chain.length; k++) {
        const sign = pack.signs[placement.chain[k]];
        if (!available(sign, localUses)) { ok = false; break; }
        localUses[sign.id] = (localUses[sign.id] || 0) + 1;
      }
      if (!ok) continue;

      for (let k = 0; k < placement.chain.length; k++) {
        const id = placement.chain[k];
        const idx = placement.slots[k];
        assignments.set(idx, id);
        uses[id] = (uses[id] || 0) + 1;
      }
      chainsUsed++;
      forcedQuotaGain += placement.quotaGain;

      if (!forceSequence) break;
      // Two quota-contributing sequence signs are enough to unlock the scarce
      // C-WAGS Zoom-2 pool while keeping ARF/other forced solves conservative.
      if (forcedQuotaGain >= 2) break;
    }
    if (forceSequence && includeSequences && chainsUsed === 0) continue;

    // Allocate the scarcest quotas first. A mandatory jump may have only one
    // geometry-compatible bay; filling that bay with a generic level sign first
    // would make a perfectly legal course appear impossible.
    const orderedQuotas = [...(level.quotas || [])]
      .map(q => {
        const set = new Set(q.signIds);
        const eligibleSlots = stationIndices.filter(i =>
          baseCandidates.get(i).some(sign => set.has(sign.id))
        ).length;
        return { q, slack: eligibleSlots - (q.min || 0), eligibleSlots };
      })
      .sort((a, b) => a.slack - b.slack || (b.q.min || 0) - (a.q.min || 0));

    for (const { q: quota } of orderedQuotas) {
      const quotaSet = new Set(quota.signIds);
      let have = [...assignments.values()].filter(id => quotaSet.has(id)).length;
      let need = Math.max(0, quota.min - have);

      while (need > 0) {
        const options = stationIndices
          .filter(i => !assignments.has(i))
          .map(i => {
            const signs = baseCandidates.get(i).filter(s =>
              quotaSet.has(s.id) && available(s, uses) && assignmentCompatible(s, i, assignments)
            );
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
      let candidates = slot.candidates.filter(s => available(s, uses) && assignmentCompatible(s, slot.i, assignments));
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

    // Enforce nonconsecutive families once more on the complete assignment.
    let nonConsecutiveOk = true;
    for (const rule of level.nonConsecutiveSets || []) {
      const set = new Set(rule.signIds || []);
      const ords = [...withChain.entries()]
        .filter(([, id]) => set.has(id))
        .map(([idx]) => stationOrdinal.get(idx))
        .filter(v => v != null)
        .sort((a,b) => a-b);
      const minSep = Math.max(2, rule.minStationSeparation || 2);
      for (let i = 1; i < ords.length; i++) {
        if (ords[i] - ords[i-1] < minSep) { nonConsecutiveOk = false; break; }
      }
      if (!nonConsecutiveOk) break;
    }
    if (!nonConsecutiveOk) continue;

    // Reject the sign assignment before building the course if any equipment
    // working envelope clashes with the ring, another station, another piece
    // of equipment, or an unrelated route segment.
    const equipmentPlacements = [];
    let footprintOk = true;
    for (const [nodeIndex, signId] of withChain.entries()) {
      const sign = pack.signs[signId];
      if (!sign?.space?.footprint) continue;
      const conflicts = equipmentPlacementConflicts({
        nodes, nodeIndex, sign, ring, otherPlacements: equipmentPlacements, buffer: 1
      });
      if (conflicts.length) {
        footprintOk = false;
        break;
      }
      equipmentPlacements.push({ nodeIndex, sign });
    }
    if (!footprintOk) continue;

    return withChain;
  }

  return null;
}


function applyJoinedDisplayLayout(nodes, pack) {
  // Generated joined signs are drawn close together. The 3-ft value is a
  // course-map display convention, not an additional C-WAGS rule.
  for (let i = 1; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    if (a?.kind !== 'station' || b?.kind !== 'station') continue;
    const rule = joinedRuleFor(pack, a.signId, b.signId);
    if (!rule) continue;

    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const target = rule.displayGap ?? 3;
    if (d > target + 0.01 && d > 0.001) {
      // Only collapse a straight joined continuation. If either sign is a
      // physical course turn, leave coordinates alone and let validation show it.
      const turnA = Math.abs(requiredTurnAt(nodes, i));
      const turnB = Math.abs(requiredTurnAt(nodes, i + 1));
      if (turnA <= 28 && turnB <= 28) {
        b.x = a.x + dx / d * target;
        b.y = a.y + dy / d * target;
      }
    }
  }
  recalcHeadings(nodes);

  // Store explicit map semantics for drawing, PDF export and later editing.
  const pseudoCourse = { nodes };
  refreshJoinedFlags(pseudoCourse, pack);
}

export function assignSignsToNodes({ pack, levelId, nodes, ring, includeSequences = false, preferredByStationId = null, forceSequence = false }) {
  return assignSigns({ pack, levelId, nodes, ring, includeSequences, preferredByStationId, forceSequence });
}

export function generateCourse({ pack, levelId, ring, includeSequences = false, routeStyle = 'mixed' }) {
  const level = pack.levels[levelId];
  if (!level) throw new Error(`Unknown level ${levelId}`);
  if (level.generationEnabled === false) {
    throw new Error(level.generationMessage || `Automatic generation is not enabled for ${level.name} in this rule pack yet.`);
  }

  // Zoom uses its own angled geometry because its sign pools and quota
  // structure need more straight working bays than the regular Angled Flow.
  const zoomTrack = level.routeProfile === 'cwags-zoom' || level.progressionTrack?.[0] === 'Z1';
  const effectiveRouteStyle = zoomTrack
    ? (routeStyle === 'classic'
        ? 'classic'
        : routeStyle === 'mixed'
          ? 'zoom-mixed'
          : 'zoom-angled-flow')
    : routeStyle;

  const ringIssues = ringRuleIssues(level, ring);
  if (ringIssues.length) {
    throw new Error(`Ring does not meet ${level.name} requirements (${ringRuleText(level)}): ${ringIssues.join('; ')}.`);
  }

  // Try different counts/routes. The strict geometry matcher never widens to 180°.
  // A legal course is not automatically a well-designed course, so generation
  // now aims for an overall judge-quality score of at least 80/100.
  const QUALITY_TARGET = 80;
  const maxAttempts = ['angled-x','angled-flow'].includes(effectiveRouteStyle)
    ? 90
    : Object.keys(pack.progressionReserve || {}).length
      ? 140
      : 100;
  let bestLegalCourse = null;
  let bestQuality = -1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const count = chooseCountForRoute(pack, levelId, effectiveRouteStyle);
    let points;
    try {
      points = makeVariedRoute({
        count, width: ring.width, height: ring.height, style: effectiveRouteStyle,
        drawingFloor: level.layout?.preferredGap ?? pack.layout?.preferredGap ?? 8
      });
    } catch {
      continue;
    }

    const nodes = points.map((p, i) => {
      if (i === 0) return { kind: 'start', stationId: makeId('start'), ...p, heading: 0 };
      if (i === points.length - 1) return { kind: 'finish', stationId: makeId('finish'), ...p, heading: 0 };
      return { kind: 'station', stationId: makeId('st'), signId: null, ...p, heading: 0, locked: false };
    });
    recalcHeadings(nodes);

    // Some organizations introduce mandatory obstacles at the next level.
    // Lower-level generation can reserve future equipment bays so minimum-change
    // level progression does not later fail simply because the route consumed all
    // usable jump/tunnel space. This is progression planning, not a legality rule.
    if (!progressionReserveFits(pack, levelId, nodes, ring)) continue;

    const assignments = assignSigns({ pack, levelId, nodes, ring, includeSequences });
    if (!assignments) continue;
    assignments.forEach((id, idx) => nodes[idx].signId = id);
    applyJoinedDisplayLayout(nodes, pack);

    const course = makeCourse({ pack, levelId, ring, nodes });
    if (typeof pack.makeAuxiliary === 'function') course.auxiliary = pack.makeAuxiliary(course, pack) || [];
    course.routeFamily = points.routeFamily || routeStyle;
    refreshJoinedFlags(course, pack);
    if (!isCourseValid(course, pack)) continue;

    const quality = evaluateCourseQuality(course, pack);
    if (quality.overall > bestQuality) {
      bestQuality = quality.overall;
      bestLegalCourse = course;
    }
    if (quality.overall >= QUALITY_TARGET) return course;
  }

  // Explicit route families can be intentionally demanding. If no candidate
  // reaches the quality target, return the best fully legal course so the
  // judge can see the score/warnings and edit it rather than getting no course.
  if (bestLegalCourse) return bestLegalCourse;

  throw new Error('Could not generate a fully valid course with this ring and rule combination. Try different ring dimensions or disable sequence exercises.');
}
