import assert from 'node:assert/strict';
import {organizations} from '../src/orgs/registry.js';
import {generateCourse} from '../src/core/generator.js';
import {upgradeCourse} from '../src/core/upgrade.js';
import {isCourseValid} from '../src/core/validator.js';
let seed=20260910; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const {pack} of organizations) {
  const levelId=Object.keys(pack.levels)[0];
  let course=generateCourse({pack,levelId,ring:pack.levels[levelId].defaultRing,includeSequences:true});
  const track=pack.id==='cwags'?['A','P']:pack.id==='caro'?['A','X']:['I','A','X','M'];
  for(const target of track) {
    course=upgradeCourse(course,pack,target).course;
    assert.ok(isCourseValid(course,pack));
    console.log('Procedural progression',pack.id,target,'PASS');
  }
}
