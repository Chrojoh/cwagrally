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
  const incoming = headingBetween(nodes[nodeIndex - 1], nodes[nodeIndex]);
  const outgoing = headingBetween(nodes[nodeIndex], nodes[nodeIndex + 1]);
  return angleDiff(incoming, outgoing);
}

export function signFitsTurn(sign, requiredTurn, tolerance = 28) {
  const td = sign.motion?.turnDelta ?? 0;
  return circularDeltaError(td, requiredTurn) <= (sign.motion?.tolerance ?? tolerance);
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

export function makeVariedRoute({ count, width, height, margin = 5 }) {
  const total = count + 2; // start + stations + finish
  const usableW = width - margin * 2;
  const usableH = height - margin * 2;

  if (usableW < 20 || usableH < 20) {
    throw new Error('Ring is too small for a practical rally layout.');
  }

  // IMPORTANT:
  // There is NO universal ordinary C-WAGS sign spacing here.
  // The route is built from the ring dimensions and station count only.
  // A small 4.5 ft internal floor prevents drawn markers from stacking on top
  // of one another; it is NOT a C-WAGS rule and is not exposed as a user setting.
  const DRAWING_FLOOR = 4.5;

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

      // Prefer 4–5 points per lane and enough separation between lanes for
      // equipment working areas. This is layout quality, not a rule minimum.
      let score = 0;
      score -= Math.abs(avgPerLane - 4.6) * 1.4;
      score -= Math.max(0, 7 - crossGap) * 2.5;
      score -= Math.max(0, 6 - avgRunGap) * 2.5;
      score += Math.random() * 1.8;
      candidates.push({ lanes, score });
    }
    candidates.sort((a, b) => b.score - a.score);
    const pool = candidates.slice(0, Math.min(3, candidates.length));
    return pool[Math.floor(Math.random() * pool.length)].lanes;
  }

  function allocatePointsAcrossLanes(lanes) {
    // Start with two points per lane so every run has an entry and exit.
    const counts = Array(lanes).fill(2);
    let remaining = total - lanes * 2;

    // Vary density by lane. Some sparse lanes create long runs where jumps,
    // weaves, figures 8, and recall exercises can actually fit.
    const order = shuffled(Array.from({ length: lanes }, (_, i) => i));
    while (remaining > 0) {
      const weighted = shuffled(order).sort((a, b) => {
        // Prefer under-filled lanes, but keep natural imbalance.
        return (counts[a] + Math.random() * 2) - (counts[b] + Math.random() * 2);
      });
      let placed = false;
      for (const i of weighted) {
        if (counts[i] >= 7) continue;
        counts[i]++;
        remaining--;
        placed = true;
        break;
      }
      if (!placed) break;
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

    // Reserve a short/medium gap sometimes as well. This creates legal places
    // for exercises described around 5 ft, 8–10 ft, or ~12 ft.
    if (remaining > 0 && gapCount >= 2 && Math.random() < 0.75) {
      const available = gaps
        .map((_, i) => i)
        .filter(i => gaps[i] <= floor + 0.01);
      if (available.length) {
        const i = available[Math.floor(Math.random() * available.length)];
        const target = [5, 9, 12][Math.floor(Math.random() * 3)];
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

  function buildRowSnake() {
    const lanes = laneCountFor(usableW, usableH);
    const counts = allocatePointsAcrossLanes(lanes);
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
    const counts = allocatePointsAcrossLanes(lanes);
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

  // Two distinct physical families, then mirror/reverse them for more variety.
  // Both preserve exact 90-degree corner geometry while allowing completely
  // different distances from station to station.
  let pts = Math.random() < 0.5 ? buildRowSnake() : buildColSnake();

  if (Math.random() < 0.5) pts = pts.map(p => ({ x: width - p.x, y: p.y }));
  if (Math.random() < 0.5) pts = pts.map(p => ({ x: p.x, y: height - p.y }));
  if (Math.random() < 0.5) pts.reverse();

  return pts;
}

export function adjacentSpacingViolations(nodes, minSpacing) {
  const out = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const d = distance(nodes[i], nodes[i + 1]);
    if (d + 1e-6 < minSpacing) out.push({ a: i, b: i + 1, distance: d });
  }
  return out;
}
