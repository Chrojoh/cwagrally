import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {organizations} from '../src/orgs/registry.js';
import {generateCourse} from '../src/core/generator.js';
import {validateCourse} from '../src/core/validator.js';
import {requiredTurnAt,segmentsCross} from '../src/core/geometry.js';
import {routeSignature,silhouetteDistance,COURSE_SHAPES} from '../src/core/procedural.js';
import {routeStylesFor} from '../src/core/pack.js';
let seed=Number(process.env.SEED || 20260910);
Math.random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const gallery=[],report=[];
function check(c,p) {
  const errors=validateCourse(c,p).filter(r=>!r.ok&&r.severity==='error');
  assert.equal(errors.length,0,JSON.stringify(errors));
  for(let i=1;i<c.nodes.length-1;i++) assert.ok(Math.abs(requiredTurnAt(c.nodes,i)/45-Math.round(requiredTurnAt(c.nodes,i)/45))<1e-6,'exact 45 degree heading');
  for(let i=0;i<c.nodes.length-1;i++) for(let j=i+2;j<c.nodes.length-1;j++) assert.ok(!segmentsCross(c.nodes[i],c.nodes[i+1],c.nodes[j],c.nodes[j+1]),'no crossing');
}
for(const {pack:p} of organizations) {
  const levelId=Object.keys(p.levels)[0],families={},clusters=[],times=[];
  let failures=0;
  for(let i=0;i<50;i++) {
    if(i%10===0) console.log('BATCH',p.id,i,'of 50');
    const start=Date.now();
    try {
      const c=generateCourse({pack:p,levelId,ring:p.levels[levelId].defaultRing});
      check(c,p);times.push(Date.now()-start);
      const signature=routeSignature(c.nodes);
      if(!clusters.some(s=>silhouetteDistance(signature,s)<0.045)) clusters.push(signature);
      families[c.routeFamily]=(families[c.routeFamily]||0)+1;
      gallery.push(c);
    } catch(e) {failures++;console.log('FAIL',p.id,i,e.message);}
  }
  const result={organization:p.id,generations:50,failures,distinct:clusters.length,families,maxMs:Math.max(...times)};
  report.push(result);console.log(JSON.stringify(result));
}
for(const {pack:p} of organizations) for(const [levelId,level] of Object.entries(p.levels)) {
  if(level.generationEnabled===false) continue;
  for(const shape of ['surprise',...(levelId===Object.keys(p.levels)[0]?['flowing','geometric','spiral','diagonal','classic']:[])]) {

    const start=Date.now();
    try {
      const c=generateCourse({pack:p,levelId,ring:level.defaultRing,routeStyle:shape,includeSequences:true});check(c,p);
      console.log('LEVEL',p.id,levelId,shape,'PASS',Date.now()-start);
    }catch(e){console.log('LEVEL',p.id,levelId,shape,'FAIL',Date.now()-start,e.message);report.push({organization:p.id,levelId,shape,error:e.message});}
  }
  assert.deepEqual([...routeStylesFor(p,level)],COURSE_SHAPES);
}
const sample=routeSignature([{x:0,y:0},{x:10,y:0},{x:10,y:20},{x:5,y:20}]);
const reflected=routeSignature([{x:95,y:50},{x:90,y:50},{x:90,y:30},{x:100,y:30}]);
assert.ok(silhouetteDistance(sample,reflected)<1e-9,'mirroring and reversal do not create novelty');
mkdirSync(new URL('../test-results/',import.meta.url),{recursive:true});
writeFileSync(new URL('../test-results/generation-report.json',import.meta.url),JSON.stringify(report,null,2));
writeFileSync(new URL('../test-results/route-gallery.html',import.meta.url),`<!doctype html><meta charset="utf-8"><title>Procedural course variety — 50 per organization</title><style>body{font:14px system-ui;background:#f3f5f7;margin:24px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}figure{background:white;padding:10px;margin:0}svg{width:100%;height:180px}h2{grid-column:1/-1}figcaption{font-size:12px}</style><h1>50 consecutive generations per organization</h1><p>Paths shown without signs so silhouettes can be compared. Every course passed the rule-pack validator.</p><div class="grid">${gallery.map((c,i)=>`${i===0||gallery[i-1].organizationId!==c.organizationId?`<h2>${c.organizationId.toUpperCase()}</h2>`:''}<figure><svg viewBox="0 0 ${c.ring.width} ${c.ring.height}"><rect width="${c.ring.width}" height="${c.ring.height}" fill="#fafafa" stroke="#bbc6cf" stroke-width=".4"/><polyline points="${c.nodes.map(n=>`${n.x},${n.y}`).join(' ')}" fill="none" stroke="#176975" stroke-width=".55"/>${c.nodes.map((n,j)=>`<circle cx="${n.x}" cy="${n.y}" r="${j===0||j===c.nodes.length-1?1.1:.65}" fill="${j===0?'#279145':j===c.nodes.length-1?'#c34343':'#176975'}"/>`).join('')}</svg><figcaption>${i%50+1} · ${c.routeFamily}</figcaption></figure>`).join('')}</div>`);
assert.ok(report.every(r=>!r.error && r.failures===0 && r.distinct>=20 && Math.max(...Object.values(r.families))<=25), 'all levels and variety targets must pass');
