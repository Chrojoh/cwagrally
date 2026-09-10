import { segmentsCross } from './geometry.js';
import { routeNoGoConflicts, equipmentNoGoConflicts } from './venue.js';

// Layout preferences, not extra CKC rules: reserve an eight-foot edge strip.
export function planFinishArea(ring, attempt) {
  const side=attempt%4;
  const width=side%2 ? ring.height : ring.width;
  const height=side%2 ? ring.width : ring.height;
  const map=p=>side===0 ? {...p} : side===1 ? {...p,x:ring.width-p.y,y:p.x}
    : side===2 ? {...p,x:ring.width-p.x,y:ring.height-p.y} : {...p,x:p.y,y:ring.height-p.x};
  return {width,height:height-8,fullHeight:height,map,side};
}

export function connectFinishArea(points, plan, ring, zones) {
  const last=points.at(-2),end=points.at(-1);
  if(!last||!end) return null;
  // Preserve the last exercise's exit direction when extending to the strip.
  if(end.y<last.y) {
    if(points.skeletonPlanned) return null; // A reflection would reverse assigned turns.
    for(const p of points) p.y=plan.height-p.y;
  }
  const dy=end.y-last.y,dx=end.x-last.x;
  if(dy<=0.01) return null;
  const y=plan.fullHeight-3,x=last.x+dx/dy*(y-last.y);
  const direction=x+20<=plan.width-2 ? 1 : x-20>=2 ? -1 : 0;
  if(!direction || x<2 || x>plan.width-2) return null;
  end.x=x;end.y=y;
  const transformed=points.map(plan.map);
  for(let i=0;i<transformed.length-3;i++) {
    if(segmentsCross(transformed[i],transformed[i+1],transformed.at(-2),transformed.at(-1))) return null;
  }
  const finish=plan.map({x,y}),stay=plan.map({x:x+5*direction,y}),leash=plan.map({x:x+20*direction,y});
  if(routeNoGoConflicts([finish,stay,leash],zones,2).length) return null;
  transformed.routeFamily=points.routeFamily;
  transformed.skeletonPlanned=points.skeletonPlanned;
  return {points:transformed,area:{side:plan.side,finish,stay,leash}};
}

export function plannedStay(course, signId) {
  const area=course.finishArea;
  if(!area) return null;
  const finish=course.nodes.find(n=>n.kind==='finish');
  // Moving Finish invalidates its old reservation; the caller can replan it.
  if(!finish||Math.hypot(finish.x-area.finish.x,finish.y-area.finish.y)>0.01) return null;
  return [{kind:'auxiliary',id:signId==='298'?'sit-stay':'stand-stay',signId,
    label:signId==='298'?'Sit Stay after Finish':'Stand Stay after Finish',
    x:area.stay.x,y:area.stay.y,leashX:area.leash.x,leashY:area.leash.y,
    finishX:finish.x,finishY:finish.y,distanceFt:15,afterFinish:true,counted:false,
    note:'Reserved edge area: Finish, Stay, then 15 ft forward to the leash. Return around and behind the dog before exiting.'}];
}

export function finishAreaClear(course, pack, aux) {
  if(!aux) return false;
  const finish=course.nodes.find(n=>n.kind==='finish');
  const stay={x:aux.x,y:aux.y},leash={x:aux.leashX,y:aux.leashY};
  if(!finish || ![stay.x,stay.y,leash.x,leash.y].every(Number.isFinite)) return false;
  if(routeNoGoConflicts([finish,stay,leash],course.noGoZones||[],1).length) return false;
  const distanceToSegment=(p,a,b)=>{
    const dx=b.x-a.x,dy=b.y-a.y;
    const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
  };
  // Include the walk from Finish and the full retrieval lane, not just Stay.
  const samples=[];
  for(const [a,b] of [[finish,stay],[stay,leash]]) {
    const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*2);
    for(let k=0;k<=steps;k++) samples.push({x:a.x+(b.x-a.x)*k/steps,y:a.y+(b.y-a.y)*k/steps});
  }
  for(const p of samples) for(let i=0;i<course.nodes.length-1;i++) {
    const a=course.nodes[i],b=course.nodes[i+1];
    if(b.kind==='finish' && Math.hypot(p.x-finish.x,p.y-finish.y)<2) continue;
    if(distanceToSegment(p,a,b)<1.5-1e-6) return false;
  }
  // Check the walking area against actual equipment envelopes as well.
  const zones=samples.map(p=>({x:p.x-1,y:p.y-1,width:2,height:2}));
  for(let i=0;i<course.nodes.length;i++) {
    const sign=pack.signs[course.nodes[i].signId];
    if(sign?.space?.footprint && equipmentNoGoConflicts({nodes:course.nodes,nodeIndex:i,sign,zones,buffer:0}).length) return false;
  }
  return true;
}
