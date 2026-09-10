export function normalizeAngle(a) {
  return ((a % 360) + 360) % 360;
}

export function angleDiff(from, to) {
  let d = normalizeAngle(to - from);
  if (d > 180) d -= 360;
  return d;
}

export function headingBetween(a, b) {
  return normalizeAngle(Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI);
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function circularDeltaError(a, b) {
  return Math.abs(angleDiff(a, b));
}

export function requiredTurnAt(nodes, nodeIndex) {
  if (nodeIndex <= 0 || nodeIndex >= nodes.length - 1) return 0;

  // Venue detour waypoints shape the walking line between exercises; they are
  // not rally stations and therefore must not manufacture a turn requirement
  // at the neighboring sign. Determine exercise geometry from the nearest real
  // route anchors on each side of the station.
  let prevIndex=nodeIndex-1;
  while(prevIndex>=0 && nodes[prevIndex]?.kind==='waypoint') prevIndex--;
  let nextIndex=nodeIndex+1;
  while(nextIndex<nodes.length && nodes[nextIndex]?.kind==='waypoint') nextIndex++;
  if(prevIndex<0 || nextIndex>=nodes.length) return 0;

  const incoming = headingBetween(nodes[prevIndex], nodes[nodeIndex]);
  const outgoing = headingBetween(nodes[nodeIndex], nodes[nextIndex]);
  return angleDiff(incoming, outgoing);
}

export function signFitsTurn(sign, requiredTurn, tolerance = 28) {
  if (sign?.motion?.flexibleExit) return true;
  const allowed = Array.isArray(sign?.motion?.turnOptions)
    ? sign.motion.turnOptions
    : [sign?.motion?.turnDelta ?? 0];
  const tol = sign?.motion?.tolerance ?? tolerance;
  return allowed.some(td => circularDeltaError(td, requiredTurn) <= tol);
}

export function recalcHeadings(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    if (i === 0 && nodes.length > 1) nodes[i].heading = headingBetween(nodes[0], nodes[1]);
    else if (i > 0) nodes[i].heading = headingBetween(nodes[i - 1], nodes[i]);
  }
  return nodes;
}


export function outgoingHeadingAt(nodes, nodeIndex) {
  if (nodeIndex < nodes.length - 1) return headingBetween(nodes[nodeIndex], nodes[nodeIndex + 1]);
  if (nodeIndex > 0) return headingBetween(nodes[nodeIndex - 1], nodes[nodeIndex]);
  return 0;
}

function headingVectors(heading) {
  const r = heading * Math.PI / 180;
  // Compass heading: 0=N, 90=E.
  const forward = { x: Math.sin(r), y: -Math.cos(r) };
  const right = { x: Math.cos(r), y: Math.sin(r) };
  return { forward, right };
}

export function equipmentFootprintFor(sign, nodes, nodeIndex) {
  const cfg = sign?.space?.footprint;
  if (!cfg) return null;

  const node = nodes[nodeIndex];
  const heading = outgoingHeadingAt(nodes, nodeIndex);
  const { forward, right } = headingVectors(heading);

  const back = cfg.back ?? 0;
  const forwardFt = cfg.forward ?? 0;
  const halfWidth = cfg.halfWidth ?? 0;
  const centerOffset = cfg.centerOffset ?? 0;

  const center = {
    x: node.x + forward.x * centerOffset,
    y: node.y + forward.y * centerOffset
  };

  const localToWorld = (along, across) => ({
    x: center.x + forward.x * along + right.x * across,
    y: center.y + forward.y * along + right.y * across
  });

  const corners = [
    localToWorld(-back, -halfWidth),
    localToWorld(-back,  halfWidth),
    localToWorld( forwardFt,  halfWidth),
    localToWorld( forwardFt, -halfWidth)
  ];

  return {
    kind: cfg.kind || sign.space.kind || 'equipment',
    label: cfg.label || sign.id,
    heading,
    center,
    forward,
    right,
    back,
    forwardFt,
    halfWidth,
    corners,
    width: halfWidth * 2,
    length: back + forwardFt
  };
}

export function pointInEquipmentFootprint(point, fp, buffer = 0) {
  if (!fp) return false;
  const dx = point.x - fp.center.x;
  const dy = point.y - fp.center.y;
  const along = dx * fp.forward.x + dy * fp.forward.y;
  const across = dx * fp.right.x + dy * fp.right.y;
  return along >= -fp.back - buffer &&
         along <= fp.forwardFt + buffer &&
         Math.abs(across) <= fp.halfWidth + buffer;
}

export function segmentIntersectsEquipmentFootprint(a, b, fp, buffer = 0) {
  if (!fp) return false;
  if (pointInEquipmentFootprint(a, fp, buffer) || pointInEquipmentFootprint(b, fp, buffer)) return true;

  // Buffer is approximated by expanding the local rectangle.
  const expanded = buffer
    ? {
        ...fp,
        back: fp.back + buffer,
        forwardFt: fp.forwardFt + buffer,
        halfWidth: fp.halfWidth + buffer,
        corners: null
      }
    : fp;

  let corners = expanded.corners;
  if (!corners) {
    const localToWorld = (along, across) => ({
      x: expanded.center.x + expanded.forward.x * along + expanded.right.x * across,
      y: expanded.center.y + expanded.forward.y * along + expanded.right.y * across
    });
    corners = [
      localToWorld(-expanded.back, -expanded.halfWidth),
      localToWorld(-expanded.back,  expanded.halfWidth),
      localToWorld( expanded.forwardFt,  expanded.halfWidth),
      localToWorld( expanded.forwardFt, -expanded.halfWidth)
    ];
  }

  for (let i = 0; i < 4; i++) {
    if (segmentsCross(a, b, corners[i], corners[(i + 1) % 4])) return true;
  }
  return false;
}

export function equipmentFootprintsOverlap(a, b, buffer = 0) {
  if (!a || !b) return false;

  for (const p of a.corners) if (pointInEquipmentFootprint(p, b, buffer)) return true;
  for (const p of b.corners) if (pointInEquipmentFootprint(p, a, buffer)) return true;

  for (let i = 0; i < 4; i++) {
    const a1 = a.corners[i], a2 = a.corners[(i + 1) % 4];
    for (let j = 0; j < 4; j++) {
      const b1 = b.corners[j], b2 = b.corners[(j + 1) % 4];
      if (segmentsCross(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

export function equipmentPlacementConflicts({ nodes, nodeIndex, sign, ring, otherPlacements = [], buffer = 1 }) {
  const fp = equipmentFootprintFor(sign, nodes, nodeIndex);
  if (!fp) return [];

  const conflicts = [];

  // Entire working envelope must stay inside the ring.
  for (const c of fp.corners) {
    if (c.x < buffer || c.y < buffer || c.x > ring.width - buffer || c.y > ring.height - buffer) {
      conflicts.push({ type: 'ring-edge', point: c });
      break;
    }
  }

  // No other station/start/finish marker may sit inside the equipment work zone.
  nodes.forEach((n, i) => {
    if (i === nodeIndex) return;
    if (pointInEquipmentFootprint(n, fp, buffer)) {
      conflicts.push({ type: 'station-in-footprint', nodeIndex: i, stationId: n.stationId });
    }
  });

  // Only the incoming and outgoing route segments for this station may enter
  // its work zone. Unrelated course lines may not cut through the obstacle area.
  for (let s = 0; s < nodes.length - 1; s++) {
    if (s === nodeIndex - 1 || s === nodeIndex) continue;
    if (segmentIntersectsEquipmentFootprint(nodes[s], nodes[s + 1], fp, buffer)) {
      conflicts.push({ type: 'route-through-footprint', segmentStartIndex: s });
    }
  }

  for (const other of otherPlacements) {
    const ofp = equipmentFootprintFor(other.sign, nodes, other.nodeIndex);
    if (ofp && equipmentFootprintsOverlap(fp, ofp, buffer)) {
      conflicts.push({ type: 'equipment-overlap', otherNodeIndex: other.nodeIndex, otherSignId: other.sign.id });
    }
  }

  return conflicts;
}

export function makeSerpentineRoute({ count, width, height, minSpacing = 10, margin = 5, vertical = false, reverse = false }) {
  const total = count + 2; // start + exercises + finish
  const usableW = Math.max(10, width - margin * 2);
  const usableH = Math.max(10, height - margin * 2);

  // Build a regular lattice large enough for the requested station count.
  let cols = Math.max(3, Math.min(6, Math.floor(usableW / minSpacing) + 1));
  let rows = Math.ceil(total / cols);
  while (rows > Math.floor(usableH / minSpacing) + 1 && cols > 3) {
    cols--;
    rows = Math.ceil(total / cols);
  }
  if (rows > Math.floor(usableH / minSpacing) + 1) {
    throw new Error('Ring dimensions are too small for the selected station count and spacing.');
  }

  const dx = cols > 1 ? usableW / (cols - 1) : 0;
  const dy = rows > 1 ? usableH / (rows - 1) : 0;
  let points = [];

  for (let r = 0; r < rows && points.length < total; r++) {
    const y = margin + r * dy;
    const order = Array.from({ length: cols }, (_, i) => i);
    if (r % 2) order.reverse();
    for (const c of order) {
      if (points.length >= total) break;
      points.push({ x: margin + c * dx, y });
    }
  }

  if (vertical) {
    points = points.map(p => ({
      x: margin + (p.y - margin) / usableH * usableW,
      y: margin + (p.x - margin) / usableW * usableH
    }));
  }
  if (reverse) points.reverse();
  return points;
}

function orientation(a, b, c) {
  return Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
}

export function segmentsCross(a, b, c, d) {
  // Shared endpoints are legal; genuine interior crossings are not.
  const same = (p, q) => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9;
  if (same(a, c) || same(a, d) || same(b, c) || same(b, d)) return false;

  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return o1 !== o2 && o3 !== o4;
}

function edgeCell(index, cols, rows) {
  const x = index % cols, y = Math.floor(index / cols);
  return x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
}

function headingStep(a, b) {
  const dx = Math.sign(b.gx - a.gx);
  const dy = Math.sign(b.gy - a.gy);
  // Compass heading with 0=N, 90=E, in exact 45-degree increments.
  const key = `${dx},${dy}`;
  return ({
    '0,-1': 0, '1,-1': 45, '1,0': 90, '1,1': 135,
    '0,1': 180, '-1,1': 225, '-1,0': 270, '-1,-1': 315
  })[key];
}

function weightedShuffle(items, scoreFn) {
  return [...items]
    .map(item => ({ item, key: scoreFn(item) + Math.random() * 2.5 }))
    .sort((a, b) => b.key - a.key)
    .map(x => x.item);
}

export function makeVariedRoute({ count, width, height, margin = 5, style = 'mixed', drawingFloor = 8 }) {
  const total = count + 2; // start + stations + finish
  const usableW = width - margin * 2;
  const usableH = height - margin * 2;

  if (usableW < 20 || usableH < 20) {
    throw new Error('Ring is too small for a practical rally layout.');
  }

  // This is a route-layout heuristic, not an organization legality rule.
  // Organization-specific minimum distances belong in the rule pack validator.
  const DRAWING_FLOOR = Math.max(4.5, Number(drawingFloor) || 8);

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function shuffled(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function laneCountFor(runLength, crossLength) {
    const candidates = [];
    for (let lanes = 3; lanes <= 6; lanes++) {
      if (total < lanes * 2) continue;
      const avgPerLane = total / lanes;
      const avgRunGap = runLength / Math.max(1, avgPerLane - 1);
      const crossGap = crossLength / Math.max(1, lanes - 1);

      // Reject lane patterns that would force route anchors under the preferred layout floor.
      if (avgRunGap < DRAWING_FLOOR - 0.01 || crossGap < DRAWING_FLOOR - 0.01) continue;

      // Prefer 4–5 points per lane while preserving useful open areas.
      let score = 0;
      score -= Math.abs(avgPerLane - 4.6) * 1.4;
      score -= Math.max(0, 12 - crossGap) * 0.45;
      score -= Math.max(0, 12 - avgRunGap) * 0.45;
      score += Math.random() * 1.8;
      candidates.push({ lanes, score });
    }
    if (!candidates.length) {
      throw new Error(`Ring cannot fit this station count with the ${DRAWING_FLOOR.toFixed(1)}-ft route-layout floor.`);
    }
    candidates.sort((a, b) => b.score - a.score);
    const pool = candidates.slice(0, Math.min(3, candidates.length));
    return pool[Math.floor(Math.random() * pool.length)].lanes;
  }

  function allocatePointsAcrossLanes(lanes, runLength) {
    // Start with two points per lane so every run has an entry and exit.
    const counts = Array(lanes).fill(2);
    let remaining = total - lanes * 2;

    // Vary density by lane. Some sparse lanes create long runs where jumps,
    // weaves, figures 8, and recall exercises can actually fit.
    const maxPerLane = Math.floor(runLength / DRAWING_FLOOR) + 1;
    const order = shuffled(Array.from({ length: lanes }, (_, i) => i));
    while (remaining > 0) {
      const weighted = shuffled(order).sort((a, b) => {
        // Prefer under-filled lanes, but keep natural imbalance.
        return (counts[a] + Math.random() * 2) - (counts[b] + Math.random() * 2);
      });
      let placed = false;
      for (const i of weighted) {
        if (counts[i] >= Math.min(7, maxPerLane)) continue;
        counts[i]++;
        remaining--;
        placed = true;
        break;
      }
      if (!placed) {
        throw new Error('Unable to distribute stations within the preferred route-layout floor.');
      }
    }
    return counts;
  }

  function makeVariableGaps(length, gapCount, forceLong = false) {
    if (gapCount <= 0) return [];
    if (gapCount === 1) return [length];

    const floor = Math.min(DRAWING_FLOOR, length / gapCount);
    const gaps = Array(gapCount).fill(floor);
    let remaining = length - floor * gapCount;

    // Deliberately reserve an occasional long section. This is what lets
    // obstacle footprints and long recall distances exist without forcing the
    // entire course to use that same spacing.
    if (forceLong && remaining > 0 && length >= 34) {
      const maxLong = length - floor * (gapCount - 1);
      const desired = Math.min(maxLong, rand(20, 28));
      const extra = Math.max(0, desired - floor);
      gaps[Math.floor(Math.random() * gapCount)] += Math.min(extra, remaining);
      remaining -= Math.min(extra, remaining);
    }

    // Reserve a medium gap sometimes while keeping the preferred layout floor.
    if (remaining > 0 && gapCount >= 2 && Math.random() < 0.75) {
      const available = gaps
        .map((_, i) => i)
        .filter(i => gaps[i] <= floor + 0.01);
      if (available.length) {
        const i = available[Math.floor(Math.random() * available.length)];
        const target = [DRAWING_FLOOR, Math.max(DRAWING_FLOOR + 2, 10), Math.max(DRAWING_FLOOR + 5, 13)][Math.floor(Math.random() * 3)];
        const extra = Math.max(0, target - gaps[i]);
        const add = Math.min(extra, remaining);
        gaps[i] += add;
        remaining -= add;
      }
    }

    // Distribute the rest unevenly using exponential-ish random weights.
    if (remaining > 0.001) {
      const weights = Array.from({ length: gapCount }, () => {
        const u = Math.max(1e-6, Math.random());
        return -Math.log(u);
      });
      const sum = weights.reduce((a, b) => a + b, 0);
      for (let i = 0; i < gapCount; i++) {
        gaps[i] += remaining * (weights[i] / sum);
      }
    }

    // Keep pathological one-off gaps from becoming the whole lane. Excess is
    // shared with smaller gaps while retaining genuine variation.
    const softMax = Math.min(30, length - floor * (gapCount - 1));
    for (let pass = 0; pass < 3; pass++) {
      let excess = 0;
      for (let i = 0; i < gaps.length; i++) {
        if (gaps[i] > softMax) {
          excess += gaps[i] - softMax;
          gaps[i] = softMax;
        }
      }
      if (excess <= 0.001) break;
      const small = gaps
        .map((g, i) => ({ g, i }))
        .filter(x => x.g < softMax - 0.5);
      if (!small.length) break;
      const add = excess / small.length;
      for (const x of small) gaps[x.i] += add;
    }

    // Numerical correction so the gaps sum exactly to the lane length.
    const delta = length - gaps.reduce((a, b) => a + b, 0);
    gaps[gaps.length - 1] += delta;
    return gaps;
  }

  function positionsFromGaps(start, gaps) {
    const out = [start];
    for (const g of gaps) out.push(out[out.length - 1] + g);
    return out;
  }

  function variedLanePositions(length, lanes, start) {
    if (lanes <= 1) return [start + length / 2];
    // Lane-to-lane connectors are also variable; no single preferred value.
    const gaps = makeVariableGaps(length, lanes - 1, false);
    return positionsFromGaps(start, gaps);
  }


  function distributePolylinePoints(controls, options = {}) {
    const segmentCount = controls.length - 1;
    if (segmentCount < 1) return null;

    const lengths = [];
    for (let i = 0; i < segmentCount; i++) {
      const a = controls[i], b = controls[i + 1];
      lengths.push(Math.hypot(b.x - a.x, b.y - a.y));
    }
    if (lengths.some(L => L + 1e-6 < DRAWING_FLOOR)) return null;

    const minIntervals = options.minIntervals || {};
    const maxIntervals = options.maxIntervals || {};
    const intervals = Array.from({length:segmentCount}, (_, i) => Math.max(1, minIntervals[i] || 1));
    const capacities = lengths.map((L, i) => {
      const natural = Math.max(1, Math.floor((L + 1e-6) / DRAWING_FLOOR));
      return Math.max(intervals[i], Math.min(natural, maxIntervals[i] || natural));
    });
    let remaining = (total - 1) - intervals.reduce((s,n)=>s+n,0);
    if (remaining < 0) return null;
    if (capacities.reduce((s, n) => s + n, 0) < total - 1) return null;

    // Add intervals where the resulting gap remains largest. A little jitter
    // prevents every generated X course from placing signs at identical spots.
    while (remaining > 0) {
      const choices = [];
      for (let i = 0; i < segmentCount; i++) {
        if (intervals[i] >= capacities[i]) continue;
        const nextGap = lengths[i] / (intervals[i] + 1);
        choices.push({ i, score: nextGap + Math.random() * 2.5 });
      }
      if (!choices.length) return null;
      choices.sort((a, b) => b.score - a.score);
      intervals[choices[0].i]++;
      remaining--;
    }

    function gapsFor(length, n) {
      if (n <= 1) return [length];
      const base = DRAWING_FLOOR;
      const gaps = Array(n).fill(base);
      let extra = length - base * n;
      if (extra <= 1e-6) {
        gaps[gaps.length - 1] += extra;
        return gaps;
      }

      // Uneven distribution keeps the path organic while never dropping below
      // the selected layout floor.
      const weights = Array.from({ length:n }, () => 0.4 + Math.random());
      const sum = weights.reduce((a,b) => a+b, 0);
      for (let i=0;i<n;i++) gaps[i] += extra * weights[i] / sum;
      return gaps;
    }

    const points = [{ ...controls[0] }];
    for (let s = 0; s < segmentCount; s++) {
      const a = controls[s], b = controls[s + 1];
      const L = lengths[s];
      const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
      const gaps = options.balancedSegments?.has?.(s)
        ? Array(intervals[s]).fill(L / intervals[s])
        : gapsFor(L, intervals[s]);
      let traveled = 0;
      for (let k = 0; k < gaps.length; k++) {
        traveled += gaps[k];
        // Snap the final point of each segment exactly to its control vertex,
        // preserving the intended 45/90/135-degree geometry.
        if (k === gaps.length - 1) points.push({ ...b });
        else points.push({ x:a.x + ux * traveled, y:a.y + uy * traveled });
      }
    }
    return points.length === total ? points : null;
  }

  function routeHasClearStationAnchors(points, minNonAdjacent = 6) {
    // X lines are allowed to cross, but do not place physical station anchors
    // on top of each other at the crossing.
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 2; j < points.length; j++) {
        if (i === 0 && j === points.length - 1) continue;
        const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (d < minNonAdjacent) return false;
      }
    }
    return true;
  }


  function buildZoomAngledFlow() {
    // Zoom-specific angled route. Four broad lanes are connected with a mix
    // of 90°, 135° and 45° direction changes. Two interior straight "bays"
    // keep long approach/run-out gaps available for Zoom 2 obstacle choices.
    // The route is non-crossing and deliberately uses the ring vertically as
    // well as horizontally.
    if (usableW < 48 || usableH < 38) return null;

    const left = margin;
    const right = width - margin;
    const bottom = height - margin;
    const lower = bottom - 10;
    const upper = margin + 10;
    const top = margin;

    // Interior bay x-positions stay away from boundaries and from one another.
    const bayLowX = left + 20;
    const bayLowExitX = left + 40;
    const bayHighX = right - 20;
    const bayHighExitX = right - 40;

    if (bayLowExitX > right - 8 || bayHighExitX < left + 8) return null;

    const controls = [
      { x:right, y:bottom },
      { x:left,  y:bottom },          // +90 corner
      { x:left,  y:lower },           // +90 corner into lower interior lane
      { x:bayLowX,     y:lower },
      { x:bayLowExitX, y:lower },     // long bay around previous control
      { x:right, y:lower },           // -90 corner
      { x:right, y:upper },           // -90 corner into upper interior lane
      { x:bayHighX,     y:upper },
      { x:bayHighExitX, y:upper },    // second long bay
      { x:left, y:upper },            // +135 into diagonal
      { x:left + 10, y:top },         // +45 out of diagonal
      { x:right, y:top },             // deliberate 180° hairpin station
      { x:right - 20, y:top }         // short retrace to Finish
    ];

    // The four 20-ft segments around the two bay stations are kept as single
    // intervals. The final two top segments are also kept sparse so the 180°
    // hairpin can support a legal leave-dog -> turn/call-to-heel sequence used
    // by the Zoom 2 pool without placing another station on the retraced line.
    const options = {
      maxIntervals: { 2:1, 3:1, 6:1, 7:1, 10:1, 11:1 }
    };

    // Mirror horizontally/vertically for variety without changing the angles.
    let transformed = controls.map(p => ({ ...p }));
    if (Math.random() < 0.5) transformed = transformed.map(p => ({ x:width - p.x, y:p.y }));
    if (Math.random() < 0.5) transformed = transformed.map(p => ({ x:p.x, y:height - p.y }));
    if (Math.random() < 0.35) transformed.reverse();

    for (let attempt=0; attempt<50; attempt++) {
      const points = distributePolylinePoints(transformed, options);
      if (!points) continue;
      if (!routeHasClearStationAnchors(points, 6)) continue;

      let crossed=false;
      for (let i=0;i<points.length-1 && !crossed;i++) {
        for (let j=i+2;j<points.length-1;j++) {
          if (segmentsCross(points[i],points[i+1],points[j],points[j+1])) {
            crossed=true; break;
          }
        }
      }
      if (!crossed) return points;
    }
    return null;
  }

  function buildAngledFlow() {
    // Broad, non-crossing angled route intended to feel like a judge-designed
    // course rather than a ladder. It uses a long perimeter sweep plus a large
    // diagonal through the ring, then finishes on an open outside lane.
    //
    // The number of actual direction changes is deliberately modest so the
    // route remains compatible with sign-use limits for 45°/135° exercises.
    if (usableW < 50 || usableH < 40) return null;

    const left = margin;
    const right = width - margin;
    const top = margin;
    const bottom = height - margin;

    const controls = [
      { x:right,     y:bottom },      // lower-right start
      { x:left,      y:bottom },      // long run across bottom
      { x:left + 30, y:top + 10 },    // broad 45° diagonal through the ring
      { x:left,      y:top + 10 },    // west across upper-left lane
      { x:left + 10, y:top },         // short diagonal into top lane
      { x:right,     y:top },         // long run across top
      { x:right,     y:bottom - 10 }, // down right side
      { x:left + 20, y:bottom - 10 }  // finish on lower-middle lane
    ];

    for (let i = 0; i < controls.length - 1; i++) {
      const L = Math.hypot(
        controls[i + 1].x - controls[i].x,
        controls[i + 1].y - controls[i].y
      );
      if (L + 1e-6 < DRAWING_FLOOR) return null;
    }

    let transformed = controls.map(p => ({ ...p }));

    // Mirroring/reversal produces multiple visibly different angled courses
    // while preserving exact 45°/90°/135° turn geometry.
    if (Math.random() < 0.5) {
      transformed = transformed.map(p => ({ x: width - p.x, y: p.y }));
    }
    if (Math.random() < 0.5) {
      transformed = transformed.map(p => ({ x: p.x, y: height - p.y }));
    }
    if (Math.random() < 0.35) transformed.reverse();

    for (let attempt = 0; attempt < 60; attempt++) {
      const points = distributePolylinePoints(transformed);
      if (!points) continue;
      if (!routeHasClearStationAnchors(points, 6)) continue;

      let crossed = false;
      for (let i = 0; i < points.length - 1 && !crossed; i++) {
        for (let j = i + 2; j < points.length - 1; j++) {
          if (segmentsCross(points[i], points[i + 1], points[j], points[j + 1])) {
            crossed = true;
            break;
          }
        }
      }
      if (!crossed) return points;
    }
    return null;
  }

  function buildAngledX() {
    // Template based on a practical X-with-outside-path course:
    // bottom-right start -> straight up -> left 135 -> right 135 ->
    // successive 90s around the outside/middle -> right 135 across the
    // opposite diagonal. The two diagonals cross without requiring a station
    // at the crossing point.
    const routeW = Math.min(usableW - 5, usableH * 1.25);
    if (routeW < 40) return null;
    const left = margin + Math.max(0, (usableW - 5 - routeW) / 2);
    const right = left + routeW;
    const top = margin;
    const bottom = height - margin;

    // The opening vertical is deliberately 5 ft farther inside the ring than
    // the old perimeter route. That creates at least one genuinely usable
    // straight equipment slot (jump/table/etc.) without putting its working
    // footprint through the ring edge.
    const d = Math.min(routeW - 20, usableH * 0.625);
    if (d < 20) return null;

    const firstDiagX = right - d;
    const innerRight = right - 5;
    const midY = top + usableH / 2;
    const secondDiagStartX = left + 10;
    const hookTurnX = secondDiagStartX + 5;

    const controls = [
      { x:right,            y:bottom },  // start: bottom-right area
      { x:right,            y:top },     // straight up; equipment-friendly corridor
      { x:firstDiagX,       y:top + d }, // left 135: first diagonal
      { x:firstDiagX,       y:top },     // right 135: straight up
      { x:innerRight,       y:top },     // right 90
      { x:innerRight,       y:midY },    // right 90
      { x:hookTurnX + 5,    y:midY },    // continue west
      { x:left,             y:midY },    // 180 about-turn at outside spur
      { x:secondDiagStartX, y:midY },    // retrace east, then left 90
      { x:secondDiagStartX, y:top },     // straight up
      { x:secondDiagStartX + d, y:top + d } // right 135: opposite X diagonal / finish
    ];

    // Make sure the geometry remains practical for the current ring.
    for (let i=0;i<controls.length-1;i++) {
      if (Math.hypot(
        controls[i+1].x-controls[i].x,
        controls[i+1].y-controls[i].y
      ) < DRAWING_FLOOR - 1e-6) return null;
    }

    // Randomly mirror and/or reverse the whole route. This produces all four
    // start corners while retaining exact turn angles.
    let transformed = controls.map(p => ({...p}));
    if (Math.random() < 0.5) transformed = transformed.map(p => ({ x:width-p.x, y:p.y }));
    if (Math.random() < 0.5) transformed = transformed.map(p => ({ x:p.x, y:height-p.y }));

    // Segment 0 is the equipment-friendly opening corridor. Three balanced
    // intervals create two straight stations about 13.3 ft apart on a 40-ft
    // leg: enough room for the more demanding Zoom/ARF quota equipment while
    // retaining the selected route-layout floor.
    const pointOptions = {
      minIntervals:{0:3},
      maxIntervals:{0:3},
      balancedSegments:new Set([0])
    };

    // Try multiple point distributions so no station lands directly on the X
    // crossing or too close to a non-adjacent station.
    for (let attempt=0; attempt<100; attempt++) {
      const points = distributePolylinePoints(transformed, pointOptions);
      if (points && routeHasClearStationAnchors(points, 2.5)) return points;
    }
    return null;
  }

  function buildRowSnake() {
    const lanes = laneCountFor(usableW, usableH);
    const counts = allocatePointsAcrossLanes(lanes, usableW);
    const ys = variedLanePositions(usableH, lanes, margin);
    const pts = [];

    // Ensure at least one sparse lane gets a long useful gap where possible.
    const sparseLane = counts
      .map((n, i) => ({ n, i }))
      .sort((a, b) => a.n - b.n)[0]?.i ?? 0;

    for (let row = 0; row < lanes; row++) {
      const n = counts[row];
      const gaps = makeVariableGaps(usableW, n - 1, row === sparseLane);
      let xs = positionsFromGaps(margin, gaps);
      if (row % 2) xs = xs.reverse();
      for (const x of xs) pts.push({ x, y: ys[row] });
    }
    return pts.slice(0, total);
  }

  function buildColSnake() {
    const lanes = laneCountFor(usableH, usableW);
    const counts = allocatePointsAcrossLanes(lanes, usableH);
    const xs = variedLanePositions(usableW, lanes, margin);
    const pts = [];

    const sparseLane = counts
      .map((n, i) => ({ n, i }))
      .sort((a, b) => a.n - b.n)[0]?.i ?? 0;

    for (let col = 0; col < lanes; col++) {
      const n = counts[col];
      const gaps = makeVariableGaps(usableH, n - 1, col === sparseLane);
      let ys = positionsFromGaps(margin, gaps);
      if (col % 2) ys = ys.reverse();
      for (const y of ys) pts.push({ x: xs[col], y });
    }
    return pts.slice(0, total);
  }

  const classicRoute = () => {
    let pts = Math.random() < 0.5 ? buildRowSnake() : buildColSnake();
    if (Math.random() < 0.5) pts = pts.map(p => ({ x: width - p.x, y: p.y }));
    if (Math.random() < 0.5) pts = pts.map(p => ({ x: p.x, y: height - p.y }));
    if (Math.random() < 0.5) pts.reverse();
    pts.routeFamily = 'classic-variable';
    return pts;
  };

  if (style === 'zoom-mixed') {
    if (Math.random() < 0.62) {
      const angled = buildZoomAngledFlow();
      if (angled) {
        angled.routeFamily = 'zoom-angled-flow';
        return angled;
      }
    }
    return classicRoute();
  }

  if (style === 'zoom-angled-flow') {
    const pts = buildZoomAngledFlow();
    if (!pts) throw new Error('This ring/station count cannot fit the Zoom Angled Flow route with the selected layout geometry.');
    pts.routeFamily = 'zoom-angled-flow';
    return pts;
  }

  if (style === 'angled-flow') {
    const pts = buildAngledFlow();
    if (!pts) throw new Error('This ring/station count cannot fit the Angled Flow route with the selected layout geometry.');
    pts.routeFamily = 'angled-flow';
    return pts;
  }

  if (style === 'angled-x') {
    const pts = buildAngledX();
    if (!pts) throw new Error('This ring/station count cannot fit the angled X route with the selected layout geometry.');
    pts.routeFamily = 'angled-x';
    return pts;
  }

  if (style === 'classic') return classicRoute();

  // Mixed mode now favors the judge-quality Angled Flow family instead of the
  // crowded X crossover. The X remains available as an explicit choice.
  if (Math.random() < 0.62) {
    const angled = buildAngledFlow();
    if (angled) {
      angled.routeFamily = 'angled-flow';
      return angled;
    }
  }
  return classicRoute();
}

export function adjacentSpacingViolations(nodes, minSpacing) {
  const out = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const d = distance(nodes[i], nodes[i + 1]);
    if (d + 1e-6 < minSpacing) out.push({ a: i, b: i + 1, distance: d });
  }
  return out;
}

// Compact three-lane fallback for legal but narrow rings. The center corridor
// deliberately contains one long, straight equipment bay while the outer lanes
// carry most of the stations. This is a layout heuristic, not an organization
// rule, and is currently used only as a CARO fallback for compact legal rings.
export function makeCompactCorridorRoute({ count, width, height, axis = 'long' }) {
  const totalStations=Math.max(1,Number(count)||1);
  const runAlongX = axis === 'short' ? width <= height : width >= height;
  const run = runAlongX ? width : height;
  const cross = runAlongX ? height : width;

  // The largest current CARO footprint needs about 8 ft of lateral clearance
  // including design buffer. Keep the outer lanes outside that envelope.
  const sideMargin=Math.max(1.25,Math.min(5,cross/2-8.5));

  // A 24-ft equipment envelope plus the 1-ft ring-edge buffer can fit in a
  // 26-ft run. The original long-axis route used a 3-5 ft end margin, but a
  // short-axis fallback needs to use more of a compact legal ring.
  const endSlack=(run-26)/2;
  const runMargin=axis==='short' ? 1 : Math.max(1,Math.min(5,endSlack));
  const near=runMargin,far=run-runMargin;
  const low=sideMargin,high=cross-sideMargin;
  const corridorMin=low+8.25,corridorMax=high-8.25;
  if(corridorMin>corridorMax) return null;
  const mid=corridorMin + Math.random()*(corridorMax-corridorMin);
  const span=far-near;
  if(span<25.5) return null;

  // Four structural station locations are reserved for the two lane changes
  // and the center equipment corridor; the rest are split over the outer lanes.
  const remaining=totalStations-4;
  if(remaining<4) return null;
  const farLaneStations=Math.ceil(remaining/2);
  const nearLaneStations=remaining-farLaneStations;
  if(farLaneStations<2 || nearLaneStations<2) return null;

  const pts=[];
  for(let i=0;i<=farLaneStations;i++){
    pts.push({x:near+span*i/farLaneStations,y:high});
  }

  // Sparse equipment corridor: far turn -> equipment bay -> near turn.
  pts.push({x:far,y:mid});
  const minEquipment=near+20.25;
  const maxEquipment=far-7.25;
  if(minEquipment>maxEquipment) return null;
  const preferred=near+span*(0.48+Math.random()*0.24);
  const equipmentX=Math.max(minEquipment,Math.min(maxEquipment,preferred));
  pts.push({x:equipmentX,y:mid});
  pts.push({x:near,y:mid});
  pts.push({x:near,y:low});

  for(let i=1;i<=nearLaneStations;i++){
    pts.push({x:near+span*i/(nearLaneStations+1),y:low});
  }
  pts.push({x:far,y:low});

  let out=pts;
  if(Math.random()<0.5) out=out.map(p=>({x:run-p.x,y:p.y}));
  if(Math.random()<0.5) out=out.map(p=>({x:p.x,y:cross-p.y}));
  if(!runAlongX) out=out.map(p=>({x:p.y,y:p.x}));
  out.routeFamily=axis==='short'?'compact-corridor-short':'compact-corridor';
  return out;
}

// Asymmetric compact route used when a central venue obstacle would consume the
// usual center equipment corridor. The required obstacle bay is pushed toward
// one side of the ring while ordinary stations use lanes on the opposite side.
// This is a generation/layout heuristic, not an organization rule.
export function makeEdgeEquipmentRoute({ count, width, height, side = 'low', axis = 'long' }) {
  const totalStations=Math.max(1,Number(count)||1);
  if(totalStations<9) return null;

  const runAlongX=axis==='short' ? width<=height : width>=height;
  const run=runAlongX?width:height;
  const cross=runAlongX?height:width;
  if(run<34 || cross<32) return null;

  const near=1,far=run-1;
  const equipmentCross=side==='high' ? cross-8 : 8;
  const dir=side==='high' ? -1 : 1;
  const regularNear=equipmentCross + dir*11;
  const regularFar=side==='high' ? 5 : cross-5;
  if(Math.abs(regularNear-regularFar)<8) return null;

  // Two ordinary lanes keep the number of repeated 90-degree turn exercises
  // within the Novice sign pool while still leaving an isolated equipment lane.
  const corridorStations=3;
  const ordinary=totalStations-corridorStations;
  if(ordinary<6) return null;
  const firstCount=Math.ceil(ordinary/2);
  const secondCount=ordinary-firstCount;
  if(secondCount<2) return null;

  const local=[];
  // Start near the first lane, travel to the far end, cross once, and return.
  local.push({x:near,y:regularFar});
  for(let j=1;j<=firstCount;j++){
    local.push({x:near+(far-near)*(j/firstCount),y:regularFar});
  }

  // The entry point on lane two is itself a station; distribute the remaining
  // second-lane stations back toward the near end.
  local.push({x:far,y:regularNear});
  for(let j=1;j<secondCount;j++){
    local.push({x:far+(near-far)*(j/(secondCount-1)),y:regularNear});
  }

  // Turn into the sparse equipment lane, perform the equipment exercise on a
  // long straight, then reach a station beyond the working envelope.
  local.push({x:near,y:equipmentCross});
  const equipmentU=near+9;
  const afterU=far;
  if(equipmentU+19>=afterU) return null;
  local.push({x:equipmentU,y:equipmentCross});
  local.push({x:afterU,y:equipmentCross});

  // Finish leaves the final station laterally, outside the equipment envelope.
  const finishCross=equipmentCross+dir*8;
  local.push({x:far,y:finishCross});

  if(local.length!==totalStations+2) return null;
  let out=local;
  if(!runAlongX) out=out.map(p=>({x:p.y,y:p.x}));
  out.routeFamily=`edge-equipment-${axis}-${side}`;
  return out;
}
