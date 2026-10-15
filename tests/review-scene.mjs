import assert from 'node:assert/strict';
import * as THREE from '../src/vendor/three.module.js';
import {buildReviewScene,reviewSignLayout} from '../src/ui/review-scene.js';
import {makeReviewDemo} from '../src/core/review-demo.js';
import {getPack} from '../src/orgs/registry.js';
const course=makeReviewDemo(),original=JSON.stringify(course),textures=[];
const context=new Proxy({}, {get:()=>()=>{},set:()=>true});
const makeCanvas=()=>({getContext:()=>context});
const world=buildReviewScene(course,getPack('cwags:2021'),{textureFactory:()=>{const t=new THREE.Texture();textures.push(t);return t;},loadSign:()=>new THREE.Texture(),makeCanvas});
assert.equal(world.signs.children.length,5);
const placements=reviewSignLayout(course,getPack('cwags:2021'));
const pivot=placements.find(p=>p.node.signId==='S5');
assert.ok(pivot.z<pivot.node.y&&Math.abs(pivot.x-pivot.node.x)<1e-8,'direction-change sign is ahead on approach');
const halt=placements.find(p=>p.node.signId==='S30');
assert.ok(halt.x>halt.node.x&&Math.abs(halt.z-halt.node.y)<1e-8,'ordinary halt sign is to the approaching handler right');
assert.ok(world.fenceGroup.children.some(n=>n.isInstancedMesh),'lattice uses batched GPU geometry');
world.scene.updateMatrixWorld(true);
for(const group of world.signs.children){
 const i=world.signs.children.indexOf(group),layout=reviewSignLayout(course,getPack('cwags:2021'))[i];
 const normal=new THREE.Vector3(0,0,1).transformDirection(group.matrixWorld);
 assert.ok(Math.abs(normal.x-layout.normalX)<1e-9&&Math.abs(normal.z-layout.normalZ)<1e-9,'sign faces incoming approach, without billboarding');
}
world.scene.traverse(n=>{if(n.isMesh){assert.ok(n.position.toArray().every(Number.isFinite));assert.ok(n.scale.toArray().every(Number.isFinite));}});
world.setFloor('grass');assert.equal(world.scene.getObjectByName('indoor-room').visible,false);
world.setFloor('mats');world.setFloor('gym');assert.equal(textures.length,3,'textures cached per surface');
assert.equal(JSON.stringify(course),original,'review does not edit course');
let disposed=0;world.scene.getObjectByName('floor').geometry.addEventListener('dispose',()=>disposed++);world.dispose();assert.equal(disposed,1);
console.log('True 3D scene, fixed approach signs, batched fence, surface cache and GPU resource disposal PASS');
