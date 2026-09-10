import { maxUsesFor, transitionRuleFor } from './rules.js';
import { signFitsTurn } from './geometry.js';

// Plan real exercise resources before embedding a path. A block is indivisible:
// its required companion/pace-resolution exercises stay adjacent in the walk.
export function planSkeleton({pack,levelId,count,includeSequences=false,shape}) {
  const level=pack.levels[levelId], allowed=new Set(level.allowedSigns);
  const turns=shape==='geometric'?[-90,0,90]:[-135,-90,-45,0,45,90,135];
  const eligible=id=>allowed.has(id) && pack.signs[id]?.generatorEligible!==false &&
    turns.some(t=>signFitsTurn(pack.signs[id],t));
  const blocks=[];
  const keys=new Set();
  function add(ids) {
    if(ids.length>count || !ids.every(eligible)) return;
    const key=ids.join(',');
    if(!keys.has(key)){keys.add(key);blocks.push(ids);}
  }
  for(const id of allowed) {
    if(!eligible(id) || pack.signs[id].requiredPrevious || pack.dependentSigns?.has(id)) continue;
    const rule=transitionRuleFor(pack,levelId,id);
    if(!rule) add([id]);
    else for(const next of rule.next) {
      // Resolve a pace change or companion pair; longer chains are explicit below.
      if(!transitionRuleFor(pack,levelId,next)) add([id,next]);
    }
  }
  if(includeSequences) for(const ids of pack.chainTemplates?.[levelId]||[]) add(ids);
  const quotas=level.quotas||[];
  const counts=ids=>quotas.map(q=>ids.filter(id=>q.signIds.includes(id)).length);
  for(let attempt=0;attempt<40;attempt++) {
    const chosen=[], uses={}, totals=quotas.map(()=>0);
    let size=0;
    while(size<count) {
      const options=[];
      for(const ids of blocks) {
        if(size+ids.length>count) continue;
        const local={...uses};let ok=true;
        for(const id of ids) {local[id]=(local[id]||0)+1;if(local[id]>maxUsesFor(pack,levelId,id))ok=false;}
        const gains=counts(ids);
        if(!ok || quotas.some((q,i)=>q.max!=null && totals[i]+gains[i]>q.max)) continue;
        const needed=quotas.reduce((n,q,i)=>n+Math.min(gains[i],Math.max(0,(q.min||0)-totals[i])),0);
        const turnCount=ids.filter(id=>!signFitsTurn(pack.signs[id],0)).length;
        // Scarce mandatory categories first; preserve a useful mix of turn and
        // straight resources, rather than inventing a turn budget after the fact.
        const selectedTurns=chosen.flat().filter(id=>!signFitsTurn(pack.signs[id],0)).length;
        const turnBias=selectedTurns<Math.min(8,count*0.4)?turnCount*2.5:-turnCount*3;
        const optionalEquipment=ids.filter(id=>pack.signs[id].space?.footprint).length;
        options.push({ids,gains,score:needed*12+turnBias-optionalEquipment*5+Math.random()*2});
      }
      if(!options.length) break;
      options.sort((a,b)=>b.score-a.score);
      const pick=options[0];chosen.push(pick.ids);size+=pick.ids.length;
      pick.ids.forEach(id=>uses[id]=(uses[id]||0)+1);
      pick.gains.forEach((n,i)=>totals[i]+=n);
    }
    const turnsUsed=chosen.flat().filter(id=>!signFitsTurn(pack.signs[id],0)).length;
    if(size===count && turnsUsed>=3 && turnsUsed<=Math.ceil(count*0.5) && quotas.every((q,i)=>totals[i]>=(q.min||0))) {
      return {blocks:chosen,stationCount:count,quotaTotals:totals};
    }
  }
  return null;
}
