import assert from 'node:assert/strict';
import pack from '../src/orgs/cwags-2021.js';
import {setJoinDecision,joinedConnectionFor,refreshJoinedFlags} from '../src/core/rules.js';
import {stationMeasurements} from '../src/core/station-measurements.js';
import {validateCourse} from '../src/core/validator.js';
const a={kind:'station',stationId:'a',signId:'S5',x:10,y:10};
const b={kind:'station',stationId:'b',signId:'S11',x:20,y:10};
assert.equal(joinedConnectionFor(pack,a,b),null);
setJoinDecision(pack,a,b,'joined');assert.equal(joinedConnectionFor(pack,a,b).origin,'explicit');
const course={organizationId:'cwags',levelId:'S',ring:{width:60,height:60},nodes:[{kind:'start',x:5,y:10},a,{kind:'waypoint',x:10,y:20},b,{kind:'finish',x:30,y:10}]};
refreshJoinedFlags(course,pack);assert.equal(b.joinedToPrevious,true);
const m=stationMeasurements(course,pack,'b');assert.equal(m.before.anchorFeet,10);assert.ok(m.before.routeFeet>24);
assert.equal(stationMeasurements(JSON.parse(JSON.stringify(course)),pack,'b').before.joined.origin,'explicit');
setJoinDecision(pack,a,b,'separate');refreshJoinedFlags(course,pack);assert.equal(b.joinedToPrevious,undefined);
setJoinDecision(pack,a,b,'joined');a.stationId='replacement';assert.equal(joinedConnectionFor(pack,a,b),null);assert.equal(stationMeasurements(course,pack,'b').staleJoin,true);
assert.ok(validateCourse(course,pack).some(r=>r.code==='joined-stale'));
assert.throws(()=>setJoinDecision(pack,a,{...b,signId:'S1'},'joined'));
for(const id of ['A15','P17']){
 const c={organizationId:'cwags',levelId:id==='A15'?'A':'P',ring:{width:70,height:60},nodes:[{kind:'start',x:5,y:20},{kind:'station',stationId:'leave',signId:'A14',x:10,y:20},{kind:'station',stationId:'recall',signId:id,x:40,y:20},{kind:'finish',x:50,y:20}]};
 const issue=validateCourse(c,pack).find(r=>r.code==='cwags:exercise-distance');assert.ok(issue);assert.equal(issue.severity,id==='A15'?'warn':'error');
}
console.log('Explicit joining, stale decisions, saved courses, route/anchor measurements and approximate-distance severity PASS');
