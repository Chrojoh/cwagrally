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


export function joinedRuleFor(pack, fromId, toId) {
  return (pack.joinedPairRules || []).find(rule =>
    rule.from.includes(fromId) && rule.to.includes(toId)
  ) || null;
}

// Saved decisions are bound to both stations and signs. Replacing/reordering a
// station cannot silently carry a former spacing exemption onto a new pair.
export function joinCompatibilityFor(pack,fromId,toId){
  return joinedRuleFor(pack,fromId,toId)||
    (pack.id==='cwags'&&fromId==='S5'&&toId==='S11'
      ?{label:'Pivot and walk-around joined example (guidelines p12)',displayWarnAbove:6,explicitOnly:true}:null);
}
export function joinDecisionValid(a,b){
  const d=b?.joinDecision;
  return !!d&&d.fromStationId===a?.stationId&&d.fromSignId===a?.signId&&d.toSignId===b?.signId;
}
export function joinedConnectionFor(pack,a,b){
  const compatible=joinCompatibilityFor(pack,a?.signId,b?.signId);
  if(joinDecisionValid(a,b))return b.joinDecision.state==='joined'&&compatible?{...compatible,origin:'explicit'}:null;
  const inferred=joinedRuleFor(pack,a?.signId,b?.signId);
  return inferred?{...inferred,origin:'inferred'}:null;
}
export function setJoinDecision(pack,a,b,state){
  if(!a||!b||!['joined','separate','auto'].includes(state))throw new Error('Choose adjacent stations and a valid joining mode.');
  if(state==='auto'){delete b.joinDecision;return;}
  if(state==='joined'&&!joinCompatibilityFor(pack,a.signId,b.signId))throw new Error('This pair has no reviewed joining definition. Leave it for judge review.');
  b.joinDecision={fromStationId:a.stationId,fromSignId:a.signId,toSignId:b.signId,state};
}
export function refreshJoinedFlags(course, pack) {
  if (!course?.nodes) return course;
  let previousStation = null;
  for (const node of course.nodes) {
    if (node.kind !== 'station') continue;
    const rule = previousStation?joinedConnectionFor(pack,previousStation,node):null;
    if (rule) {
      node.joinedToPrevious = true;
      node.joinedReason = rule.label || 'Joined exercise';
      node.joinedOrigin=rule.origin;
    } else {
      delete node.joinedToPrevious;
      delete node.joinedReason;
      delete node.joinedOrigin;
    }
    previousStation = node;
  }
  return course;
}
