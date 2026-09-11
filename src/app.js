import { organizations, getPack } from './orgs/registry.js';
import { validateCourse } from './core/validator.js';
import { evaluateCourseQuality } from './core/quality.js';
import { candidateSignsForNode, refreshJoinedFlags } from './core/rules.js';
import { downloadJson, readCourseFile } from './core/storage.js';
import { exportCoursePdf, exportCourseSetupPdf } from './core/pdf.js';
import { recalcHeadings } from './core/geometry.js';
import { makeId, touchCourse, makeBlankCourse } from './core/model.js';
import { drawCourse, drawCourseToContext, loadSignImage, getImageCache, canvasPointToRing, findNodeAt } from './ui/canvas.js';
import { officialStationCount, nextLevelsFor, ringRuleIssues, ringRuleText, routeStylesFor, signImageUrl, stationCountLabel } from './core/pack.js';

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
let setupMode=false;
let showLevelChanges=false;
let drawingNoGo=false;
let noGoStart=null;
let noGoPreview=null;
let noGoBefore=null;
let venueZones=[];
const undoStack=[];
const redoStack=[];
const HISTORY_LIMIT=50;

const VENUE_STORAGE_KEY='rally-course-designer-venue-templates-v1';

function cloneZones(zones=[]) {
  return zones.map(z=>({...z}));
}

function currentChangeState(stationId) {
  if(!lastReport || !showLevelChanges) return null;
  const c=lastReport.changes.filter(x=>x.stationId===stationId);
  if(c.some(x=>x.type==='added')) return 'ADD';
  const moved=c.some(x=>x.type==='moved');
  const swapped=c.some(x=>x.type==='swapped');
  if(swapped) return moved?'CHANGE+MOVE':'CHANGE';
  if(moved) return 'MOVE';
  if(c.some(x=>x.type==='kept')) return 'KEEP';
  return null;
}

function changeStatusMap() {
  const m=new Map();
  if(!lastReport) return m;
  for(const n of course?.nodes||[]){
    if(n.kind!=='station') continue;
    const state=currentChangeState(n.stationId);
    if(state) m.set(n.stationId,state);
  }
  return m;
}

function loadVenueTemplates() {
  try{
    const raw=localStorage.getItem(VENUE_STORAGE_KEY);
    const parsed=raw?JSON.parse(raw):[];
    return Array.isArray(parsed)?parsed:[];
  }catch{return [];}
}

function saveVenueTemplates(items) {
  localStorage.setItem(VENUE_STORAGE_KEY,JSON.stringify(items));
}

function renderVenueTemplates() {
  const select=$('venueSelect');
  if(!select) return;
  const items=loadVenueTemplates();
  select.innerHTML='';
  const blank=document.createElement('option');
  blank.value='';blank.textContent=items.length?'Choose a saved venue…':'No saved venues yet';
  select.appendChild(blank);
  items.sort((a,b)=>a.name.localeCompare(b.name)).forEach(v=>{
    const op=document.createElement('option');
    op.value=v.id;op.textContent=`${v.name} — ${v.width}×${v.height} ft · ${(v.noGoZones||[]).length} zone${(v.noGoZones||[]).length===1?'':'s'}`;
    select.appendChild(op);
  });
}

function syncVenueZonesFromCourse() {
  venueZones=cloneZones(course?.noGoZones||[]);
}

function renderNoGoList() {
  const list=$('noGoList');
  if(!list) return;
  const zones=course?.noGoZones||venueZones;
  list.innerHTML='';
  if(!zones.length){
    list.innerHTML='<div class="muted">No venue obstacles drawn.</div>';
    return;
  }
  zones.forEach((z,i)=>{
    const row=document.createElement('div');
    row.className='no-go-row';
    const text=document.createElement('span');
    text.textContent=`${z.label||`No-go ${i+1}`} · ${z.width.toFixed(1)}×${z.height.toFixed(1)} ft @ (${z.x.toFixed(1)}, ${z.y.toFixed(1)})`;
    const del=document.createElement('button');
    del.type='button';del.textContent='×';del.title='Remove this no-go zone';
    del.onclick=()=>{
      if(course){
        const before=snapshotCourse();
        course.noGoZones=course.noGoZones.filter(x=>x.id!==z.id);
        syncVenueZonesFromCourse();
        commitEdit(before);render();
      }else{
        venueZones=venueZones.filter(x=>x.id!==z.id);renderNoGoList();
      }
    };
    row.append(text,del);list.appendChild(row);
  });
}

function setNoGoDrawing(on) {
  drawingNoGo=!!on;
  noGoStart=null;noGoPreview=null;noGoBefore=null;
  const btn=$('drawNoGoBtn');
  if(btn){
    btn.classList.toggle('active',drawingNoGo);
    btn.textContent=drawingNoGo?'Drawing… drag on map':'Draw no-go zone';
  }
  canvas.classList.toggle('draw-no-go',drawingNoGo);
  if(course) drawCourse(canvas,course,pack,{
    highlightStationIds:new Set(),
    selectedStationId,
    setupMode,
    changeStatusByStationId:changeStatusMap()
  });
}

function saveCurrentVenueTemplate() {
  const name=($('venueName')?.value||'').trim();
  if(!name){alert('Enter a venue template name first.');return;}
  const width=Number(ringW.value),height=Number(ringH.value);
  const zones=cloneZones(course?.noGoZones||venueZones);
  const items=loadVenueTemplates();
  const existing=items.find(v=>v.name.toLowerCase()===name.toLowerCase());
  const item={
    id:existing?.id||makeId('venue'),
    name,width,height,
    noGoZones:zones,
    modifiedAt:new Date().toISOString()
  };
  const next=items.filter(v=>v.id!==item.id);next.push(item);
  saveVenueTemplates(next);
  renderVenueTemplates();
  $('venueSelect').value=item.id;
}

function loadSelectedVenueTemplate() {
  const id=$('venueSelect')?.value;
  if(!id) return;
  const v=loadVenueTemplates().find(x=>x.id===id);
  if(!v) return;
  ringW.value=v.width;ringH.value=v.height;
  venueZones=cloneZones(v.noGoZones||[]);
  $('venueName').value=v.name;
  updateRingGuidance();
  doGenerate();
}

function deleteSelectedVenueTemplate() {
  const id=$('venueSelect')?.value;
  if(!id) return;
  const items=loadVenueTemplates().filter(v=>v.id!==id);
  saveVenueTemplates(items);
  renderVenueTemplates();
}


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

function updateRingGuidance() {
  const el=$('ringGuidance');
  if(!el || !pack) return;
  const level=pack.levels[levelEl.value];
  if(!level) return;

  const width=Number(ringW.value);
  const height=Number(ringH.value);
  if(!Number.isFinite(width) || !Number.isFinite(height) || width<=0 || height<=0) {
    el.className='ring-guidance warn';
    el.textContent='Enter ring width and height.';
    return;
  }

  const area=width*height;
  const ring={width,height};
  const issues=ringRuleIssues(level,ring);
  const areaText=area.toLocaleString(undefined,{maximumFractionDigits:1});

  if(issues.length) {
    el.className='ring-guidance error';
    el.innerHTML=`<b>${width} × ${height} ft = ${areaText} sq ft</b> · Does not meet ${ringRuleText(level)}: ${issues.join('; ')}.`;
  } else {
    el.className='ring-guidance ok';
    const guidance=pack.ringGuidance ? ` ${pack.ringGuidance}` : '';
    el.innerHTML=`<b>${width} × ${height} ft = ${areaText} sq ft</b> · ✓ Meets ${ringRuleText(level)}.${guidance}`;
  }
}

function applyLevelDefaults({ preserveRing=false } = {}) {
  const level=pack.levels[levelEl.value];
  const current={width:Number(ringW.value),height:Number(ringH.value)};
  const currentUsable=
    Number.isFinite(current.width) && Number.isFinite(current.height) &&
    current.width>0 && current.height>0 &&
    ringRuleIssues(level,current).length===0;

  if(!preserveRing || !currentUsable) {
    ringW.value=level.defaultRing.width;
    ringH.value=level.defaultRing.height;
  }

  updateRouteStyleAvailability();
  updateAdvanceTargets();
  updateRingGuidance();
  if($('generateBtn')) {
    $('generateBtn').disabled=level.generationEnabled===false;
    $('generateBtn').title=level.generationEnabled===false ? (level.generationMessage||'Automatic generation is not enabled for this level yet.') : '';
  }
}

function updateRouteStyleAvailability() {
  if(!pack || !routeStyleEl) return;
  const level=pack.levels[levelEl.value];
  const allowed=routeStylesFor(pack,level);
  for(const option of routeStyleEl.options) option.disabled=!allowed.has(option.value);
  if(!allowed.has(routeStyleEl.value)) {
    const preferred=['surprise','flowing','geometric','spiral','diagonal','classic'].find(v=>allowed.has(v));
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
  updateRingGuidance();
  refreshJoinedFlags(course,pack);
  if(pack.id==='ckc') course.auxiliary=pack.makeAuxiliary(course,pack);
  if(loadImages) ensureImages();
  const results=validateCourse(course,pack);
  const quality=evaluateCourseQuality(course,pack);
  const problemIds=allProblemStationIds(results);
  drawCourse(canvas,course,pack,{
    highlightStationIds:problemIds,
    selectedStationId,
    setupMode,
    previewNoGoZone:noGoPreview,
    changeStatusByStationId:changeStatusMap()
  });
  $('courseTitle').textContent=`${pack.levels[course.levelId].name} Course`;
  const ringArea=course.ring.width*course.ring.height;
  $('courseMeta').textContent=`${officialStationCount(course,pack.levels[course.levelId])} official stations · ${course.ring.width}×${course.ring.height} ft (${ringArea.toLocaleString(undefined,{maximumFractionDigits:1})} sq ft)`;
  renderStations(problemIds);
  renderValidation(results);
  renderQuality(quality,results);
  renderSummary();
  renderReport();
  renderPalette(course.levelId);
  renderNoGoList();
  renderVenueTemplates();
  updateEditButtons();

  const setupBtn=$('setupModeBtn');
  if(setupBtn){
    setupBtn.classList.toggle('active',setupMode);
    setupBtn.textContent=setupMode?'Exit setup mode':'Physical setup mode';
  }

  const changesBtn=$('levelChangesBtn');
  if(changesBtn){
    changesBtn.disabled=!lastReport;
    changesBtn.classList.toggle('active',!!lastReport && showLevelChanges);
    changesBtn.textContent=lastReport && showLevelChanges ? 'Hide level changes' : 'Show level changes';
    changesBtn.title=lastReport
      ? 'Toggle KEEP / CHANGE / MOVE / ADD markers from the previous level'
      : 'Advance this course to another level to create a comparison';
  }

  const help=$('canvasHelp');
  if(help) help.textContent=setupMode
    ? 'Setup mode: path distances are shown directly on the ring. Coordinates and distances are also listed at right.'
    : course.creationMode==='manual' ? 'Drag signs from the palette onto the ring in course order. Drag Start and Finish to position them. Undo restores your previous course.' : 'Drag stations, Start, or Finish to reshape the route. Red outlines mark stations that need attention.';
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
    Ring: ${course.ring.width} × ${course.ring.height} ft = ${(course.ring.width*course.ring.height).toLocaleString(undefined,{maximumFractionDigits:1})} sq ft · ${ringRuleText(level)}<br>
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
        <div class="quality-target">${targetMet?'✓ Meets':'⚠ Below'} course quality target of ${quality.threshold}</div>
      </div>
    </div>
    <div class="quality-legal ${legal?'pass':'fail'}">
      Implemented rule checks: <b>${legal?'PASS':'NEEDS ATTENTION'}</b>
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


function stationSetupDistance(nodeIndex, ordinal) {
  if(!course?.nodes?.[nodeIndex]) return null;

  let prevIndex=-1;
  for(let i=nodeIndex-1;i>=0;i--){
    const k=course.nodes[i]?.kind;
    if(k==='station' || k==='start'){
      prevIndex=i;
      break;
    }
  }
  if(prevIndex<0) return null;

  let feet=0;
  for(let i=prevIndex+1;i<=nodeIndex;i++){
    const a=course.nodes[i-1], b=course.nodes[i];
    if(!a||!b) continue;
    feet+=Math.hypot((b.x??0)-(a.x??0),(b.y??0)-(a.y??0));
  }

  const previous=course.nodes[prevIndex];
  const fromLabel=previous.kind==='start' ? 'Start' : `#${Math.max(1,ordinal-1)}`;
  return {feet,fromLabel};
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

    const setup=stationSetupDistance(nodeIndex,ord);
    const distanceLine=document.createElement('div');
    distanceLine.className='station-distance';
    distanceLine.textContent=setup
      ? `${setup.feet.toFixed(1)} ft from ${setup.fromLabel}`
      : 'Distance unavailable';
    detail.appendChild(distanceLine);

    const coords=document.createElement('div');
    coords.className='station-coords';
    coords.textContent=`x ${Number(node.x).toFixed(1)} ft · y ${Number(node.y).toFixed(1)} ft`;
    coords.title=`Internal station ID: ${node.stationId}`;
    detail.appendChild(coords);

    const changeState=currentChangeState(node.stationId);
    if(changeState){
      const badge=document.createElement('span');
      badge.className=`station-change-badge ${changeState.toLowerCase().replace('+','-')}`;
      badge.textContent=changeState;
      detail.appendChild(badge);
      row.classList.add(`change-${changeState.toLowerCase().replace('+','-')}`);
    }

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

  // Group the low-level diff events by stable station so a station that both
  // changes sign and moves is one understandable setup instruction.
  const grouped=new Map();
  for(const x of lastReport.changes){
    const g=grouped.get(x.stationId)||{stationId:x.stationId,events:[]};
    g.events.push(x);grouped.set(x.stationId,g);
  }
  const rows=[...grouped.values()].map(g=>{
    const e=g.events;
    const added=e.find(x=>x.type==='added');
    const removed=e.find(x=>x.type==='removed');
    const swapped=e.find(x=>x.type==='swapped');
    const moved=e.find(x=>x.type==='moved');
    const kept=e.find(x=>x.type==='kept');
    const ord=added?.afterOrdinal ?? swapped?.afterOrdinal ?? moved?.afterOrdinal ?? kept?.afterOrdinal ?? removed?.beforeOrdinal ?? '?';
    if(added) return {rank:3,state:'ADD',text:`#${ord} ADD sign ${added.to}`};
    if(removed) return {rank:4,state:'REMOVE',text:`Old #${ord} REMOVE sign ${removed.from}`};
    if(swapped && moved) return {rank:1,state:'CHANGE+MOVE',text:`#${ord} CHANGE ${swapped.from} → ${swapped.to} · MOVE ${moved.feet.toFixed(1)} ft`};
    if(swapped) return {rank:1,state:'CHANGE',text:`#${ord} CHANGE ${swapped.from} → ${swapped.to}`};
    if(moved) return {rank:2,state:'MOVE',text:`#${ord} MOVE ${moved.feet.toFixed(1)} ft · keep sign ${moved.to||moved.from}`};
    return {rank:5,state:'KEEP',text:`#${ord} KEEP sign ${kept?.signId||''}`};
  }).sort((a,b)=>a.rank-b.rank || a.text.localeCompare(b.text,undefined,{numeric:true}));

  const physical=rows.filter(r=>r.state!=='KEEP');
  const strategyNote = lastReport.addedForFlow
    ? `<div class="val ok" style="margin-bottom:8px">✓ Added ${lastReport.counts.added} station${lastReport.counts.added===1?'':'s'} in-flow to preserve more of the existing physical setup.</div>`
    : '';

  el.innerHTML=`${strategyNote}
    <div class="change-grid">
      <div class="change-stat"><b>${c.kept}</b><span>KEEP</span></div>
      <div class="change-stat"><b>${c.swapped}</b><span>CHANGE SIGN</span></div>
      <div class="change-stat"><b>${c.added}</b><span>ADD</span></div>
      <div class="change-stat"><b>${c.moved}</b><span>MOVE</span></div>
      <div class="change-stat"><b>${c.removed}</b><span>REMOVE</span></div>
      <div class="change-stat"><b>${lastReport.physicalSetupChanges}</b><span>SETUP ACTIONS</span></div>
    </div>
    <div class="change-list">${physical.map(r=>`<div><b class="change-${r.state.toLowerCase().replace('+','-')}">${r.state}</b> ${r.text.replace(r.state,'').trim()}</div>`).join('')||'<div>Everything stays in place. No physical setup changes.</div>'}</div>
    <details class="kept-details"><summary>Show ${rows.filter(r=>r.state==='KEEP').length} retained station(s)</summary>
      <div class="change-list">${rows.filter(r=>r.state==='KEEP').map(r=>`<div>${r.text}</div>`).join('')}</div>
    </details>`;
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
  const seg=course.creationMode==='manual' ? course.nodes.length-2 : nearestSegmentIndex(p);
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

let generationWorker;
let generationRequest=0;
const pendingGenerations=new Map();
function generateInBackground(options, operation='generate') {
  if(!generationWorker) {
    generationWorker=new Worker(new URL('./core/generation-worker.js',import.meta.url),{type:'module'});
    generationWorker.onmessage=({data})=>{
      const pending=pendingGenerations.get(data.id);
      if(!pending) return;
      pendingGenerations.delete(data.id);
      data.error ? pending.reject(new Error(data.error)) : pending.resolve(data.result ?? data.course);
    };
    generationWorker.onerror=()=>{
      for(const pending of pendingGenerations.values()) pending.reject(new Error('Course generation could not start. Serve this folder over HTTP and try again.'));
      pendingGenerations.clear();
      generationWorker.terminate();generationWorker=null;
    };
  }
  const id=++generationRequest;
  return new Promise((resolve,reject)=>{
    pendingGenerations.set(id,{resolve,reject});
    generationWorker.postMessage({id,packId:pack.id,options,operation});
  });
}
async function doGenerate() {
  const button=$('generateBtn');
  const requestedPack=pack, requestedLevel=levelEl.value;
  button.disabled=true;button.textContent='Generating…';
  const options={
    levelId:requestedLevel,
    ring:ringSettings(),
    includeSequences:$('includeSequences').checked,
    routeStyle:routeStyleEl?.value||'surprise',
    noGoZones:cloneZones(venueZones)
  };
  const request=generationRequest+1;
  try{
    const generated=await generateInBackground(options);
    // A result for an older organization or level must not replace the current view.
    if(request!==generationRequest || pack!==requestedPack || levelEl.value!==requestedLevel ||
      JSON.stringify(ringSettings())!==JSON.stringify(options.ring) ||
      (routeStyleEl?.value||'surprise')!==options.routeStyle ||
      $('includeSequences').checked!==options.includeSequences ||
      JSON.stringify(cloneZones(venueZones))!==JSON.stringify(options.noGoZones)) return;
    course=generated;
    syncVenueZonesFromCourse();
    lastReport=null;
    showLevelChanges=false;
    resetHistory();render();
  }catch(e){if(request>=generationRequest) alert(e.message);}
  finally{if(request>=generationRequest){button.disabled=false;button.textContent='Generate course';}}
}

function doBlankCourse() {
  try {
    generationRequest++;
    course = makeBlankCourse({
      pack,
      levelId: levelEl.value,
      ring: ringSettings(),
      noGoZones: cloneZones(venueZones)
    });
    lastReport = null;
    showLevelChanges = false;
    setupMode = false;
    resetHistory();
    render();
  } catch (e) {
    alert(e.message);
  }
}

function nextLevelId() {
  const selected=advanceTargetEl?.value;
  if(selected && nextLevelsFor(pack.levels[course.levelId]).includes(selected)) return selected;
  return nextLevelsFor(pack.levels[course.levelId]).find(id=>pack.levels[id]?.generationEnabled!==false) || null;
}

async function doUpgrade() {
  if(!course){doGenerate();return;}
  const target=nextLevelId();
  if(!target){alert('This is already the last level in this rule pack.');return;}
  const button=$('upgradeBtn'), originalText=button.textContent;
  if(button.disabled) return;
  const requestedPack=pack, originalCourse=JSON.stringify(course), originalLevel=levelEl.value;
  const request=generationRequest+1;
  button.disabled=true;button.textContent='Advancing…';
  try{
    const out=await generateInBackground({course,target},'upgrade');
    if(request!==generationRequest || pack!==requestedPack || levelEl.value!==originalLevel || JSON.stringify(course)!==originalCourse) return;
    course=out.course;lastReport=out.report;
    showLevelChanges=true;
    syncVenueZonesFromCourse();
    levelEl.value=target;
    ringW.value=course.ring.width;ringH.value=course.ring.height;
    resetHistory();
    render();
  }catch(e){if(request===generationRequest) alert(e.message);}
  finally{button.textContent=originalText;button.disabled=false;}
}

orgEl.addEventListener('change',()=>{setPack(orgEl.value);doGenerate();});
levelEl.addEventListener('change',()=>{applyLevelDefaults({preserveRing:true});renderPalette(levelEl.value);});
ringW.addEventListener('input',updateRingGuidance);
ringH.addEventListener('input',updateRingGuidance);
$('generateBtn').onclick=doGenerate;
$('blankCourseBtn').onclick=doBlankCourse;
$('upgradeBtn').onclick=doUpgrade;
$('undoBtn').onclick=doUndo;
$('redoBtn').onclick=doRedo;
$('insertStationBtn').onclick=insertAfterSelected;
$('deleteStationBtn').onclick=()=>selectedStationId&&removeStationById(selectedStationId);
$('setupModeBtn').onclick=()=>{setupMode=!setupMode;render(false);};
$('levelChangesBtn').onclick=()=>{
  if(!lastReport) return;
  showLevelChanges=!showLevelChanges;
  render(false);
};
$('setupPdfBtn').onclick=async()=>{
  if(!course)return;
  try{
    ensureImages();
    await exportCourseSetupPdf({course,pack,drawCourseToContext,imageCache:getImageCache()});
  }catch(e){alert(e.message);}
};
$('drawNoGoBtn').onclick=()=>setNoGoDrawing(!drawingNoGo);
$('clearNoGoBtn').onclick=()=>{
  if(course){
    const before=snapshotCourse();
    course.noGoZones=[];
    syncVenueZonesFromCourse();
    commitEdit(before);render();
  }else{
    venueZones=[];renderNoGoList();
  }
};
$('saveVenueBtn').onclick=saveCurrentVenueTemplate;
$('loadVenueBtn').onclick=loadSelectedVenueTemplate;
$('deleteVenueBtn').onclick=deleteSelectedVenueTemplate;
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
    course.noGoZones=cloneZones(course.noGoZones||[]);
    syncVenueZonesFromCourse();
    lastReport=null;
    showLevelChanges=false;
    resetHistory();render();
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
  if(drawingNoGo) return;
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
  if(!course) return;
  if(drawingNoGo){
    noGoStart=canvasPointToRing(canvas,course,e.clientX,e.clientY);
    noGoBefore=snapshotCourse();
    noGoPreview={x:noGoStart.x,y:noGoStart.y,width:0,height:0,label:'New no-go zone'};
    canvas.setPointerCapture(e.pointerId);
    return;
  }

  const i=findNodeAt(canvas,course,e.clientX,e.clientY);
  if(i>=0&&['station','start','finish'].includes(course.nodes[i].kind)){
    dragIndex=i;
    dragBefore=snapshotCourse();
    selectedStationId=course.nodes[i].kind==='station'?course.nodes[i].stationId:null;
    updateEditButtons();
    canvas.setPointerCapture(e.pointerId);
    drawCourse(canvas,course,pack,{selectedStationId,setupMode,changeStatusByStationId:changeStatusMap()});
  }
});
canvas.addEventListener('pointermove',e=>{
  if(drawingNoGo && noGoStart){
    const p=canvasPointToRing(canvas,course,e.clientX,e.clientY);
    noGoPreview={
      x:Math.min(noGoStart.x,p.x),
      y:Math.min(noGoStart.y,p.y),
      width:Math.abs(p.x-noGoStart.x),
      height:Math.abs(p.y-noGoStart.y),
      label:'New no-go zone'
    };
    drawCourse(canvas,course,pack,{
      selectedStationId,setupMode,
      previewNoGoZone:noGoPreview,
      changeStatusByStationId:changeStatusMap()
    });
    return;
  }

  if(dragIndex<0)return;
  const p=canvasPointToRing(canvas,course,e.clientX,e.clientY);
  course.nodes[dragIndex].x=p.x;course.nodes[dragIndex].y=p.y;
  recalcHeadings(course.nodes);
  drawCourse(canvas,course,pack,{selectedStationId,setupMode,changeStatusByStationId:changeStatusMap()});
});
canvas.addEventListener('pointerup',e=>{
  if(drawingNoGo && noGoStart){
    if(noGoPreview && noGoPreview.width>=1 && noGoPreview.height>=1){
      const n=(course.noGoZones||[]).length+1;
      course.noGoZones=course.noGoZones||[];
      course.noGoZones.push({
        ...noGoPreview,
        id:makeId('zone'),
        label:`No-go ${n}`
      });
      syncVenueZonesFromCourse();
      commitEdit(noGoBefore);
    }
    noGoStart=null;noGoPreview=null;noGoBefore=null;
    setNoGoDrawing(false);
    render();
    return;
  }

  if(dragIndex<0)return;
  dragIndex=-1;
  commitEdit(dragBefore);
  dragBefore=null;
  render();
});
canvas.addEventListener('pointercancel',()=>{
  if(drawingNoGo && noGoStart){
    if(noGoBefore) course=noGoBefore;
    noGoStart=null;noGoPreview=null;noGoBefore=null;
    setNoGoDrawing(false);render();return;
  }
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

renderVenueTemplates();
renderNoGoList();
initOrganizations();
doGenerate();
