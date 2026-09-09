import { organizations, getPack } from './orgs/registry.js';
import { generateCourse } from './core/generator.js';
import { upgradeCourse } from './core/upgrade.js';
import { validateCourse } from './core/validator.js';
import { candidateSignsForNode } from './core/rules.js';
import { downloadJson, readCourseFile } from './core/storage.js';
import { exportCoursePdf } from './core/pdf.js';
import { recalcHeadings } from './core/geometry.js';
import { touchCourse } from './core/model.js';
import { drawCourse, drawCourseToContext, loadSignImage, getImageCache, canvasPointToRing, findNodeAt } from './ui/canvas.js';

const $ = id => document.getElementById(id);
const orgEl=$('organization'), levelEl=$('level'), ringW=$('ringW'), ringH=$('ringH');
const canvas=$('courseCanvas');

let pack=null, course=null, lastReport=null, dragIndex=-1;

function initOrganizations() {
  orgEl.innerHTML='';
  organizations.forEach(o=>{
    const op=document.createElement('option');
    op.value=o.id;op.textContent=o.label;orgEl.appendChild(op);
  });
  orgEl.value=organizations[0].id;
  setPack(orgEl.value);
}

function setPack(id) {
  pack=getPack(id);
  $('ruleBadge').textContent=`${pack.name} · rules ${pack.version}`;
  levelEl.innerHTML='';
  Object.values(pack.levels).sort((a,b)=>a.order-b.order).forEach(l=>{
    const op=document.createElement('option');op.value=l.id;op.textContent=l.name;levelEl.appendChild(op);
  });
  levelEl.value=Object.values(pack.levels).sort((a,b)=>a.order-b.order)[0].id;
  applyLevelDefaults();
}

function applyLevelDefaults() {
  const level=pack.levels[levelEl.value];
  ringW.value=level.defaultRing.width;
  ringH.value=level.defaultRing.height;
}

function ringSettings() {
  // minSpacing is now an internal edit/overlap floor only; it is not a C-WAGS spacing rule.
  return {width:+ringW.value,height:+ringH.value,minSpacing:4.5};
}

function ensureImages() {
  if(!course) return;
  course.nodes.filter(n=>n.kind==='station').forEach(n=>loadSignImage(pack,n.signId,()=>render(false)));
}

function render(loadImages=true) {
  if(!course) return;
  if(loadImages) ensureImages();
  drawCourse(canvas,course,pack);
  $('courseTitle').textContent=`${pack.levels[course.levelId].name} Course`;
  $('courseMeta').textContent=`${course.nodes.filter(n=>n.kind==='station').length} stations · ${course.ring.width}×${course.ring.height} ft`;
  renderStations();
  renderValidation();
  renderSummary();
  renderReport();
}

function renderSummary() {
  const level=pack.levels[course.levelId];
  const gaps=[];
  for(let i=0;i<course.nodes.length-1;i++){
    const a=course.nodes[i],b=course.nodes[i+1];
    gaps.push(Math.hypot(a.x-b.x,a.y-b.y));
  }
  const gapRange=gaps.length?`${Math.min(...gaps).toFixed(1)}–${Math.max(...gaps).toFixed(1)} ft`:'—';
  $('summary').innerHTML=`
    <b>${pack.name}</b><br>
    ${level.name} · Rules ${pack.version}<br>
    Ring: ${course.ring.width} × ${course.ring.height} ft<br>
    Path gap range: ${gapRange}<br>
    Ordinary sign spacing: variable — no fixed C-WAGS value<br>
    Leash: ${level.leash}<br>
    Course lineage: ${course.parentCourseId?'derived from prior level':'base course'}
  `;
}

function renderValidation() {
  const results=validateCourse(course,pack);
  $('validation').innerHTML=results.map(r=>`<div class="val ${r.ok?'ok':(r.severity==='warn'||r.severity==='warning')?'warn':'error'}">${r.ok?'✓':'✕'} ${r.message}</div>`).join('');
}

function renderStations() {
  const list=$('stationList');list.innerHTML='';
  let ord=0;
  course.nodes.forEach((node,nodeIndex)=>{
    if(node.kind!=='station') return;
    ord++;
    const row=document.createElement('div');row.className='station-row';
    const img=document.createElement('img');img.className='station-thumb';img.alt=node.signId;
    img.src=`${pack.assetBase}${node.signId}.png`;

    const opts=candidateSignsForNode(pack,course.levelId,course.nodes,nodeIndex,{includeSequences:true});
    // Keep current sign visible even if drag has made it geometrically invalid; validator flags it.
    if(!opts.some(s=>s.id===node.signId) && pack.signs[node.signId]) opts.unshift(pack.signs[node.signId]);

    const select=document.createElement('select');
    opts.sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true})).forEach(s=>{
      const op=document.createElement('option');op.value=s.id;op.textContent=`${s.id} — ${s.name}`;
      if(s.id===node.signId)op.selected=true;select.appendChild(op);
    });
    select.onchange=()=>{
      node.signId=select.value;touchCourse(course);recalcHeadings(course.nodes);lastReport=null;render();
    };

    const detail=document.createElement('div');
    detail.appendChild(select);
    const code=document.createElement('div');code.className='station-code';code.textContent=`Stable station: ${node.stationId.slice(-12)}`;
    detail.appendChild(code);
    const num=document.createElement('div');num.className='station-num';num.textContent=ord;
    row.append(num,img,detail);list.appendChild(row);
  });
}

function renderReport() {
  const el=$('changeReport');
  if(!lastReport){el.className='muted';el.textContent='No level change yet.';return;}
  el.className='';
  const c=lastReport.counts;
  const interesting=lastReport.changes.filter(x=>x.type!=='kept');
  const strategyNote = lastReport.addedForFlow
    ? `<div class="val ok" style="margin-bottom:8px">✓ Optimizer chose: add ${lastReport.counts.added} station${lastReport.counts.added === 1 ? '' : 's'} in the existing flow to keep more of the original course unchanged</div>`
    : '';
  el.innerHTML=`${strategyNote}
    <div class="change-grid">
      <div class="change-stat"><b>${c.kept}</b><span>kept</span></div>
      <div class="change-stat"><b>${c.swapped}</b><span>sign swaps</span></div>
      <div class="change-stat"><b>${c.added}</b><span>added</span></div>
      <div class="change-stat"><b>${c.moved}</b><span>moved</span></div>
      <div class="change-stat"><b>${c.removed}</b><span>removed</span></div>
      <div class="change-stat"><b>${lastReport.physicalSetupChanges}</b><span>setup changes</span></div>
    </div>
    <div class="change-list">${interesting.map(x=>{
      if(x.type==='swapped')return `<div>Swap ${x.from} → ${x.to}</div>`;
      if(x.type==='added')return `<div>Add ${x.to}</div>`;
      if(x.type==='removed')return `<div>Remove ${x.from}</div>`;
      if(x.type==='moved')return `<div>Move station ${x.feet.toFixed(1)} ft</div>`;
      return '';
    }).join('')||'<div>No physical setup changes.</div>'}</div>`;
}

function doGenerate() {
  try{
    course=generateCourse({pack,levelId:levelEl.value,ring:ringSettings(),includeSequences:$('includeSequences').checked});
    lastReport=null;render();
  }catch(e){alert(e.message);}
}

function nextLevelId() {
  return pack.levels[course.levelId]?.nextLevel || null;
}

function doUpgrade() {
  if(!course){doGenerate();return;}
  const target=nextLevelId();
  if(!target){alert('This is already the last level in this rule pack.');return;}
  try{
    const out=upgradeCourse(course,pack,target);
    course=out.course;lastReport=out.report;
    levelEl.value=target;
    // Keep actual ring dimensions: changing the level must not silently rebuild the physical ring.
    ringW.value=course.ring.width;ringH.value=course.ring.height;
    render();
  }catch(e){alert(e.message);}
}

orgEl.addEventListener('change',()=>setPack(orgEl.value));
levelEl.addEventListener('change',()=>{applyLevelDefaults();});
$('generateBtn').onclick=doGenerate;
$('upgradeBtn').onclick=doUpgrade;
$('saveBtn').onclick=()=>course&&downloadJson(course);
$('loadInput').onchange=async e=>{
  try{
    const loaded=await readCourseFile(e.target.files[0]);
    const id=`${loaded.organizationId}:${loaded.rulePackVersion}`;
    if(!getPack(id))throw new Error(`Rule pack ${id} is not installed in this build.`);
    orgEl.value=id;setPack(id);pack=getPack(id);course=loaded;levelEl.value=course.levelId;
    ringW.value=course.ring.width;ringH.value=course.ring.height;
    // Normalize older saved courses that stored the former UI spacing preference.
    course.ring.minSpacing=4.5;
    lastReport=null;render();
  }catch(err){alert(err.message);}
  e.target.value='';
};
$('pdfBtn').onclick=async()=>{
  if(!course)return;
  try{
    ensureImages();
    await exportCoursePdf({course,pack,drawCourseToContext,imageCache:getImageCache()});
  }catch(e){alert(e.message);}
};

// Drag editing.
canvas.addEventListener('pointerdown',e=>{
  const i=findNodeAt(canvas,course,e.clientX,e.clientY);
  if(i>=0&&course.nodes[i].kind==='station'){dragIndex=i;canvas.setPointerCapture(e.pointerId);}
});
canvas.addEventListener('pointermove',e=>{
  if(dragIndex<0)return;
  const p=canvasPointToRing(canvas,course,e.clientX,e.clientY);
  course.nodes[dragIndex].x=p.x;course.nodes[dragIndex].y=p.y;
  recalcHeadings(course.nodes);touchCourse(course);drawCourse(canvas,course,pack);
});
canvas.addEventListener('pointerup',e=>{
  if(dragIndex<0)return;
  dragIndex=-1;lastReport=null;render();
});

initOrganizations();
doGenerate();
