import { planSkeleton } from './skeleton.js';
import { segmentsCross, requiredTurnAt, signFitsTurn, equipmentPlacementConflicts } from './geometry.js';
import { maxUsesFor } from './rules.js';

export const COURSE_SHAPES = ['surprise','flowing','geometric','spiral','diagonal','classic'];
const histories = new Map();
const rand = (a, b) => a + Math.random() * (b - a);

// Arc-length sampling makes comparison independent of station count and spacing.
// Canonical comparisons include reflections and reversal: those alone aren't novelty.
export function routeSignature(nodes) {
  const xs = nodes.map(p => p.x), ys = nodes.map(p => p.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const scale = Math.max(Math.max(...xs)-minX, Math.max(...ys)-minY, 1);
  const pts = nodes.map(p => ({x:(p.x-minX)/scale,y:(p.y-minY)/scale}));
  const lengths = [0];
  for (let i=1;i<pts.length;i++) lengths.push(lengths[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));
  return Array.from({length:48}, (_,i) => {
    const d = lengths.at(-1)*i/47;
    let j=1;
    while(j<lengths.length-1 && lengths[j]<d) j++;
    const t=(d-lengths[j-1])/(lengths[j]-lengths[j-1] || 1);
    return [pts[j-1].x+(pts[j].x-pts[j-1].x)*t,pts[j-1].y+(pts[j].y-pts[j-1].y)*t];
  });
}

export function silhouetteDistance(a,b) {
  let best=Infinity;
  for(const swap of [false,true]) for(const sx of [-1,1]) for(const sy of [-1,1]) {
    const transformed=b.map(p => [sx*p[swap?1:0],sy*p[swap?0:1]]);
    const ax=a.reduce((s,p)=>s+p[0],0)/a.length, ay=a.reduce((s,p)=>s+p[1],0)/a.length;
    const bx=transformed.reduce((s,p)=>s+p[0],0)/b.length, by=transformed.reduce((s,p)=>s+p[1],0)/b.length;
    const centered=transformed.map(p=>[p[0]-bx+ax,p[1]-by+ay]);
    const directed=(u,v)=>{
      let sum=0;
      for(const p of u) {
        let nearest=Infinity;
        for(const q of v) {
          const dx=p[0]-q[0],dy=p[1]-q[1];
          nearest=Math.min(nearest,dx*dx+dy*dy);
        }
        sum+=Math.sqrt(nearest);
      }
      return sum/u.length;
    };
    best=Math.min(best,(directed(a,centered)+directed(centered,a))/2);
  }
  return best;
}

export function generationHistory(key) {
  if(!histories.has(key)) histories.set(key,[]);
  return histories.get(key);
}
export function rememberCourse(history,course) {
  history.push({signature:routeSignature(course.nodes),family:course.routeFamily});
  if(history.length>24) history.shift();
  return course;
}
export function pickShape(style,history,attempt=0) {
  if(style!=='surprise') return style;
  const choices=['flowing','geometric','spiral','diagonal','freeform'];
  const counts=choices.map(shape=>({shape,n:history.filter(h=>h.family===`procedural-${shape}`).length}));
  counts.sort((a,b)=>a.n-b.n || a.shape.localeCompare(b.shape));
  // Rotate through all families during retries; difficult families cannot block generation.
  const min=counts[0].n;
  const pool=counts.filter(c=>c.n===min);
  return attempt%5===0 ? pool[Math.floor(Math.random()*pool.length)].shape : counts[attempt%5].shape;
}

function pointSegment(p,a,b) {
  const dx=b.x-a.x,dy=b.y-a.y;
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}

// A bounded self-avoiding walk generates its own topology. Equal lattice spacing
// preserves exact 45-degree headings even in rectangular rings. Random pitch,
// origin, heading, turn bias and run lengths change the control polygon itself.
export function makeProceduralRoute({count,width,height,shape,pack,levelId,includeSequences=false}) {
  const level=pack.levels[levelId];
  const plan=planSkeleton({pack,levelId,count,includeSequences,shape});
  if(!plan) throw Error('No feasible exercise skeleton');
  const available=new Set(plan.blocks.map((_,i)=>i));
  let initialPending=[];
  const ordinary=level.ordinarySpacing?.min ?? pack.ordinarySpacing?.min ?? 0;
  const pitch=ordinary || rand(6.5,10.4);
  const cols=Math.floor((width-8)/pitch), rows=Math.floor((height-8)/pitch);
  if((cols+1)*(rows+1)<count+2) throw Error('Insufficient procedural grid capacity');
  const ox=rand(3,width-cols*pitch-3),oy=rand(3,height-rows*pitch-3);
  const dirs=Array.from({length:8},(_,i)=>({x:Math.round(Math.cos(i*Math.PI/4)),y:Math.round(Math.sin(i*Math.PI/4))}));
  const signs=level.allowedSigns.map(id=>pack.signs[id]).filter(s=>s && s.generatorEligible!==false && !pack.dependentSigns?.has(s.id));
  const capacities=new Map();
  for(const turn of [-135,-90,-45,0,45,90,135]) capacities.set(turn,signs.filter(s=>signFitsTurn(s,turn)).reduce((n,s)=>n+Math.min(count,maxUsesFor(pack,levelId,s.id)),0));
  const chirality=Math.random()<0.5?-1:1;
  const start={x:Math.floor(rand(0,cols+1)),y:Math.floor(rand(0,rows+1))};
  const grid=[start], points=[{x:ox+start.x*pitch,y:oy+start.y*pitch}];
  const used=new Set([`${start.x},${start.y}`]), turnCounts=new Map();
  let initialHeading=null;
  const equipmentIds=[...(pack.progressionReserve?.[levelId]||[]).flatMap(r=>r.signIds||[]),...(level.quotas||[]).filter(q=>q.min>0).flatMap(q=>q.signIds||[])];
  const longEquipment=equipmentIds.map(id=>pack.signs[id]).find(s=>(s?.space?.footprint?.forward||0)>pitch*2);
  if(longEquipment && Math.random()<0.8) {
    const fp=longEquipment.space.footprint;
    const back=Math.ceil(((fp.back||0)+1.2)/pitch),forward=Math.ceil((fp.forward+1.2)/pitch);
    const vertical=rows>=back+forward && (cols<back+forward || Math.random()<0.5);
    const span=vertical?rows:cols,cross=vertical?cols:rows;
    const laneMin=Math.ceil(((fp.halfWidth||0)+1.2)/pitch);
    if(span>=back+forward && cross>=laneMin*2) {
      const sign=Math.random()<0.5?1:-1;
      const origin=sign===1?Math.floor(rand(0,span-back-forward+1)):span-Math.floor(rand(0,span-back-forward+1));
      const lane=Math.floor(rand(laneMin,cross-laneMin+1));
      grid.length=0;points.length=0;used.clear();
      for(const offset of [0,back,back+forward]) {
        const g=vertical?{x:lane,y:origin+sign*offset}:{x:origin+sign*offset,y:lane};
        grid.push(g);points.push({x:ox+g.x*pitch,y:oy+g.y*pitch});used.add(`${g.x},${g.y}`);
      }
      initialHeading=vertical?(sign===1?2:6):(sign===1?0:4);
      turnCounts.set(0,1);
    }
  }
  if(initialHeading!=null) {
    const starters=[...available].filter(i=>signFitsTurn(pack.signs[plan.blocks[i][0]],0));
    if(!starters.length) throw Error('Skeleton has no straight equipment-bay anchor');
    const first=starters[Math.floor(Math.random()*starters.length)];
    points[1].signId=plan.blocks[first][0];available.delete(first);initialPending=plan.blocks[first].slice(1);
  }
  let budget=3500;
  const clearance=Math.max(4.5,ordinary*0.48);
  function walk(heading,pending=[]) {
    if(points.length===count+2) return available.size===0 && pending.length===0;
    if(--budget<=0) return false;
    const options=[];
    for(let dir=0;dir<8;dir++) for(const stride of [1,2,3]) {
      let delta=heading==null?0:((dir-heading+12)%8-4)*45;
      if(Math.abs(delta)>135 || (heading!=null && (turnCounts.get(delta)||0)>=(capacities.get(delta)||0))) continue;
      if(shape==='geometric' && dir%2) continue;
      const last=grid.at(-1),next={x:last.x+dirs[dir].x*stride,y:last.y+dirs[dir].y*stride};
      if(next.x<0||next.x>cols||next.y<0||next.y>rows||used.has(`${next.x},${next.y}`)) continue;
      const p={x:ox+next.x*pitch,y:oy+next.y*pitch},a=points.at(-1);
      let blocked=false;
      for(let i=0;i<points.length-1;i++) {
        if(pointSegment(p,points[i],points[i+1])<clearance) {blocked=true;break;}
        if(i<points.length-2 && (segmentsCross(a,p,points[i],points[i+1]) || pointSegment(points[i],a,p)<clearance)) {blocked=true;break;}
      }
      if(blocked) continue;
      if(initialHeading!=null && equipmentPlacementConflicts({nodes:[...points,p],nodeIndex:1,sign:longEquipment,ring:{width,height},buffer:1}).length) continue;
      const currentIndex=points.length-1;
      let exercises=currentIndex===0?[{id:null,block:null,tail:[]}]:pending.length?[{id:pending[0],block:null,tail:pending.slice(1)}]:
        [...available].map(i=>({id:plan.blocks[i][0],block:i,tail:plan.blocks[i].slice(1)}));
      exercises=exercises.filter(e=>e.id==null || signFitsTurn(pack.signs[e.id],delta));
      exercises=exercises.filter(e=>{
        if(currentIndex<2 || !e.id) return true;
        const previous=points[currentIndex-1],current=points[currentIndex];
        const rule=(pack.adjacentDistanceRules||[]).find(r=>r.from.includes(previous.signId)&&r.to.includes(e.id));
        if(!rule) return true;
        const gap=Math.hypot(current.x-previous.x,current.y-previous.y);
        return (rule.min==null||gap+1e-6>=rule.min) && (rule.max==null||gap-1e-6<=rule.max) &&
          (rule.target==null||Math.abs(gap-rule.target)<=(rule.tolerance??1));
      });
      if(!exercises.length) continue;
      // Check actual committed equipment, including the new sign's approach and
      // exit. A later route segment cannot consume an earlier working bay.
      exercises=exercises.filter(e=>{
        const trial=[...points.map(n=>({...n})),p];
        trial[currentIndex].signId=e.id;
        const placements=[];
        for(let i=1;i<trial.length-1;i++) {
          const sign=pack.signs[trial[i].signId];
          if(!sign?.space?.footprint) continue;
          if(equipmentPlacementConflicts({nodes:trial,nodeIndex:i,sign,ring:{width,height},otherPlacements:placements,buffer:1}).length) return false;
          placements.push({nodeIndex:i,sign});
        }
        return true;
      });
      if(!exercises.length) continue;
      let weight=delta===0?6:1;
      if(shape==='flowing') weight*=Math.abs(delta)===45?2:Math.abs(delta)===90?0.55:1;
      if(shape==='diagonal') weight*=dir%2?3:0.8;
      if(shape==='spiral') weight*=delta*chirality>0?4:delta*chirality<0?0.04:1;
      if(shape==='freeform') weight=delta===0?2:1.5;
      weight*=stride===1?1:stride===2?0.35:0.16;
      options.push({dir,delta,next,p,exercises,key:-Math.log(Math.random() || 1e-9)/weight});
    }
    options.sort((a,b)=>a.key-b.key);
    for(const o of options) {
      const seen=new Set();
      const choices=o.exercises.sort(()=>Math.random()-0.5).filter(e=>{
        const key=JSON.stringify([e.id,...e.tail].map(id=>[pack.signs[id]?.motion,pack.signs[id]?.space,pack.signs[id]?.requiredPrevious]));if(seen.has(key))return false;seen.add(key);return true;
      }).slice(0,3);
      for(const e of choices) {
        const current=points.at(-1),oldId=current.signId;
        if(e.id) current.signId=e.id;
        if(e.block!=null) available.delete(e.block);
        grid.push(o.next);points.push(o.p);used.add(`${o.next.x},${o.next.y}`);
        if(heading!=null) turnCounts.set(o.delta,(turnCounts.get(o.delta)||0)+1);
        if(walk(o.dir,e.tail)) return true;
        if(heading!=null) turnCounts.set(o.delta,turnCounts.get(o.delta)-1);
        grid.pop();points.pop();used.delete(`${o.next.x},${o.next.y}`);
        if(e.block!=null) available.add(e.block);
        current.signId=oldId;
        if(budget<=0) return false;
      }
    }
    return false;
  }
  if(!walk(initialHeading,initialPending)) throw Error('No self-avoiding route found in this search');
  // Leave meaningful straight working runs for equipment and sign quotas.
  if(points.slice(1,-1).filter((_,i)=>Math.abs(requiredTurnAt(points,i+1))<1).length<count*0.45) throw Error('Too few straight working stations');
  points.skeletonPlanned=true;
  points.routeFamily=`procedural-${shape}`;
  return points;
}
