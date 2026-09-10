import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {organizations} from '../src/orgs/registry.js';
import {isCourseValid} from '../src/core/validator.js';
import {routeSignature,silhouetteDistance} from '../src/core/procedural.js';
const moduleUrl=new URL('../src/core/generation-worker.js',import.meta.url).href;
const worker=new Worker(`const {parentPort}=require('node:worker_threads'); global.self={postMessage:data=>parentPort.postMessage(data)}; import(${JSON.stringify(moduleUrl)}).then(()=>{parentPort.on('message',data=>self.onmessage({data}));parentPort.postMessage({ready:true});});`,{eval:true});
await new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);});
const request=(data)=>new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);worker.postMessage(data);});
try {
  const invalid=await request({id:0,packId:'missing',options:{}});
  assert.match(invalid.error,/Unknown organization/);
  const pack=organizations[0].pack,signatures=[];
  for(let id=1;id<=3;id++) {
    const result=await request({id,packId:pack.id,options:{levelId:'S',ring:pack.levels.S.defaultRing}});
    assert.equal(result.id,id);assert.equal(result.error,undefined);assert.ok(isCourseValid(result.course,pack));
    const signature=routeSignature(result.course.nodes);
    assert.ok(signatures.every(s=>silhouetteDistance(s,signature)>=0.042),'worker retains novelty history');
    signatures.push(signature);
  }
  console.log('Worker request/response, error recovery, validation and retained novelty history PASS');
} finally {await worker.terminate();}
