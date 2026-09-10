import assert from 'node:assert/strict';
import pack from '../src/orgs/ckc-2025.js';
import {generateCourse} from '../src/core/generator.js';
import {validateCourse} from '../src/core/validator.js';
import {segmentsCross} from '../src/core/geometry.js';
import {finishAreaClear} from '../src/core/ckc-finish.js';

let seed=20260910;
Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let sample;
for(const levelId of ['X','M']) {
  for(let i=0;i<12;i++) {
    const ring=pack.levels[levelId].defaultRing;
    const noGoZones=i===0?[{x:ring.width/2-2,y:ring.height/2-2,width:4,height:4,label:'Pillar'}]:[];
    const course=generateCourse({pack,levelId,ring,noGoZones,routeStyle:i%3===0?'classic':'surprise'});
    assert.ok(course.finishArea,'area reserved during generation');
    assert.deepEqual(validateCourse(course,pack).filter(r=>!r.ok&&r.severity==='error'),[]);
    const stay=course.auxiliary[0],leash={x:stay.leashX,y:stay.leashY};
    assert.ok(Math.abs(Math.hypot(stay.x-leash.x,stay.y-leash.y)-15)<1e-6);
    assert.ok(Math.min(stay.x,stay.y,ring.width-stay.x,ring.height-stay.y)<=3.01);
    assert.ok(Math.min(leash.x,leash.y,ring.width-leash.x,ring.height-leash.y)<=3.01);
    for(let j=0;j<course.nodes.length-1;j++) {
      assert.ok(!segmentsCross(stay,leash,course.nodes[j],course.nodes[j+1]),'leash walk must not cross course');
    }
    assert.ok(finishAreaClear(course,pack,stay));
    sample=course;
  }
  console.log('CKC',levelId,'12 edge-area courses including pillar and Classic PASS');
}
const blocked=structuredClone(sample),stay=blocked.auxiliary[0];
blocked.noGoZones=[{x:(stay.x+stay.leashX)/2-1,y:(stay.y+stay.leashY)/2-1,width:2,height:2}];
assert.ok(validateCourse(blocked,pack).some(r=>r.code==='ckc:stay-lane-clear'&&!r.ok));
const crossed=structuredClone(sample),s=crossed.auxiliary[0];
const mx=(s.x+s.leashX)/2,my=(s.y+s.leashY)/2;
const dx=(s.leashX-s.x)/15,dy=(s.leashY-s.y)/15;
Object.assign(crossed.nodes[1],{x:mx-dy*5,y:my+dx*5});
Object.assign(crossed.nodes[2],{x:mx+dy*5,y:my-dx*5});
assert.ok(validateCourse(crossed,pack).some(r=>r.code==='ckc:stay-lane-clear'&&!r.ok));
console.log('Venue obstacles and route crossings in the retrieval lane are rejected PASS');
