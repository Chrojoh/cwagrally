import assert from 'node:assert/strict';
import {readFileSync,existsSync}from'node:fs';
import pack from'../src/orgs/cwags-2021.js';
const inventory=JSON.parse(readFileSync(new URL('../sign-inventory.json',import.meta.url),'utf8'));
const expected=Object.values(inventory.groups).flat();
assert.equal(expected.length,97);assert.equal(new Set(expected).size,97);
for(const id of expected){const path=new URL('../Signs/'+id+'.png',import.meta.url);assert.ok(existsSync(path),id);assert.equal(readFileSync(path).subarray(0,8).toString('hex'),'89504e470d0a1a0a',id+' PNG signature');}
for(const id of Object.keys(pack.signs))assert.ok(expected.includes(id),id+' missing from official-list inventory');
assert.equal(pack.assetBase,'./Signs/','bundled assets must not depend on remote main branch');
console.log('97 canonical C-WAGS image paths, PNG signatures and local asset mapping PASS');
