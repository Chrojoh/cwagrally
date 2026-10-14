import assert from 'node:assert/strict';
import {ringFence} from '../src/core/ring-scene.js';
for(const start of [{x:20,y:1},{x:59,y:25},{x:20,y:49},{x:1,y:25}]){
 const panels=ringFence({width:60,height:50},start);
 const total=panels.reduce((sum,{a,b})=>sum+Math.hypot(b[0]-a[0],b[1]-a[1]),0);
 assert.ok(Math.abs(total-215)<1e-8,'five-foot opening in 220-foot perimeter');
 for(const {a,b} of panels){
  assert.ok(a.every(Number.isFinite)&&b.every(Number.isFinite));
  assert.ok(Math.hypot(b[0]-a[0],b[1]-a[1])<=6.001);
  assert.ok(a[0]===b[0]||a[1]===b[1]);
 }
}
console.log('Fence perimeter, gate near Start and bounded panel lengths PASS');
