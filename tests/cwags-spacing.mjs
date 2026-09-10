import assert from 'node:assert/strict';
import pack from '../src/orgs/cwags-2021.js';
import {generateCourse} from '../src/core/generator.js';
import {validateCourse} from '../src/core/validator.js';
import {joinedRuleFor} from '../src/core/rules.js';
let seed=20260910;
Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let sample;
function spacing(c){return validateCourse(c,pack).find(r=>r.code==='ordinary-spacing');}
for(const [levelId,level] of Object.entries(pack.levels)) {
  if(level.generationEnabled===false) continue;
  for(let i=0;i<8;i++) {
    const c=generateCourse({pack,levelId,ring:level.defaultRing,routeStyle:i===0?'classic':'surprise',includeSequences:i%2===0});
    assert.ok(!validateCourse(c,pack).some(r=>!r.ok&&r.severity==='error'));
    const stations=c.nodes.filter(n=>n.kind==='station');
    for(let a=0;a<stations.length;a++) for(let b=a+1;b<stations.length;b++) {
      const x=stations[a],y=stations[b];
      const except=b===a+1&&(joinedRuleFor(pack,x.signId,y.signId)||(pack.adjacentDistanceRules||[]).some(r=>r.from.includes(x.signId)&&r.to.includes(y.signId)));
      if(!except) assert.ok(Math.hypot(x.x-y.x,x.y-y.y)>=10-1e-6,`${levelId}: ${a+1}/${b+1}`);
    }
    sample??=c;
  }
  console.log('C-WAGS',levelId,'8 generated courses obey 10-foot spacing PASS');
}
for(const other of [1,3]) {
  const c=structuredClone(sample),stations=c.nodes.filter(n=>n.kind==='station');
  stations[0].signId='S9';stations[other].signId='S9';
  stations[other].x=stations[0].x+9.9;stations[other].y=stations[0].y;
  const r=spacing(c);
  assert.equal(r.ok,false);assert.equal(r.severity,'error');
  assert.ok(r.details.some(d=>d.station===1&&d.nextStation===other+1));
}
for(const rule of [...pack.joinedPairRules,...pack.adjacentDistanceRules]) {
  const c=structuredClone(sample);
  c.nodes=[{kind:'station',stationId:'a',signId:rule.from[0],x:10,y:10},{kind:'station',stationId:'b',signId:rule.to[0],x:15,y:10}];
  assert.equal(spacing(c).ok,true,'explicit pair exception');
}
console.log('Adjacent and nonadjacent violations rejected; explicit pair exceptions retained PASS');