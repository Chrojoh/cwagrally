import { signFitsTurn, requiredTurnAt } from './geometry.js';

export function signById(pack, id) {
  return pack.signs[id] || null;
}

export function levelAllowedSigns(pack, levelId) {
  const level = pack.levels[levelId];
  if (!level) return [];
  return level.allowedSigns.map(id => pack.signs[id]).filter(Boolean);
}

export function quotaCount(pack, levelId, signIds, quota) {
  const set = new Set(quota.signIds);
  return signIds.filter(id => set.has(id)).length;
}

export function candidateSignsForNode(pack, levelId, nodes, nodeIndex, {
  includeSequences = true,
  tolerance = 28
} = {}) {
  const level = pack.levels[levelId];
  const required = requiredTurnAt(nodes, nodeIndex);
  const followers = pack.sequenceFollowers || new Set();

  return level.allowedSigns
    .map(id => pack.signs[id])
    .filter(Boolean)
    .filter(sign => signFitsTurn(sign, required, tolerance))
    .filter(sign => includeSequences || (!pack.sequenceNext[sign.id] && !followers.has(sign.id)));
}

export function maxUsesFor(pack, levelId, signId) {
  return pack.levels[levelId].maxUses?.[signId]
    ?? pack.signs[signId]?.maxUses
    ?? 1;
}

export function buildFollowers(sequenceNext) {
  const set = new Set();
  Object.values(sequenceNext).forEach(ids => ids.forEach(id => set.add(id)));
  return set;
}


export function transitionRuleFor(pack, levelId, signId) {
  const rule = pack.transitionRules?.[signId];
  if (!rule) {
    const legacy = pack.sequenceNext?.[signId];
    return legacy ? { next: legacy, allowFinish: false } : null;
  }

  const next = rule.nextByLevel?.[levelId] ?? rule.next ?? [];
  const allowFinish =
    rule.allowFinishByLevel?.[levelId] ??
    rule.allowFinish ??
    false;

  return { ...rule, next, allowFinish };
}

export function transitionAllows(pack, levelId, signId, nextId, isFinish = false) {
  const rule = transitionRuleFor(pack, levelId, signId);
  if (!rule) return true;
  if (isFinish) return !!rule.allowFinish;
  return !!nextId && (rule.next || []).includes(nextId);
}
