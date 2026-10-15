import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import pack from '../src/orgs/cwags-2021.js';
import {validateCourse} from '../src/core/validator.js';
import {cwagsSpaceCatalog} from '../src/core/cwags-space-reference.js';
assert.equal(pack.signs.P16.name,'Turn–Send Over Jump');
assert.equal(pack.signs.P16.generatorEligible,false,'unmodeled jump recall must not be auto-selected');
assert.equal(pack.signs.P21.motion.turnDelta,0);
assert.equal(pack.signs.A21.motion.turnDelta,90);assert.equal(pack.signs.A22.motion.turnDelta,-90);
const course=(gap,id='P17')=>({schemaVersion:3,organizationId:'cwags',levelId:'P',ring:{width:65,height:55},nodes:[{kind:'start',x:5,y:20},{kind:'station',stationId:'left-dog',signId:'A14',x:20,y:20},{kind:'station',stationId:'recall',signId:id,x:20+gap,y:20},{kind:'finish',x:5,y:40}]});
for(const id of ['P17','P18']){
 for(const gap of [8,12,18])assert.ok(!validateCourse(course(gap,id),pack).some(r=>r.code==='cwags:exercise-distance'));
 for(const gap of [7.9,18.1])assert.ok(validateCourse(course(gap,id),pack).some(r=>r.code==='cwags:exercise-distance'&&!r.ok));
}
assert.ok(validateCourse(course(30,'P16'),pack).some(r=>r.code==='cwags:p16-geometry-unverified'&&r.severity==='error'));
assert.ok(validateCourse(course(12),pack).some(r=>r.code==='cwags:space-coverage'&&r.severity==='warn'));
const catalog=cwagsSpaceCatalog(pack);assert.equal(catalog.length,Object.keys(pack.signs).length+2);
assert.ok(catalog.every(s=>s.source&&s.page&&s.designEnvelope));
assert.match(catalog.find(s=>s.id==='S25').designEnvelope,/not an official minimum/);
assert.match(catalog.find(s=>s.id==='S3').movement,/270/);
assert.match(catalog.find(s=>s.id==='S34').movement,/more than 180/);
assert.ok(!readFileSync(new URL('../index.html',import.meta.url),'utf8').includes('reviewDemoBtn'));
assert.ok(!readFileSync(new URL('../src/app.js',import.meta.url),'utf8').includes('reviewDemoBtn'));
console.log('C-WAGS source corrections, recall distance boundaries, unmodeled geometry disclosure, full catalog and demo removal PASS');
