import { distance, requiredTurnAt, segmentsCross } from './geometry.js';

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function sampleSegment(a, b, step = 2) {
  const d = distance(a, b);
  const count = Math.max(1, Math.ceil(d / step));
  const out = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

function routeSamples(nodes, step = 2) {
  const out = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const segment = sampleSegment(nodes[i], nodes[i + 1], step);
    if (i) segment.shift();
    out.push(...segment);
  }
  return out;
}

function gridStats(course, cols = 4, rows = 4) {
  const { width, height } = course.ring;
  const samples = routeSamples(course.nodes, 2);
  const counts = Array(cols * rows).fill(0);

  for (const p of samples) {
    const cx = Math.min(cols - 1, Math.max(0, Math.floor((p.x / width) * cols)));
    const cy = Math.min(rows - 1, Math.max(0, Math.floor((p.y / height) * rows)));
    counts[cy * cols + cx]++;
  }

  const occupied = counts.filter(n => n > 0).length;
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, n) => sum + (n - mean) ** 2, 0) / counts.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;

  const quadrantCounts = [0, 0, 0, 0];
  for (const p of samples) {
    const qx = p.x < width / 2 ? 0 : 1;
    const qy = p.y < height / 2 ? 0 : 1;
    quadrantCounts[qy * 2 + qx]++;
  }
  const total = quadrantCounts.reduce((a, b) => a + b, 0) || 1;
  const quadrantShares = quadrantCounts.map(n => n / total);

  return {
    counts,
    occupied,
    occupancy: occupied / counts.length,
    cv,
    quadrantShares
  };
}

function boundingUse(course) {
  const xs = course.nodes.map(n => n.x);
  const ys = course.nodes.map(n => n.y);
  const widthUse = (Math.max(...xs) - Math.min(...xs)) / course.ring.width;
  const heightUse = (Math.max(...ys) - Math.min(...ys)) / course.ring.height;
  return { widthUse, heightUse, areaUse: widthUse * heightUse };
}

function crossingCount(nodes) {
  let crossings = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 2; j < nodes.length - 1; j++) {
      if (i === 0 && j === nodes.length - 2) continue;
      if (segmentsCross(nodes[i], nodes[i + 1], nodes[j], nodes[j + 1])) crossings++;
    }
  }
  return crossings;
}

function pointToSegmentDistance(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const wx = p.x - a.x, wy = p.y - a.y;
  const vv = vx * vx + vy * vy;
  if (vv <= 1e-9) return distance(p, a);
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / vv));
  return Math.hypot(p.x - (a.x + vx * t), p.y - (a.y + vy * t));
}

function unrelatedClearanceStats(nodes) {
  let closeStationPairs = 0;
  let veryCloseStationPairs = 0;
  let minStationDistance = Infinity;

  for (let i = 1; i < nodes.length - 1; i++) {
    if (nodes[i].kind !== 'station') continue;
    for (let j = i + 2; j < nodes.length - 1; j++) {
      if (nodes[j].kind !== 'station') continue;
      const d = distance(nodes[i], nodes[j]);
      minStationDistance = Math.min(minStationDistance, d);
      if (d < 10) closeStationPairs++;
      if (d < 6) veryCloseStationPairs++;
    }
  }

  let routePinches = 0;
  let veryTightPinches = 0;
  let minRouteClearance = Infinity;

  for (let i = 1; i < nodes.length - 1; i++) {
    const p = nodes[i];
    if (p.kind !== 'station') continue;

    let nearest = Infinity;
    for (let s = 0; s < nodes.length - 1; s++) {
      if (s === i - 1 || s === i) continue;
      nearest = Math.min(nearest, pointToSegmentDistance(p, nodes[s], nodes[s + 1]));
    }

    minRouteClearance = Math.min(minRouteClearance, nearest);
    if (nearest < 7) routePinches++;
    if (nearest < 4) veryTightPinches++;
  }

  return {
    closeStationPairs,
    veryCloseStationPairs,
    minStationDistance: Number.isFinite(minStationDistance) ? minStationDistance : null,
    routePinches,
    veryTightPinches,
    minRouteClearance: Number.isFinite(minRouteClearance) ? minRouteClearance : null
  };
}

function category(label, score, findings = [], stats = {}) {
  return { label, score: Math.round(clamp(score)), findings, stats };
}

export function qualityGrade(score) {
  return score >= 90 ? 'Excellent'
    : score >= 80 ? 'Strong'
    : score >= 70 ? 'Acceptable'
    : score >= 60 ? 'Needs improvement'
    : 'Poor';
}

export function evaluateCourseQuality(course, pack = null) {
  const nodes = course?.nodes || [];
  const stations = nodes.filter(n => n.kind === 'station');

  if (nodes.length < 3 || !course?.ring?.width || !course?.ring?.height) {
    return {
      overall: 0,
      grade: 'Poor',
      threshold: 80,
      categories: {},
      findings: [{ category:'Course', score:0, text:'Course does not contain enough geometry to evaluate.' }],
      basis: 'Judge-quality heuristic; organization legality is validated separately.'
    };
  }

  // 1) SPACE USE
  // Looks at ring-zone coverage, balance between quadrants and overall span.
  const grid = gridStats(course, 4, 4);
  const bounds = boundingUse(course);
  const emptyQuadrants = grid.quadrantShares.filter(s => s < 0.08).length;
  const dominantQuadrant = Math.max(...grid.quadrantShares);

  let spaceScore = 100;
  spaceScore -= Math.max(0, 0.94 - grid.occupancy) * 90;
  spaceScore -= Math.max(0, grid.cv - 0.65) * 18;
  spaceScore -= Math.max(0, 0.72 - bounds.widthUse) * 45;
  spaceScore -= Math.max(0, 0.72 - bounds.heightUse) * 45;
  spaceScore -= emptyQuadrants * 12;
  spaceScore -= Math.max(0, dominantQuadrant - 0.42) * 80;
  spaceScore = clamp(spaceScore);

  const spaceFindings = [];
  if (grid.occupancy < 0.82) {
    spaceFindings.push(`Only ${Math.round(grid.occupancy * 100)}% of the 4×4 ring zones are used by the route.`);
  }
  if (emptyQuadrants) {
    spaceFindings.push(`${emptyQuadrants} ring quadrant${emptyQuadrants === 1 ? '' : 's'} receive very little route use.`);
  }
  if (dominantQuadrant > 0.46) {
    spaceFindings.push(`About ${Math.round(dominantQuadrant * 100)}% of the route is concentrated in one quadrant.`);
  }
  if (bounds.widthUse < 0.68 || bounds.heightUse < 0.68) {
    spaceFindings.push('The course does not make broad use of both ring dimensions.');
  }
  if (!spaceFindings.length) spaceFindings.push('Route distribution uses the available ring well.');

  // 2) FLOW
  // Smooth progression is rewarded; repeated reversals, abrupt turn chains and
  // excessive crossings reduce the score.
  const turns = [];
  for (let i = 1; i < nodes.length - 1; i++) {
    turns.push({ index: i, value: requiredTurnAt(nodes, i) });
  }
  const sharp = turns.filter(t => Math.abs(t.value) >= 120).length;
  const reversals = turns.filter(t => Math.abs(t.value) >= 165).length;
  let consecutiveSharp = 0;
  for (let i = 1; i < turns.length; i++) {
    if (Math.abs(turns[i - 1].value) >= 120 && Math.abs(turns[i].value) >= 120) consecutiveSharp++;
  }
  const crossings = crossingCount(nodes);

  let flowScore = 100;
  flowScore -= Math.max(0, sharp - 5) * 3;
  flowScore -= Math.max(0, reversals - 2) * 6;
  flowScore -= consecutiveSharp * 3;
  flowScore -= crossings * 4;
  flowScore = clamp(flowScore);

  const flowFindings = [];
  if (crossings > 2) flowFindings.push(`${crossings} route crossings may make the course feel busy.`);
  else if (crossings > 0) flowFindings.push(`${crossings} intentional route crossing${crossings === 1 ? '' : 's'} should remain visually clear.`);
  if (reversals > 3) flowFindings.push(`${reversals} near-180° direction changes can interrupt course rhythm.`);
  if (consecutiveSharp > 1) flowFindings.push(`${consecutiveSharp} pairs of consecutive sharp turns may feel abrupt.`);
  if (!flowFindings.length) flowFindings.push('The route has a generally smooth, readable progression.');

  // 3) WORKING SPACE
  // This is a quality margin above bare legality. The legal validator still owns
  // actual equipment footprint/rule failures.
  const clear = unrelatedClearanceStats(nodes);

  let workScore = 100;
  workScore -= clear.veryCloseStationPairs * 6;
  workScore -= Math.max(0, clear.closeStationPairs - clear.veryCloseStationPairs) * 1.5;
  workScore -= clear.veryTightPinches * 5;
  workScore -= Math.max(0, clear.routePinches - clear.veryTightPinches) * 2;
  workScore = clamp(workScore);

  const workingFindings = [];
  if (clear.veryCloseStationPairs) {
    workingFindings.push(`${clear.veryCloseStationPairs} unrelated station pair${clear.veryCloseStationPairs === 1 ? '' : 's'} are under 6 ft apart.`);
  }
  if (clear.closeStationPairs > clear.veryCloseStationPairs) {
    workingFindings.push(`${clear.closeStationPairs} unrelated station pair${clear.closeStationPairs === 1 ? '' : 's'} are under 10 ft apart.`);
  }
  if (clear.veryTightPinches) {
    workingFindings.push(`${clear.veryTightPinches} station-to-unrelated-route pinch point${clear.veryTightPinches === 1 ? '' : 's'} are under 4 ft.`);
  } else if (clear.routePinches) {
    workingFindings.push(`${clear.routePinches} station-to-unrelated-route proximity point${clear.routePinches === 1 ? '' : 's'} merit a setup check.`);
  }
  if (!workingFindings.length) {
    workingFindings.push('Unrelated stations and route legs have comfortable working separation.');
  }

  // 4) MAP CLARITY
  // The renderer can offset labels, but underlying crossing and station density
  // still affect how easily a judge/exhibitor can read the course.
  let clarityScore = 100;
  clarityScore -= crossings * 3;
  clarityScore -= clear.veryCloseStationPairs * 3;
  clarityScore -= Math.max(0, clear.closeStationPairs - clear.veryCloseStationPairs);
  clarityScore = clamp(clarityScore);

  const clarityFindings = [];
  if (crossings) clarityFindings.push('Crossing points should be checked for unmistakable numbering and arrows.');
  if (clear.closeStationPairs) clarityFindings.push('Close unrelated stations may require label offsets on the printed map.');
  if (!clarityFindings.length) clarityFindings.push('Station order and route geometry should be easy to read on the map.');

  const categories = {
    space: category('Space use', spaceScore, spaceFindings, { ...grid, ...bounds }),
    flow: category('Flow', flowScore, flowFindings, { sharp, reversals, consecutiveSharp, crossings }),
    working: category('Working space', workScore, workingFindings, clear),
    clarity: category('Map clarity', clarityScore, clarityFindings, {
      crossings,
      closeStationPairs: clear.closeStationPairs
    })
  };

  const overall = Math.round(
    categories.space.score * 0.30 +
    categories.flow.score * 0.30 +
    categories.working.score * 0.25 +
    categories.clarity.score * 0.15
  );

  const findings = Object.values(categories)
    .flatMap(c => c.findings.map(text => ({ category: c.label, score: c.score, text })))
    .filter(f => f.score < 85)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  return {
    overall,
    grade: qualityGrade(overall),
    threshold: 80,
    categories,
    findings,
    stationCount: stations.length,
    basis: 'Judge-quality heuristic; organization legality is validated separately.'
  };
}
