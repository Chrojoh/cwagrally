import { distance } from './geometry.js';

// Design targets, not a claim that CARO defines a universal sign-to-sign minimum.
export function spacingGuidanceIssues(course, pack) {
  const policy = pack?.spacingGuidance;
  if (!policy) return [];
  const issues = [];
  const nodes = course.nodes || [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    if (!['start', 'station'].includes(a.kind) || !['station', 'finish'].includes(b.kind)) continue;
    if (policy.companions.some(pair => pair.from.includes(a.signId) && pair.to.includes(b.signId))) continue;
    const extended = policy.extendedAfter.includes(a.signId) || policy.extendedBefore.includes(b.signId);
    const target = extended ? policy.extended : policy.default;
    const gap = distance(a, b);
    if (gap + 1e-6 < target) issues.push({
      stationId: a.stationId, nextStationId: b.stationId,
      from: a.signId || a.kind, to: b.signId || b.kind,
      distance: gap, target,
      reason: extended ? 'Provisional room for fast pace or multi-step movement' : 'Provisional ordinary spacing target'
    });
  }
  return issues;
}
