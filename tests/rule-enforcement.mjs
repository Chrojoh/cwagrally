import assert from 'node:assert/strict';
import pack from '../src/orgs/caro-2025.js';
import {generateCourse} from '../src/core/generator.js';
import {validateCourse} from '../src/core/validator.js';
let seed=20260910;
Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const original=generateCourse({pack,levelId:'N',ring:pack.levels.N.defaultRing,routeStyle:'classic'});
assert.equal(validateCourse(original,pack).filter(r=>!r.ok && r.severity==='error').length,0);
for(const shape of ['classic','mixed','surprise',undefined]) {
  const course=structuredClone(original);
  course.courseShape=shape;
  const start=course.nodes[0],next=course.nodes[1];
  // Place Start on the boundary behind the first station: zero approach room.
  const dx=start.x-next.x,dy=start.y-next.y;
  const limits=[];
  if(dx>0) limits.push((course.ring.width-next.x)/dx);
  if(dx<0) limits.push(-next.x/dx);
  if(dy>0) limits.push((course.ring.height-next.y)/dy);
  if(dy<0) limits.push(-next.y/dy);
  const scale=Math.min(...limits);
  start.x=next.x+dx*scale;start.y=next.y+dy*scale;
  assert.ok(validateCourse(course,pack).some(r=>r.code==='caro:start-clearance' && !r.ok && r.severity==='error'),String(shape));
  // Companion 213 cannot appear without its required predecessor 212.
  const station=course.nodes.find(n=>n.kind==='station');
  station.signId='213';
  assert.ok(validateCourse(course,pack).some(r=>r.code==='required-predecessor' && !r.ok && r.severity==='error'),String(shape));
}
console.log('Mandatory CARO approach and companion checks apply to every route mode PASS');