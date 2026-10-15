import {equipmentFootprintFor,equipmentFootprintsOverlap,pointInEquipmentFootprint} from './geometry.js';
import {joinedConnectionFor} from './rules.js';

// Upper ends of ASCA approximate ranges, used as C-WAGS design guidance.
// Anchor placement and the 6-ft width for step exercises are app assumptions.
const profiles={
 S13:{length:15,width:6,back:0},S17:{length:15,width:6,back:15},
 S25:{length:32,width:10,back:3},
 S27:{length:23,width:10,back:3},S28:{length:23,width:10,back:3}
};
export function workingSpaceFor(course,pack,nodeIndex){
 const node=course.nodes[nodeIndex],profile=pack.id==='cwags'&&profiles[node?.signId];
 if(!profile)return null;
 let previous=nodeIndex-1;
 while(previous>=0&&Math.hypot(node.x-course.nodes[previous].x,node.y-course.nodes[previous].y)<.001)previous--;
 if(previous<0)return null;
 const a=course.nodes[previous],dx=node.x-a.x,dy=node.y-a.y;
 const virtual=[{...node},{x:node.x+dx,y:node.y+dy}];
 const fp=equipmentFootprintFor({space:{footprint:{back:profile.back,forward:profile.length-profile.back,halfWidth:profile.width/2}}},virtual,0);
 return {...fp,basis:'cross-organization-design-guidance',source:'ASCA June 2026 §19.4.5; adapted to C-WAGS',assumptions:'Station anchor placement is approximate; step-exercise width is an app allowance.',nodeIndex,stationId:node.stationId};
}
export function workingSpaceReview(course,pack,nodeIndex){
 const area=workingSpaceFor(course,pack,nodeIndex);if(!area)return null;
 const conflicts=[];
 if(area.corners.some(p=>p.x<0||p.y<0||p.x>course.ring.width||p.y>course.ring.height))conflicts.push('estimated area extends beyond ring boundary');
 for(const zone of course.noGoZones||[]){
  const obstacle=equipmentFootprintFor({space:{footprint:{back:zone.height/2,forward:zone.height/2,halfWidth:zone.width/2}}},[{x:zone.x+zone.width/2,y:zone.y+zone.height/2},{x:zone.x+zone.width/2,y:zone.y-1}],0);
  if(equipmentFootprintsOverlap(area,obstacle,0))conflicts.push(`area overlaps ${zone.label||'venue no-go zone'}`);
 }
 course.nodes.forEach((other,i)=>{
  if(i===nodeIndex||other.kind==='waypoint')return;
  const node=course.nodes[nodeIndex];
  if(other.kind==='station'&&(joinedConnectionFor(pack,node,other)||joinedConnectionFor(pack,other,node))){
   const between=course.nodes.slice(Math.min(i,nodeIndex)+1,Math.max(i,nodeIndex));
   if(!between.some(n=>n.kind==='station'))return;
  }
  if(pointInEquipmentFootprint(other,area,0))conflicts.push(`area contains ${other.signId||other.kind} anchor`);
 });
 return {area,conflicts};
}
export function workingSpaceWarnings(course,pack){
 return course.nodes.flatMap((node,i)=>{
  const review=workingSpaceReview(course,pack,i);if(!review?.conflicts.length)return [];
  return [{code:'working-space-guidance',ok:false,severity:'warning',message:`${node.signId}: ${review.conflicts.join('; ')}. ASCA-based design allowance, not a confirmed C-WAGS rule violation.`,details:{stationId:node.stationId,source:review.area.source,conflicts:review.conflicts}}];
 });
}
