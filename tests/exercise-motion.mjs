import assert from 'node:assert/strict';
import {exerciseScript,sampleExercise,exerciseWorldPose} from '../src/core/exercise-motion.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} vs ${b}`);
const end=id=>{const s=exerciseScript('cwags',id);return sampleExercise(s,s.duration);};
close(end('S3').heading,3*Math.PI/2);close(end('S4').heading,-3*Math.PI/2);
close(end('S23').heading,2*Math.PI);close(end('S24').heading,-2*Math.PI);
close(end('S23').x,0);close(end('S23').y,0);
close(end('S5').x,0);close(end('S5').y,0);close(end('S5').heading,Math.PI/2);
close(end('S17').x,-9);close(end('S17').y,0);close(end('S17').heading,0);
close(end('S13').x,9);
close(end('S22').heading,0);assert.ok(end('S22').y>0);
close(end('S31').heading,0);assert.ok(end('S31').y<0);
const transformed=exerciseWorldPose({x:10,y:20,heading:Math.PI/2},end('S17'));
close(transformed.x,10);close(transformed.y,11);
assert.equal(exerciseScript('ckc','S3'),null);
assert.equal(exerciseScript('cwags','S27'),null,'unsupported signs are not guessed');
for(const id of ['S1','S3','S5','S17','S22','S23','S31']){
 const s=exerciseScript('cwags',id);let previous=sampleExercise(s,0);
 for(let t=.01;t<s.duration;t+=.01){const current=sampleExercise(s,t);assert.ok(Math.hypot(current.x-previous.x,current.y-previous.y)<.2);assert.ok(Math.abs(current.heading-previous.heading)<.1);previous=current;}
}
console.log('Exercise full rotation, pivot position, backing gaze, zig/zag, world transform and motion continuity PASS');
