import {exerciseScript,sampleExercise,exerciseWorldPose} from '../core/exercise-motion.js';
import {buildWalkthrough,sampleWalkthrough,walkthroughHeading,easeHeading} from '../core/walkthrough.js';
import {signImageUrl} from '../core/pack.js';

export function openWalkthrough(course,pack) {
  const route=buildWalkthrough(course);
  if(route.nodes.length<2) return;
  const dialog=document.createElement('dialog');
  dialog.className='walk-dialog';
  dialog.innerHTML=`<div class="walk-header"><strong>Walk course · first-person preview</strong><button type="button" data-close>Close</button></div>
    <p class="muted">Preview handler movements for supported C-WAGS signs. Turning radii, step lengths and timing are illustrative. Equipment markers are illustrative; refer to the setup map for placement.</p>
    <canvas aria-label="First-person walkthrough of the current rally course"></canvas>
    <div class="walk-controls"><button data-play>Play</button><button data-prev>Previous station</button><button data-next>Next station</button><button data-restart>Restart</button>
    <label>Speed <select data-speed><option value="3">Normal</option><option value="6">Fast</option><option value="1.5">Slow</option></select></label>
    <label><input data-exercises type="checkbox" checked> Perform exercises</label>
    <label><input data-pause-stations type="checkbox"> Pause at signs</label>
    <label>View <select data-view><option value="follow">First person</option><option value="overview">Ring overview</option></select></label></div>
    <input data-progress aria-label="Position along course" type="range" min="0" max="${route.length}" step="0.1" value="0">
    <div class="walk-station" aria-live="polite"><img alt=""><div><strong data-title></strong><p data-detail></p></div></div>`;
  document.body.append(dialog);
  const $=s=>dialog.querySelector(s),canvas=$('canvas'),ctx=canvas.getContext('2d');
  let distance=0,playing=false,frame=0,previous=0,closed=false,arrived=null,velocity=0,cameraHeading=walkthroughHeading(route,0),exercise=null,exercisePose=null,departure=null,pace=1;
  const images=new Map();
  for(const n of route.stops.filter(n=>n.signId)) {
    const img=new Image();img.onload=()=>{if(!closed) draw();};img.src=signImageUrl(pack,n.signId);images.set(n.signId,img);
  }
  function setPlaying(value){playing=value;if(!value)velocity=0;$('[data-play]').textContent=value?'Pause':'Play';}
  function setDistance(value,snapCamera=true){if(snapCamera){exercise=null;exercisePose=null;departure=null;pace=1;}distance=Math.max(0,Math.min(route.length,value));arrived=route.stops.find(n=>Math.abs(n.distance-distance)<0.05)||null;if(snapCamera)cameraHeading=walkthroughHeading(route,distance);$('[data-progress]').value=distance;if(snapCamera)draw();}
  function stationName(n){return n?.kind==='station'?`Station ${n.ordinal} · ${n.signId} — ${pack.signs[n.signId]?.name||''}`:n?.kind==='finish'?'Finish':'Start';}
  function draw(){
    const rect=canvas.getBoundingClientRect(),w=Math.max(320,Math.round(rect.width)),h=Math.max(260,Math.round(rect.height));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const routePose=sampleWalkthrough(route,distance);if(!routePose)return;
    const pose=exercisePose||travelPose(routePose);
    const forward={x:Math.cos(cameraHeading),y:Math.sin(cameraHeading)};
    const overview=$('[data-view]').value==='overview',size=Math.max(course.ring.width,course.ring.height);
    const eye=overview?{x:course.ring.width/2-size*.65,y:course.ring.height/2-size*.8,z:size*.85}:{x:pose.x,y:pose.y,z:5.3};
    const target=overview?{x:course.ring.width/2,y:course.ring.height/2,z:0}:{x:pose.x+forward.x*15,y:pose.y+forward.y*15,z:4.2};
    const dx=target.x-eye.x,dy=target.y-eye.y,dz=target.z-eye.z,len=Math.hypot(dx,dy,dz),fx=dx/len,fy=dy/len,fz=dz/len,flat=Math.hypot(fx,fy),rx=-fy/flat,ry=fx/flat;
    const ux=-fz*ry,uy=fz*rx,uz=flat,focal=Math.min(w,h)*1.05;
    function project(x,y,z=0){const a=x-eye.x,b=y-eye.y,c=z-eye.z,depth=a*fx+b*fy+c*fz;return depth>.4?{x:w/2+focal*(a*rx+b*ry)/depth,y:h*.49-focal*(a*ux+b*uy+c*uz)/depth,depth}:null;}
    function line(a,b,color,width=2){const p=project(...a),q=project(...b);if(!p||!q)return;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
    function sphere(x,y,z,r,color){const p=project(x,y,z);if(!p)return;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(1,focal*r/p.depth),Math.max(1,focal*r/p.depth),0,0,Math.PI*2);ctx.fill();}
    function label(x,y,z,text){const p=project(x,y,z);if(!p)return;ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#172033';ctx.fillText(text,p.x,p.y);}
    ctx.fillStyle='#dceffc';ctx.fillRect(0,0,w,h);ctx.fillStyle='#e8f1dd';ctx.fillRect(0,h*.48,w,h*.52);
    for(let x=0;x<=course.ring.width;x+=5)line([x,0,0],[x,course.ring.height,0],'#c4d4be',1);
    for(let y=0;y<=course.ring.height;y+=5)line([0,y,0],[course.ring.width,y,0],'#c4d4be',1);
    const corners=[[0,0,0],[course.ring.width,0,0],[course.ring.width,course.ring.height,0],[0,course.ring.height,0]];
    corners.forEach((a,i)=>line(a,corners[(i+1)%4],'#78927b',3));
    route.nodes.forEach((n,i)=>{if(i)line([route.nodes[i-1].x,route.nodes[i-1].y,.04],[n.x,n.y,.04],'#6296bc',3);});
    for(const zone of course.noGoZones||[]){const c=[[zone.x,zone.y,0],[zone.x+zone.width,zone.y,0],[zone.x+zone.width,zone.y+zone.height,0],[zone.x,zone.y+zone.height,0]];c.forEach((a,i)=>line(a,c[(i+1)%4],'#d75d57',5));label(zone.x+zone.width/2,zone.y+zone.height/2,1,zone.label||'No-go area');}
    const objects=route.stops.map(n=>({n,depth:project(n.x,n.y)?.depth||-1})).sort((a,b)=>b.depth-a.depth);
    for(const {n} of objects){
      if(n.kind!=='station'){sphere(n.x,n.y,0.3,.4,'#d99a16');label(n.x,n.y,1.7,n.kind==='start'?'START':'FINISH');continue;}
      const index=route.nodes.indexOf(n); // stops and nodes share references
      const before=route.nodes[Math.max(0,index-1)],angle=Math.atan2(n.y-before.y,n.x-before.x),right={x:-Math.sin(angle),y:Math.cos(angle)};
      const sx=n.x+right.x*1.6,sy=n.y+right.y*1.6;
      line([sx,sy,0],[sx,sy,3],'#69737b',3);
      const p=project(sx,sy,3),img=images.get(n.signId);
      if(p){const size=Math.min(145,focal*2.1/p.depth);ctx.fillStyle='white';ctx.fillRect(p.x-size/2,p.y-size/2,size,size);if(img?.complete&&img.naturalWidth)ctx.drawImage(img,p.x-size/2,p.y-size/2,size,size);ctx.strokeStyle='#77828f';ctx.strokeRect(p.x-size/2,p.y-size/2,size,size);label(sx,sy,4.5,String(n.ordinal));}
      const sign=pack.signs[n.signId],name=sign?.name||'';
      if(sign?.space?.footprint){sphere(n.x,n.y,0.3,.35,'#ef943d');label(n.x,n.y,.9,/jump/i.test(name)?'JUMP AREA':/spiral|serpentine|figure|clover/i.test(name)?'CONE AREA':'EXERCISE AREA');}
    }
    const stop=exercise?.stop||arrived||routePose.next,title=stationName(stop);
    $('[data-title]').textContent=(exercise?'Performing: ':arrived?'At: ':'Approaching: ')+title;
    $('[data-detail]').textContent=`${distance.toFixed(1)} / ${route.length.toFixed(1)} ft · ${exercise?'Exercise motion preview':!playing&&arrived?.kind==='station'?'Press Play to continue.':$('[data-exercises]').checked&&stop?.kind==='station'&&!exerciseScript(pack.id,stop.signId)?'This exercise has no motion script yet; route preview only.':'Handler view; dog actions are not shown.'}`;
    const image=$('.walk-station img');image.hidden=!stop?.signId;if(stop?.signId){const src=signImageUrl(pack,stop.signId);if(image.getAttribute('src')!==src)image.src=src;image.alt=title;}
  }
  $('[data-play]').onclick=()=>{if(distance>=route.length)setDistance(0);arrived=null;setPlaying(!playing);};
  $('[data-next]').onclick=()=>{setPlaying(false);setDistance(route.stops.find(n=>n.distance>distance+.05)?.distance??route.length);};
  $('[data-prev]').onclick=()=>{setPlaying(false);setDistance([...route.stops].reverse().find(n=>n.distance<distance-.05)?.distance??0);};
  $('[data-restart]').onclick=()=>{setPlaying(false);setDistance(0);};
  $('[data-progress]').oninput=e=>{setPlaying(false);setDistance(Number(e.target.value));};
  $('[data-view]').onchange=draw;
  $('[data-exercises]').onchange=()=>{exercise=null;exercisePose=null;departure=null;pace=1;draw();};
  function travelPose(pose){
    if(!departure)return pose;
    const end=departure.nextDistance;
    const t=Math.max(0,Math.min(1,(distance-departure.distance)/Math.max(.01,end-departure.distance)));
    return {...pose,x:pose.x+departure.dx*(1-t),y:pose.y+departure.dy*(1-t)};
  }
  function travelHeading(){
    if(departure){
      const next=route.nodes.find(n=>n.distance>departure.distance+.001);
      const anchor=sampleWalkthrough(route,departure.distance);
      if(next&&distance<departure.nextDistance)return Math.atan2(next.y-anchor.y-departure.dy,next.x-anchor.x-departure.dx);
    }
    const next=route.stops.find(n=>n.distance>distance+.001);
    if(next&&$('[data-exercises]').checked&&exerciseScript(pack.id,next.signId)){
      const index=route.nodes.indexOf(next),before=route.nodes[Math.max(0,index-1)];
      // Keep the approach facing forward; the exercise owns the full rotation.
      const segment=route.nodes.findIndex((n,i)=>i>0&&n.distance>distance);
      if(segment===index)return Math.atan2(next.y-before.y,next.x-before.x);
    }
    return walkthroughHeading(route,distance);
  }
  function beginExercise(stop){
    const script=$('[data-exercises]').checked&&exerciseScript(pack.id,stop.signId);
    if(!script)return false;
    const index=route.nodes.indexOf(stop),before=route.nodes[Math.max(0,index-1)];
    const heading=Math.atan2(stop.y-before.y,stop.x-before.x);
    exercise={stop,script,time:0,origin:{x:stop.x,y:stop.y,heading}};
    departure=null;velocity=0;cameraHeading=heading;
    exercisePose=exerciseWorldPose(exercise.origin,sampleExercise(script,0));
    return true;
  }
  function tick(now){
    if(closed)return;
    const dt=previous?Math.min(.05,(now-previous)/1000):0;previous=now;
    if(playing&&exercise){
      exercise.time+=dt*Number($('[data-speed]').value)/3;
      const local=sampleExercise(exercise.script,exercise.time);
      exercisePose=exerciseWorldPose(exercise.origin,local);
      cameraHeading=exercisePose.heading;
      if(local.done){
        if(exercise.script.pace)pace=exercise.script.pace;
        const next=route.nodes.find(n=>n.distance>distance+.001);
        departure={distance,nextDistance:next?.distance??route.length,dx:exercisePose.x-exercise.stop.x,dy:exercisePose.y-exercise.stop.y};
        exercise=null;exercisePose=null;
        if($('[data-pause-stations]').checked)setPlaying(false);
      }
    }else if(playing){
      const next=route.stops.find(n=>n.distance>distance+.001);
      const stopForExercise=next&&$('[data-exercises]').checked&&exerciseScript(pack.id,next.signId);
      const pauseAtSigns=$('[data-pause-stations]').checked;
      const remaining=Math.max(0,((pauseAtSigns||stopForExercise)&&next?next.distance:route.length)-distance);
      const desired=Math.min(Number($('[data-speed]').value)*pace,Math.sqrt(2*5*remaining));
      velocity+=(desired-velocity)*(1-Math.exp(-dt*5));
      const proposed=distance+Math.max(.05,velocity)*dt;
      if(next&&proposed>=next.distance){
        setDistance(next.distance,false);
        if(!beginExercise(next)&&pauseAtSigns)setPlaying(false);
      }else{setDistance(proposed,false);if(distance>=route.length)setPlaying(false);}
    }
    if(!exercise)cameraHeading=easeHeading(cameraHeading,travelHeading(),dt);
    draw();frame=requestAnimationFrame(tick);
  }
  function cleanup(){if(closed)return;closed=true;cancelAnimationFrame(frame);observer.disconnect();dialog.remove();}
  $('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',cleanup,{once:true});
  const observer=new ResizeObserver(draw);observer.observe(canvas);
  dialog.showModal();setDistance(0);frame=requestAnimationFrame(tick);
}
