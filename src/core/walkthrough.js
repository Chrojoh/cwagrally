// Route preview only: movements within individual exercises are not simulated.
export function buildWalkthrough(course) {
  let distance=0, ordinal=0;
  const stops=[];
  const nodes=course.nodes.map((node,index)=>{
    if(index) distance+=Math.hypot(node.x-course.nodes[index-1].x,node.y-course.nodes[index-1].y);
    const entry={...node,distance,ordinal:node.kind==='station'?++ordinal:null};
    if(['station','start','finish'].includes(node.kind)) stops.push(entry);
    return entry;
  });
  return {nodes,stops,length:distance};
}
export function sampleWalkthrough(route,distance) {
  const d=Math.max(0,Math.min(route.length,Number(distance)||0));
  let i=route.nodes.findIndex((n,index)=>index>0&&n.distance>d);
  if(i<0) i=route.nodes.length-1;
  const a=route.nodes[Math.max(0,i-1)],b=route.nodes[i]||a;
  if(!a) return null;
  const span=b.distance-a.distance,t=span>0?(d-a.distance)/span:0;
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,heading:Math.atan2(b.y-a.y,b.x-a.x),distance:d,next:route.stops.find(n=>n.distance>d+0.01)||route.stops.at(-1)};
}

// Blend the viewing direction around corners without rounding the route itself.
export function walkthroughHeading(route,distance,lookAhead=2) {
  const before=sampleWalkthrough(route,distance-lookAhead);
  const after=sampleWalkthrough(route,distance+lookAhead);
  if(!before||!after)return 0;
  const dx=after.x-before.x,dy=after.y-before.y;
  return Math.hypot(dx,dy)>0.001?Math.atan2(dy,dx):sampleWalkthrough(route,distance).heading;
}
export function easeHeading(current,target,dt) {
  const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+delta*(1-Math.exp(-Math.max(0,dt)*7));
}
