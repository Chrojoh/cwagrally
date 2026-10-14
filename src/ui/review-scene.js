import * as THREE from '../vendor/three.module.js';
import {ringFence} from '../core/ring-scene.js';
import {signImageUrl} from '../core/pack.js';

export function reviewSignLayout(course) {
  return course.nodes.flatMap((node,index)=>{
    if(node.kind!=='station')return [];
    let before=index-1;
    while(before>0&&Math.hypot(node.x-course.nodes[before].x,node.y-course.nodes[before].y)<.001)before--;
    const previous=course.nodes[Math.max(0,before)],heading=Math.atan2(node.y-previous.y,node.x-previous.x);
    return [{node,heading,x:node.x-Math.sin(heading)*1.6,z:node.y+Math.cos(heading)*1.6,normalX:-Math.cos(heading),normalZ:-Math.sin(heading)}];
  });
}

// Deterministic, local textures: no remote imagery, fonts or rendering services.
export function makeSurfaceTexture(kind,createCanvas=()=>document.createElement('canvas')) {
  const canvas=createCanvas();canvas.width=1024;canvas.height=1024;
  const c=canvas.getContext('2d');let seed=71;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  if(kind==='gym'){
    c.fillStyle='#bc8c53';c.fillRect(0,0,1024,1024);
    const rowHeight=64;
    for(let row=0;row<16;row++){
      for(let x=-512+(row%3)*170;x<1024;x+=512){
        const light=58+random()*12;c.fillStyle=`hsl(34 48% ${light}%)`;
        c.fillRect(x+1,row*rowHeight+1,510,rowHeight-2);
        for(let grain=0;grain<100;grain++){
          const y=row*rowHeight+3+random()*58;
          c.strokeStyle=`rgba(91,51,19,${.025+random()*.075})`;c.lineWidth=.3+random()*.7;
          c.beginPath();c.moveTo(x+random()*40,y);
          c.bezierCurveTo(x+140,y+random()*3,x+330,y-random()*3,x+480,y+random()*2);c.stroke();
        }
      }
    }
  }else{
    c.fillStyle=kind==='grass'?'#567345':'#363d43';c.fillRect(0,0,1024,1024);
    for(let i=0;i<75000;i++){
      const x=random()*1024,y=random()*1024;
      c.fillStyle=kind==='grass'?`hsla(${85+random()*28},${20+random()*30}%,${24+random()*24}%,.45)`:`rgba(${random()>.5?'190,196,201':'13,20,25'},${.03+random()*.18})`;
      c.fillRect(x,y,kind==='grass'?1+random()*2:1,kind==='grass'?2+random()*6:1);
    }
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;return texture;
}

export function buildReviewScene(course,pack,{textureFactory=makeSurfaceTexture,loadSign=url=>new THREE.TextureLoader().load(url),makeCanvas=()=>document.createElement('canvas')}={}) {
  const scene=new THREE.Scene(),w=course.ring.width,h=course.ring.height,size=Math.max(w,h);
  scene.background=new THREE.Color('#e7e5df');scene.fog=new THREE.Fog('#e7e5df',size*1.5,size*4);
  scene.add(new THREE.HemisphereLight('#fff7eb','#6b737d',2.3));
  const key=new THREE.DirectionalLight('#fff1dc',3.1);key.position.set(w/2-18,45,h/2-16);key.target.position.set(w/2,0,h/2);scene.add(key,key.target);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=key.shadow.camera.bottom=-size*.85;key.shadow.camera.right=key.shadow.camera.top=size*.85;key.shadow.camera.far=130;key.shadow.normalBias=.025;key.shadow.bias=-.00015;
  const fill=new THREE.DirectionalLight('#d9e5ff',.65);fill.position.set(w+20,18,h+10);scene.add(fill);
  const trackedTextures=new Set(),materials=new Set(),floorTextures=new Map();
  const material=options=>{const m=new THREE.MeshStandardMaterial(options);materials.add(m);return m;};
  const floorMat=material({color:0xffffff,roughness:.46,metalness:0,bumpScale:.012});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(w+36,h+36),floorMat);ground.rotation.x=-Math.PI/2;ground.position.set(w/2,-.015,h/2);ground.receiveShadow=true;ground.name='floor';scene.add(ground);
  const room=new THREE.Group();room.name='indoor-room';scene.add(room);
  const wallMat=material({color:'#d8d9d6',roughness:.92}),padMat=material({color:'#344956',roughness:.82}),white=material({color:'#f7f6ef',roughness:.5}),rubber=material({color:'#28333b',roughness:.9});
  function box(parent,dimensions,position,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...dimensions),mat);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  for(const [dims,pos] of [[[w+30,12,.25],[w/2,6,-12]],[[w+30,12,.25],[w/2,6,h+12]],[[.25,12,h+24],[-12,6,h/2]],[[.25,12,h+24],[w+12,6,h/2]]]){
    box(room,dims,pos,wallMat);
    const padding=[...dims];padding[1]=3;box(room,padding,[pos[0],1.5,pos[2]],padMat);
  }
  // Recessed wall lights suggest a calm, softly lit training hall.
  const lamp=material({color:'#fff9e8',emissive:'#fff1cf',emissiveIntensity:.65,roughness:.35});
  for(let x=4;x<w;x+=12){box(room,[6,.45,.12],[x,8,-11.8],lamp);box(room,[6,.45,.12],[x,8,h+11.8],lamp);}
  const fenceGroup=new THREE.Group();fenceGroup.name='ring-fence';scene.add(fenceGroup);
  const beams=[];
  function beam(a,b,width,depth=width){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),matrix=new THREE.Matrix4();
    matrix.compose(start.add(end).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()),new THREE.Vector3(width,delta.length(),depth));beams.push(matrix);
  }
  for(const {a,b} of ringFence(course.ring,course.nodes[0])){
    const point=(t,y)=>[a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t];
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(const t of [0,1]){beam(point(t,0),point(t,2.7),.13);box(fenceGroup,[.46,.06,.46],point(t,.03),rubber);}
    for(const y of [.22,2.45])beam(point(0,y),point(1,y),.12);
    // Clip diagonal slats to the rectangular panel, producing a true lattice.
    const height=2.16,bottom=.26;
    for(const direction of [-1,1])for(let intercept=-length;intercept<height+length;intercept+=.55){
      const hits=[];
      for(const x of [0,length]){const y=direction*x+intercept;if(y>=0&&y<=height)hits.push([x,y]);}
      for(const y of [0,height]){const x=(y-intercept)/direction;if(x>0&&x<length)hits.push([x,y]);}
      if(hits.length>=2)beam(point(hits[0][0]/length,bottom+hits[0][1]),point(hits[1][0]/length,bottom+hits[1][1]),.035,.025);
    }
  }
  const lattice=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),white,beams.length);beams.forEach((m,i)=>lattice.setMatrixAt(i,m));lattice.castShadow=true;lattice.receiveShadow=true;fenceGroup.add(lattice);
  // Muted perimeter tape locates the ring without turning the floor into a grid.
  const tape=material({color:'#d7ceac',roughness:.8});
  for(const [dims,pos] of [[[w,.008,.07],[w/2,0,0]],[[w,.008,.07],[w/2,0,h]],[[.07,.008,h],[0,0,h/2]],[[.07,.008,h],[w,0,h/2]]])box(scene,dims,pos,tape);
  const signs=new THREE.Group();signs.name='station-signs';scene.add(signs);let ordinal=0;
  for(const layout of reviewSignLayout(course)){
    ordinal++;const group=new THREE.Group();group.name=`station-${ordinal}`;group.position.set(layout.x,0,layout.z);group.rotation.y=Math.atan2(layout.normalX,layout.normalZ);signs.add(group);
    box(group,[1.85,.06,.7],[0,.04,0],rubber);
    for(const x of [-.65,.65])box(group,[.06,.65,.07],[x,.35,-.08],rubber);
    const board=box(group,[1.75,1.3,.07],[0,.88,0],white);board.rotation.x=-.1;
    const texture=loadSign(signImageUrl(pack,layout.node.signId));texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;trackedTextures.add(texture);
    const faceMat=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});materials.add(faceMat);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.2),faceMat);face.position.set(0,.88,.044);face.rotation.x=-.1;group.add(face);
    const cv=makeCanvas();cv.width=256;cv.height=128;const c=cv.getContext('2d');c.fillStyle='#132e40';c.fillRect(0,0,256,128);c.fillStyle='#ffffff';c.font='bold 88px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(ordinal),128,68);
    const numberTexture=new THREE.CanvasTexture(cv);numberTexture.colorSpace=THREE.SRGBColorSpace;trackedTextures.add(numberTexture);
    const numberMat=new THREE.MeshBasicMaterial({map:numberTexture,toneMapped:false});materials.add(numberMat);
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(.48,.24),numberMat);plate.position.set(0,1.68,.04);group.add(plate);
  }
  const zoneMat=material({color:'#ba6951',transparent:true,opacity:.25,roughness:.9});
  for(const zone of course.noGoZones||[])box(scene,[zone.width,.035,zone.height],[zone.x+zone.width/2,.018,zone.y+zone.height/2],zoneMat);
  const markerMat=material({color:'#bc8a31',roughness:.6});
  for(const node of course.nodes.filter(n=>n.kind==='start'||n.kind==='finish')){
    const marker=new THREE.Mesh(new THREE.ConeGeometry(.2,.55,20),markerMat);marker.position.set(node.x,.275,node.y);marker.castShadow=true;scene.add(marker);
  }
  function setFloor(kind){
    if(!floorTextures.has(kind)){const texture=textureFactory(kind);texture.repeat.set((w+36)/24,(h+36)/24);texture.anisotropy=8;floorTextures.set(kind,texture);trackedTextures.add(texture);}
    floorMat.map=floorTextures.get(kind);floorMat.bumpMap=kind==='gym'?floorTextures.get(kind):null;floorMat.roughness=kind==='gym'?.46:.97;floorMat.needsUpdate=true;room.visible=kind!=='grass';scene.background.set(kind==='grass'?'#d9e5df':'#e7e5df');scene.fog.color.copy(scene.background);
  }
  setFloor('gym');
  function dispose(){scene.traverse(object=>object.geometry?.dispose());materials.forEach(m=>m.dispose());trackedTextures.forEach(t=>t.dispose());key.shadow.dispose();}
  return {scene,setFloor,dispose,signs,fenceGroup};
}

export function createReviewRenderer(canvas,course,pack) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  let world;try{world=buildReviewScene(course,pack);}catch(error){renderer.dispose();throw error;}
  const size=Math.max(course.ring.width,course.ring.height),camera=new THREE.PerspectiveCamera(68,1,.035,size*6);
  let floor='gym',width=0,height=0,disposed=false;
  return {
    render(pose,heading,overview,floorKind='gym'){
      if(disposed)return;
      const rect=canvas.getBoundingClientRect(),w=Math.max(320,Math.round(rect.width)),h=Math.max(240,Math.round(rect.height));
      if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
      if(floorKind!==floor){world.setFloor(floorKind);floor=floorKind;}
      if(overview){camera.position.set(course.ring.width/2-size*.5,size*.9,course.ring.height/2+size*.65);camera.lookAt(course.ring.width/2,0,course.ring.height/2);}
      else{camera.position.set(pose.x,1,pose.y);camera.lookAt(pose.x+Math.cos(heading)*12,.88,pose.y+Math.sin(heading)*12);}
      renderer.render(world.scene,camera);
    },
    dispose(){if(disposed)return;disposed=true;world.dispose();renderer.dispose();renderer.forceContextLoss();}
  };
}
