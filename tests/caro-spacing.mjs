import assert from 'node:assert/strict';
import caro from '../src/orgs/caro-2025.js';
import { spacingGuidanceIssues } from '../src/core/spacing.js';
import { validateCourse } from '../src/core/validator.js';
const pair = (from, to, gap) => ({levelId:'N',ring:{width:50,height:40},nodes:[
  {kind:'station',stationId:'a',signId:from,x:10,y:20},
  {kind:'station',stationId:'b',signId:to,x:10+gap,y:20}
]});
assert.equal(spacingGuidanceIssues(pair('100','101',10),caro).length,0);
assert.equal(spacingGuidanceIssues(pair('100','101',9),caro)[0].target,10);
assert.equal(spacingGuidanceIssues(pair('119','120',12),caro)[0].target,15);
assert.equal(spacingGuidanceIssues(pair('119','120',15),caro).length,0);
assert.equal(spacingGuidanceIssues(pair('100','305',12),caro)[0].target,15);
for(const [a,b] of [['201','223'],['215','216'],['515','516'],['518','520'],['527','539']]) {
  assert.equal(spacingGuidanceIssues(pair(a,b,6),caro).length,0,`${a}/${b} companion exempt`);
}
assert.equal(spacingGuidanceIssues(pair('100','101',4),{}).length,0);
const warning=validateCourse(pair('100','101',9),caro).find(r=>r.code==='spacing-guidance');
assert.equal(warning.severity,'warning');
assert.equal(warning.ok,false);
console.log('CARO provisional spacing: thresholds, companion exceptions, organization isolation and warning severity passed.');
