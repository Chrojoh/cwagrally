import assert from 'node:assert/strict';
import fs from 'node:fs';
import {organizations} from '../src/orgs/registry.js';
import {improveWorkingSpace} from '../src/core/upgrade.js';
import {evaluateCourseQuality} from '../src/core/quality.js';
import {isCourseValid} from '../src/core/validator.js';
const pack = organizations.find(o => o.pack.id === 'ckc').pack;
const source = JSON.parse(fs.readFileSync(new URL('./fixtures/ckc-crowded.json', import.meta.url)));
const original = JSON.stringify(source);
const repaired = improveWorkingSpace(source, pack);
assert.equal(JSON.stringify(source), original);
assert.ok(isCourseValid(repaired, pack));
assert.ok(evaluateCourseQuality(repaired, pack).categories.working.score >= 80);
assert.ok(evaluateCourseQuality(repaired, pack).overall > evaluateCourseQuality(source, pack).overall);
assert.deepEqual(repaired.nodes.map(n => n.signId), source.nodes.map(n => n.signId));
assert.deepEqual(repaired.nodes.map(n => n.stationId), source.nodes.map(n => n.stationId));
const finish = repaired.nodes.at(-1);
assert.equal(finish.x, source.finishArea.finish.x);
assert.equal(finish.y, source.finishArea.finish.y);
const locked = structuredClone(source);
locked.nodes.forEach(n => { n.locked = true; });
const retained = improveWorkingSpace(locked, pack);
for (let i = 0; i < locked.nodes.length - 1; i++) {
  assert.equal(retained.nodes[i].x, locked.nodes[i].x);
  assert.equal(retained.nodes[i].y, locked.nodes[i].y);
}
console.log('Saved CKC crowding regression PASS: working space 49 →', evaluateCourseQuality(repaired, pack).categories.working.score);
