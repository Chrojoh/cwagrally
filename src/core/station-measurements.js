import {joinedConnectionFor,joinDecisionValid} from './rules.js';
export function stationMeasurements(course,pack,stationId){
 const index=course.nodes.findIndex(n=>n.kind==='station'&&n.stationId===stationId);
 if(index<0)return null;
 const node=course.nodes[index];
 function neighbour(step){for(let i=index+step;i>=0&&i<course.nodes.length;i+=step)if(['station','start','finish'].includes(course.nodes[i].kind))return i;return -1;}
 function leg(otherIndex){
  if(otherIndex<0)return null;
  const other=course.nodes[otherIndex],from=otherIndex<index?other:node,to=otherIndex<index?node:other;
  let routeFeet=0;for(let i=Math.min(index,otherIndex);i<Math.max(index,otherIndex);i++)routeFeet+=Math.hypot(course.nodes[i+1].x-course.nodes[i].x,course.nodes[i+1].y-course.nodes[i].y);
  const rule=(pack.adjacentDistanceRules||[]).find(r=>r.from.includes(from.signId)&&r.to.includes(to.signId));
  return {other,anchorFeet:Math.hypot(node.x-other.x,node.y-other.y),routeFeet,rule:rule||null,joined:from.kind==='station'&&to.kind==='station'?joinedConnectionFor(pack,from,to):null};
 }
 const before=leg(neighbour(-1)),after=leg(neighbour(1));
 return {node,before,after,staleJoin:!!node.joinDecision&&(!before||!joinDecisionValid(before.other,node))};
}
