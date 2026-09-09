import { organizations, getPack } from './orgs/registry.js';
import { generateCourse } from './core/generator.js';
import { upgradeCourse } from './core/upgrade.js';
import { validateCourse } from './core/validator.js';
import { evaluateCourseQuality } from './core/quality.js';
import { candidateSignsForNode, refreshJoinedFlags } from './core/rules.js';
import { downloadJson, readCourseFile } from './core/storage.js';
import { exportCoursePdf } from './core/pdf.js';
import { recalcHeadings } from './core/geometry.js';
import { makeId, touchCourse } from './core/model.js';
import { drawCourse, drawCourseToContext, loadSignImage, getImageCache, canvasPointToRing, findNodeAt } from './ui/canvas.js';
import { officialStationCount, nextLevelsFor, ringRuleText, routeStylesFor, signImageUrl, stationCountLabel } from './core/pack.js';

const $ = id => document.getElementById(id);
const orgEl=$('organization'), levelEl=$('level'), routeStyleEl=$('routeStyle'), ringW=$('ringW'), ringH=$('ringH'), advanceTargetEl=$('advanceTarget');
const canvas=$('courseCanvas');

const canvasShell=canvas?.closest('.canvas-shell');
let canvasResizeFrame=0;

function resizeCourseCanvas() {
  if(!canvas || !canvasShell) return false;
  const cs=getComputedStyle(canvasShell);
  const px=v=>Number.parseFloat(v)||0;
  const availableW=Math.floor(canvasShell.clientWidth-px(cs.paddingLeft)-px(cs.paddingRight));
  const availableH=Math.floor(canvasShell.clientHeight-px(cs.paddingTop)-px(cs.paddingBottom));
  const targetW=Math.max(420,availableW);
  const targetH=Math.max(480,availableH);
  if(Math.abs(canvas.width-targetW)<2 && Math.abs(canvas.height-targetH)<2) return false;
  canvas.width=targetW;
  canvas.height=targetH;
  return true;
}


let pack=null, course=null, lastReport=null, dragIndex=-1, dragBefore=null;
let selectedStationId=null;
const undoStack=[];
const redoStack=[];
const HISTORY_LIMIT=50;

function initOrganizations() {
  orgEl.innerHTML='';
  organizations.forEach(o=>{
    const op=document.createElement('option');
    op.value=o.id;op.textContent=o.label;orgEl.appendChild(op);
  });
  orgEl.value=organizations[0].id;
  setPack(orgEl.value);
}

function setPack(id, { keepCourse = false } = {}) {
  const nextPack=getPack(id);
  if(!nextPack) return;
  if(!keepCourse && course && (course.organizationId!==nextPack.id || course.rulePackVersion!==nextPack.version)) {
    course=null;lastReport=null;resetHistory();
  }
  pack=nextPack;
  $('ruleBadge').textContent=`${pack.name} · rules ${pack.version}`;
  levelEl.innerHTML='';
  Object.values(pack.levels).sort((a,b)=>a.order-b.order).forEach(l=>{
    const op=document.createElement('option');op.value=l.id;op.textContent=l.name;levelEl.appendChild(op);
  });
  levelEl.value=Object.values(pack.levels).sort((a,b)=>a.order-b.order)[0].id;
  applyLevelDefaults();
  updateRouteStyleAvailability();
  renderPalette(levelEl.value);
}

function updateAdvanceTargets() {
  if(!pack || !advanceTargetEl) return;
  const sourceLevelId=course?.levelId || levelEl.value;
  const source=pack.levels[sourceLevelId];
  const targets=nextLevelsFor(source);
  advanceTargetEl.innerHTML='';

  for(const id of targets){
    const target=pack.levels[id];
    if(!target) continue;
    const op=document.createElement('option');
    op.value=id;
    op.textContent=target.generationEnabled===false
      ? `${target.name} — manual editing only`
      : target.name;
    op.disabled=target.generationEnabled===false;
    advanceTargetEl.appendChild(op);
  }

  const enabled=[...advanceTargetEl.options].find(o=>!o.disabled);
  if(enabled) advanceTargetEl.value=enabled.value;
  const usable=!!enabled;
  advanceTargetEl.disabled=!usable;
  $('upgradeBtn').disabled=!usable;
  $('advanceTargetWrap').hidden=targets.length===0;
}

function applyLevelDefaults() {
  const level=pack.levels[levelEl.value];
  ringW.value=level.defaultRing.width;
  ringH.value=level.defaultRing.height;
  updateRouteStyleAvailability();
  updateAdvanceTargets();
  if($('generateBtn')) {
    $('generateBtn').disabled=level.generationEnabled===false;
    $('generateBtn').title=level.generationEnabled===false ? (level.generationMessage||'Automatic generation is not enabled for this level yet.') : '';
  }
}

function updateRouteStyleAvailability() {
  if(!pack || !routeStyleEl) return;
  const level=pack.levels[levelEl.value];
  const allowed=routeStylesFor(pack,level);
  const zoom=level?.routeProfile==='cwags-zoom'||level?.progressionTrack?.[0]==='Z1';
  for(const option of routeStyleEl.options) option.disabled=!allowed.has(option.value);
  const mixed=[...routeStyleEl.options].find(o=>o.value==='mixed');
  if(mixed) mixed.textContent=zoom ? 'Mixed — classic + Zoom angled flow' : 'Mixed — classic + angled flow';
  if(!allowed.has(routeStyleEl.value)) {
    const preferred=['mixed','classic','angled-flow','angled-x'].find(v=>allowed.has(v));
    if(preferred) routeStyleEl.value=preferred;
  }
}

function ringSettings() {
  // minSpacing remains an internal edit/overlap floor in this build.
  return {width:+ringW.value,height:+ringH.value,minSpacing:4.5};
}

function snapshotCourse() {
  return course ? JSON.stringify(course) : null;
}

function resetHistory() {
  undoStack.length=0;
  redoStack.length=0;
  selectedStationId=null;
  updateEditButtons();
}

function commitEdit(before) {
  if(!course || !before) return;
  const after=snapshotCourse();
  if(after===before) return;
  undoStack.push(before);
  if(undoStack.length>HISTORY_LIMIT) undoStack.shift();
  redoStack.length=0;
  touchCourse(course);
  lastReport=null;
  updateEditButtons();
}

function restoreSnapshot(snapshot) {
  if(!snapshot) return;
  course=JSON.parse(snapshot);
  levelEl.value=course.levelId;
  ringW.value=course.ring.width;
  ringH.value=course.ring.height;
  selectedStationId=null;
  lastReport=null;
  render();
  updateEditButtons();
}

function doUndo() {
  if(!course || !undoStack.length) return;
  const current=snapshotCourse();
  const previous=undoStack.pop();
  redoStack.push(current);
  restoreSnapshot(previous);
}

function doRedo() {
  if(!course || !redoStack.length) return;
  const current=snapshotCourse();
  const next=redoStack.pop();
  undoStack.push(current);
  restoreSnapshot(next);
}

function updateEditButtons() {
  if($('undoBtn')) $('undoBtn').disabled=!undoStack.length;
  if($('redoBtn')) $('redoBtn').disabled=!redoStack.length;
  if($('deleteStationBtn')) $('deleteStationBtn').disabled=!selectedStationId;
  if($('insertStationBtn')) $('insertStationBtn').disabled=!selectedStationId;
}

function stationOrdinalMap() {
  const map=new Map();
  let ord=0;
  course?.nodes.forEach(n=>{
    if(n.kind==='station') map.set(n.stationId,++ord);
  });
  return map;
}

function resultProblemStationIds(result) {
  const ids=new Set();
  if(!course || result.ok) return ids;
  const stations=course.nodes.filter(n=>n.kind==='station');

  const addOrdinal=n=>{
    if(Number.isInteger(n) && n>=1 && n<=stations.length) ids.add(stations[n-1].stationId);
  };
  const addNodeIndex=n=>{
    if(Number.isInteger(n) && n>=0 && n<course.nodes.length && course.nodes[n]?.kind==='station') ids.add(course.nodes[n].stationId);
  };
  const walk=(value,key='')=>{
    if(value==null) return;
    if(Array.isArray(value)){ value.forEach(v=>walk(v,key)); return; }
    if(typeof value!=='object') return;
    for(const [k,v] of Object.entries(value)){
      if(k==='stationId' && typeof v==='string') ids.add(v);
      else if(['station','nextStation','otherStation','equipmentStation'].includes(k) && Number.isInteger(v)) addOrdinal(v);
      else if(['nodeIndex','otherNodeIndex','equipmentNodeIndex'].includes(k) && Number.isInteger(v)) addNodeIndex(v);
      else walk(v,k);
    }
  };

  walk(result.details);

  // Duplicate details contain sign IDs. Mark every physical occurrence so the
  // judge can immediately see all copies involved in the violation.
  if(result.code==='duplicates' && Array.isArray(result.details)){
    for(const item of result.details){
      for(const node of stations){
        if(node.signId===item.id) ids.add(node.stationId);
      }
    }
  }

  return ids;
}

function allProblemStationIds(results) {
  const ids=new Set();
  results.forEach(r=>resultProblemStationIds(r).forEach(id=>ids.add(id)));
  return ids;
}

function issueStationNumbers(ids) {
  const ord=stationOrdinalMap();
  return [...ids].map(id=>ord.get(id)).filter(Boolean).sort((a,b)=>a-b);
}

function validationMessage(result, ids) {
  if(!result.ok && result.code==='duplicates' && Array.isArray(result.details)){
    return result.details.map(item=>{
      const involved=course.nodes
        .filter(n=>n.kind==='station' && n.signId===item.id)
        .map(n=>stationOrdinalMap().get(n.stationId));
      return `${item.id} used ${item.n} times — maximum ${item.max}${involved.length?` (stations ${involved.join(', ')})`:''}`;
    }).join('; ');
  }

  if(!result.ok && ids.size){
    const nums=issueStationNumbers(ids);
    if(nums.length && !/station/i.test(result.message)){
      return `${result.message} — station${nums.length===1?'':'s'} ${nums.join(', ')}`;
    }
  }
  return result.message;
}

function focusStation(stationId) {
  if(!stationId) return;
  selectedStationId=stationId;
  render(false);
  requestAnimationFrame(()=>{
    const row=document.querySelector(`.station-row[data-station-id="${CSS.escape(stationId)}"]`);
    if(row){
      row.scrollIntoView({behavior:'smooth',block:'center'});
      row.classList.add('station-flash');
      setTimeout(()=>row.classList.remove('station-flash'),1200);
    }
  });
}

function ensureImages() {
  if(!course) return;
  course.nodes.filter(n=>n.kind==='station').forEach(n=>loadSignImage(pack,n.signId,()=>render(false)));
  (course.auxiliary||[]).forEach(n=>n.signId&&loadSignImage(pack,n.signId,()=>render(false)));
}

function render(loadImages=true) {
  if(!course) return;
  resizeCourseCanvas();
  updateAdvanceTargets();
  refreshJoinedFlags(course,pack);
  if(loadImages) ensureImages();
  const results=validateCourse(course,pack);
  const quality=evaluateCourseQuality(course,pack);
  const problemIds=allProblemStationIds(results);
  drawCourse(canvas,course,pack,{highlightStationIds:problemIds,selectedStationId});
  $('courseTitle').textContent=`${pack.levels[course.levelId].name} Course`;
  $('courseMeta').textContent=`${officialStationCount(course,pack.levels[course.levelId])} official stations · ${course.ring.width}×${course.ring.height} ft`;
  renderStations(problemIds);
  renderValidation(results);
  renderQuality(quality,results);
  renderSummary();
  renderReport();
  renderPalette(course.levelId);
  updateEditButtons();
}

function renderSummary() {
  const level=pack.levels[course.levelId];
  const gaps=[];
  for(let i=0;i<course.nodes.length-1;i++){
    const a=course.nodes[i],b=course.nodes[i+1];
    gaps.push(Math.hypot(a.x-b.x,a.y-b.y));
  }
  const gapRange=gaps.length?`${Math.min(...gaps).toFixed(1)}–${Math.max(...gaps).toFixed(1)} ft`:'—';
  const officialCount=officialStationCount(course,level);
  const spacing=level.ordinarySpacing?.min ?? pack.ordinarySpacing?.min ?? null;
  $('summary').innerHTML=`
    <b>${pack.name}</b><br>
    ${level.name} · Rules ${pack.version}<br>
    Source: ${pack.sourceLabel||'installed rule pack'}<br>
    Ring: ${course.ring.width} × ${course.ring.height} ft · ${ringRuleText(level)}<br>
    Count: ${officialCount} ${stationCountLabel(level)}<br>
    Route: ${course.routeFamily||'custom'}<br>
    Path gap range: ${gapRange}<br>
    ${spacing?`Organization minimum ordinary gap: ${spacing} ft`:`No universal ordinary-station minimum encoded; layout preference ${level.layout?.preferredGap??pack.layout?.preferredGap??8} ft`}<br>
    Leash: ${level.leash}<br>
    Course lineage: ${course.parentCourseId?'derived from prior level':'base course'}
  `;
}

function renderValidation(results) {
  const el=$('validation');
  el.innerHTML='';
  results.forEach(r=>{
    const ids=resultProblemStationIds(r);
    const div=document.createElement('div');
    const warning=r.severity==='warn'||r.severity==='warning';
    div.className=`val ${r.ok?'ok':warning?'warn':'error'}`;
    div.textContent=`${r.ok?'✓':'✕'} ${validationMessage(r,ids)}`;
    if(!r.ok && ids.size){
      div.classList.add('val-clickable');
      div.title='Click to highlight the affected station';
      div.onclick=()=>focusStation([...ids][0]);
    }
    el.appendChild(div);
  });
}


function qualityTone(score) {
  if(score>=90) return 'excellent';
  if(score>=80) return 'strong';
  if(score>=70) return 'acceptable';
  if(score>=60) return 'needs-work';
  return 'poor';
}

function renderQuality(quality,legalResults) {
  const summary=$('qualitySummary');
  const scores=$('qualityScores');
  const findings=$('qualityFindings');
  if(!summary || !scores || !findings) return;

  const legal=legalResults.every(r=>r.ok || r.severity!=='error');
  const tone=qualityTone(quality.overall);
  const targetMet=quality.overall>=quality.threshold;

  summary.innerHTML=`
    <div class="quality-overall ${tone}">
      <div class="quality-number">${quality.overall}</div>
      <div>
        <b>/100 · ${quality.grade}</b>
        <div class="quality-target">${targetMet?'✓ Meets':'⚠ Below'} generator target of ${quality.threshold}</div>
      </div>
    </div>
    <div class="quality-legal ${legal?'pass':'fail'}">
      Legal validation: <b>${legal?'PASS':'NEEDS ATTENTION'}</b>
    </div>
  `;

  scores.innerHTML='';
  for(const c of Object.values(quality.categories)){
    const row=document.createElement('div');
    row.className='quality-row';
    const ctone=qualityTone(c.score);
    row.innerHTML=`
      <div class="quality-row-head"><span>${c.label}</span><b>${c.score}</b></div>
      <div class="quality-bar"><span class="${ctone}" style="width:${Math.max(0,Math.min(100,c.score))}%"></span></div>
    `;
    row.title=c.findings?.[0]||'';
    scores.appendChild(row);
  }

  findings.innerHTML='';
  if(quality.findings.length){
    quality.findings.slice(0,3).forEach(f=>{
      const div=document.createElement('div');
      div.className='quality-finding';
      div.innerHTML=`<b>${f.category}:</b> ${f.text}`;
      findings.appendChild(div);
    });
  }else{
    findings.innerHTML='<div class="quality-good">✓ No major judge-quality concerns detected.</div>';
  }
}

function replaceStationSign(stationId, signId) {
  if(!course || !pack.signs[signId]) return;
  const node=course.nodes.find(n=>n.stationId===stationId && n.kind==='station');
  if(!node) return;
  const before=snapshotCourse();
  node.signId=signId;
  selectedStationId=stationId;
  recalcHeadings(course.nodes);
  commitEdit(before);
  render();
}

function removeStationById(stationId) {
  if(!course || !stationId) return;
  const idx=course.nodes.findIndex(n=>n.stationId===stationId && n.kind==='station');
  if(idx<0) return;
  const before=snapshotCourse();
  course.nodes.splice(idx,1);
  selectedStationId=null;
  recalcHeadings(course.nodes);
  commitEdit(before);
  render();
}

function renderStations(problemIds=new Set()) {
  const list=$('stationList');list.innerHTML='';
  let ord=0;
  course.nodes.forEach((node,nodeIndex)=>{
    if(node.kind!=='station') return;
    ord++;
    const row=document.createElement('div');
    row.className='station-row';
    row.dataset.stationId=node.stationId;
    if(problemIds.has(node.stationId)) row.classList.add('station-error');
    if(selectedStationId===node.stationId) row.classList.add('station-selected');
    row.onclick=e=>{
      if(e.target.closest('select,button')) return;
      selectedStationId=node.stationId;
      render(false);
    };

    row.ondragover=e=>{ e.preventDefault(); row.classList.add('drop-target'); };
    row.ondragleave=()=>row.classList.remove('drop-target');
    row.ondrop=e=>{
      e.preventDefault();row.classList.remove('drop-target');
      const signId=e.dataTransfer.getData('application/x-rally-sign')||e.dataTransfer.getData('text/plain');
      if(signId && pack.signs[signId]) replaceStationSign(node.stationId,signId);
    };

    const img=document.createElement('img');img.className='station-thumb';img.alt=node.signId;
    img.src=signImageUrl(pack,node.signId);

    const opts=candidateSignsForNode(pack,course.levelId,course.nodes,nodeIndex,{includeSequences:true});
    // Keep current sign visible even if a manual edit made it invalid; validator flags it.
    if(!opts.some(s=>s.id===node.signId) && pack.signs[node.signId]) opts.unshift(pack.signs[node.signId]);

    const select=document.createElement('select');
    opts.sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true})).forEach(s=>{
      const op=document.createElement('option');op.value=s.id;op.textContent=`${s.id} — ${s.name}`;
      if(s.id===node.signId)op.selected=true;select.appendChild(op);
    });
    select.onfocus=()=>{ selectedStationId=node.stationId; updateEditButtons(); };
    select.onchange=()=>replaceStationSign(node.stationId,select.value);

    const detail=document.createElement('div');
    detail.appendChild(select);
    const code=document.createElement('div');code.className='station-code';code.textContent=`Stable station: ${node.stationId.slice(-12)}`;
    detail.appendChild(code);
    const num=document.createElement('div');num.className='station-num';num.textContent=ord;
    const del=document.createElement('button');del.className='station-delete';del.type='button';del.title=`Remove station ${ord}`;del.textContent='×';
    del.onclick=e=>{e.stopPropagation();removeStationById(node.stationId);};
    row.append(num,img,detail,del);list.appendChild(row);
  });
}

function renderPalette(levelId=levelEl.value) {
  const palette=$('signPalette');
  if(!palette || !pack) return;
  const level=pack.levels[levelId] || pack.levels[levelEl.value];
  if(!level) return;
  const term=($('signFilter')?.value||'').trim().toLowerCase();
  palette.innerHTML='';
  level.allowedSigns
    .map(id=>pack.signs[id])
    .filter(Boolean)
    .filter(s=>!term || `${s.id} ${s.name}`.toLowerCase().includes(term))
    .sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}))
    .forEach(sign=>{
      const item=document.createElement('div');
      item.className='sign-palette-item';
      item.draggable=true;
      item.dataset.signId=sign.id;
      item.title='Drag onto a station to replace it, or onto the route to add a new station';
      item.ondragstart=e=>{
        e.dataTransfer.effectAllowed='copy';
        e.dataTransfer.setData('application/x-rally-sign',sign.id);
        e.dataTransfer.setData('text/plain',sign.id);
      };
      item.onclick=()=>{
        if(selectedStationId) replaceStationSign(selectedStationId,sign.id);
      };
      const img=document.createElement('img');img.src=signImageUrl(pack,sign.id);img.alt=sign.id;
      const text=document.createElement('div');
      const strong=document.createElement('strong');strong.textContent=sign.id;
      const small=document.createElement('span');small.textContent=sign.name;
      text.append(strong,small);item.append(img,text);palette.appendChild(item);
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

function pointToSegmentDistance(p,a,b) {
  const dx=b.x-a.x,dy=b.y-a.y;
  const len2=dx*dx+dy*dy;
  if(!len2) return Math.hypot(p.x-a.x,p.y-a.y);
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len2));
  const q={x:a.x+t*dx,y:a.y+t*dy};
  return Math.hypot(p.x-q.x,p.y-q.y);
}

function nearestSegmentIndex(p) {
  let best=0,bestD=Infinity;
  for(let i=0;i<course.nodes.length-1;i++){
    const d=pointToSegmentDistance(p,course.nodes[i],course.nodes[i+1]);
    if(d<bestD){bestD=d;best=i;}
  }
  return best;
}

function insertSignAtPoint(signId,p) {
  if(!course || !pack.signs[signId]) return;
  const before=snapshotCourse();
  const seg=nearestSegmentIndex(p);
  const node={kind:'station',stationId:makeId('st'),signId,x:p.x,y:p.y,heading:0,locked:false};
  course.nodes.splice(seg+1,0,node);
  selectedStationId=node.stationId;
  recalcHeadings(course.nodes);
  commitEdit(before);
  render();
}

function insertAfterSelected() {
  if(!course || !selectedStationId) return;
  const idx=course.nodes.findIndex(n=>n.stationId===selectedStationId && n.kind==='station');
  if(idx<0 || idx>=course.nodes.length-1) return;
  const a=course.nodes[idx],b=course.nodes[idx+1];
  const p={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  const level=pack.levels[course.levelId];
  const before=snapshotCourse();
  const node={kind:'station',stationId:makeId('st'),signId:level.allowedSigns[0],x:p.x,y:p.y,heading:0,locked:false};
  course.nodes.splice(idx+1,0,node);
  recalcHeadings(course.nodes);
  const options=candidateSignsForNode(pack,course.levelId,course.nodes,idx+1,{includeSequences:false});
  const safe=options.find(s=>!pack.dependentSigns?.has?.(s.id)) || options[0];
  if(safe) node.signId=safe.id;
  selectedStationId=node.stationId;
  recalcHeadings(course.nodes);
  commitEdit(before);
  render();
}

function doGenerate() {
  try{
    course=generateCourse({pack,levelId:levelEl.value,ring:ringSettings(),includeSequences:$('includeSequences').checked,routeStyle:routeStyleEl?.value||'mixed'});
    lastReport=null;resetHistory();render();
  }catch(e){alert(e.message);}
}

function nextLevelId() {
  const selected=advanceTargetEl?.value;
  if(selected && nextLevelsFor(pack.levels[course.levelId]).includes(selected)) return selected;
  return nextLevelsFor(pack.levels[course.levelId]).find(id=>pack.levels[id]?.generationEnabled!==false) || null;
}

function doUpgrade() {
  if(!course){doGenerate();return;}
  const target=nextLevelId();
  if(!target){alert('This is already the last level in this rule pack.');return;}
  try{
    const out=upgradeCourse(course,pack,target);
    course=out.course;lastReport=out.report;
    levelEl.value=target;
    ringW.value=course.ring.width;ringH.value=course.ring.height;
    resetHistory();
    render();
  }catch(e){alert(e.message);}
}

orgEl.addEventListener('change',()=>{setPack(orgEl.value);doGenerate();});
levelEl.addEventListener('change',()=>{applyLevelDefaults();renderPalette(levelEl.value);});
$('generateBtn').onclick=doGenerate;
$('upgradeBtn').onclick=doUpgrade;
$('undoBtn').onclick=doUndo;
$('redoBtn').onclick=doRedo;
$('insertStationBtn').onclick=insertAfterSelected;
$('deleteStationBtn').onclick=()=>selectedStationId&&removeStationById(selectedStationId);
$('signFilter').addEventListener('input',()=>renderPalette(course?.levelId || levelEl.value));
$('saveBtn').onclick=()=>course&&downloadJson(course);
$('loadInput').onchange=async e=>{
  try{
    const loaded=await readCourseFile(e.target.files[0]);
    const id=`${loaded.organizationId}:${loaded.rulePackVersion}`;
    if(!getPack(id))throw new Error(`Rule pack ${id} is not installed in this build.`);
    orgEl.value=id;setPack(id,{keepCourse:true});pack=getPack(id);course=loaded;levelEl.value=course.levelId;
    ringW.value=course.ring.width;ringH.value=course.ring.height;
    course.ring.minSpacing=4.5;
    lastReport=null;resetHistory();render();
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

// Drag a palette sign onto the canvas. Dropping directly on an existing station
// replaces it. Dropping elsewhere inserts a new station into the nearest route segment.
canvas.addEventListener('dragover',e=>{ e.preventDefault();e.dataTransfer.dropEffect='copy';canvas.classList.add('sign-drop-active'); });
canvas.addEventListener('dragleave',()=>canvas.classList.remove('sign-drop-active'));
canvas.addEventListener('drop',e=>{
  e.preventDefault();canvas.classList.remove('sign-drop-active');
  const signId=e.dataTransfer.getData('application/x-rally-sign')||e.dataTransfer.getData('text/plain');
  if(!signId || !pack.signs[signId]) return;
  const hit=findNodeAt(canvas,course,e.clientX,e.clientY);
  if(hit>=0 && course.nodes[hit]?.kind==='station'){
    replaceStationSign(course.nodes[hit].stationId,signId);
    return;
  }
  const p=canvasPointToRing(canvas,course,e.clientX,e.clientY);
  insertSignAtPoint(signId,p);
});

// Existing station physical drag editing.
canvas.addEventListener('pointerdown',e=>{
  const i=findNodeAt(canvas,course,e.clientX,e.clientY);
  if(i>=0&&course.nodes[i].kind==='station'){
    dragIndex=i;
    dragBefore=snapshotCourse();
    selectedStationId=course.nodes[i].stationId;
    updateEditButtons();
    canvas.setPointerCapture(e.pointerId);
    drawCourse(canvas,course,pack,{selectedStationId});
  }
});
canvas.addEventListener('pointermove',e=>{
  if(dragIndex<0)return;
  const p=canvasPointToRing(canvas,course,e.clientX,e.clientY);
  course.nodes[dragIndex].x=p.x;course.nodes[dragIndex].y=p.y;
  recalcHeadings(course.nodes);
  drawCourse(canvas,course,pack,{selectedStationId});
});
canvas.addEventListener('pointerup',e=>{
  if(dragIndex<0)return;
  dragIndex=-1;
  commitEdit(dragBefore);
  dragBefore=null;
  render();
});
canvas.addEventListener('pointercancel',()=>{
  if(dragIndex<0)return;
  dragIndex=-1;
  dragBefore=null;
  render();
});

window.addEventListener('keydown',e=>{
  const tag=document.activeElement?.tagName;
  const typing=['INPUT','SELECT','TEXTAREA'].includes(tag);
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z'){
    e.preventDefault();
    if(e.shiftKey) doRedo(); else doUndo();
    return;
  }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='y'){
    e.preventDefault();doRedo();return;
  }
  if(!typing && (e.key==='Delete'||e.key==='Backspace') && selectedStationId){
    e.preventDefault();removeStationById(selectedStationId);
  }
});

if(canvasShell && 'ResizeObserver' in window){
  const canvasObserver=new ResizeObserver(()=>{
    cancelAnimationFrame(canvasResizeFrame);
    canvasResizeFrame=requestAnimationFrame(()=>{
      if(resizeCourseCanvas() && course) render(false);
    });
  });
  canvasObserver.observe(canvasShell);
}
window.addEventListener('resize',()=>{
  cancelAnimationFrame(canvasResizeFrame);
  canvasResizeFrame=requestAnimationFrame(()=>{
    if(resizeCourseCanvas() && course) render(false);
  });
});

initOrganizations();
doGenerate();
