import { segmentsCross } from './geometry.js';

export function normalizeNoGoZone(zone) {
  if (!zone) return null;
  let x = Number(zone.x), y = Number(zone.y);
  let width = Number(zone.width), height = Number(zone.height);
  if (![x,y,width,height].every(Number.isFinite)) return null;
  if (width < 0) { x += width; width = Math.abs(width); }
  if (height < 0) { y += height; height = Math.abs(height); }
  return {
    ...zone,
    x, y, width, height,
    label: zone.label || 'No-go zone'
  };
}

export function rectCorners(zone, buffer = 0) {
  const z = normalizeNoGoZone(zone);
  if (!z) return [];
  const left=z.x-buffer, top=z.y-buffer;
  const right=z.x+z.width+buffer, bottom=z.y+z.height+buffer;
  return [
    {x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}
  ];
}

export function pointInNoGoZone(point, zone, buffer = 0) {
  const z=normalizeNoGoZone(zone);
  if(!z || !point) return false;
  return point.x >= z.x-buffer &&
         point.x <= z.x+z.width+buffer &&
         point.y >= z.y-buffer &&
         point.y <= z.y+z.height+buffer;
}

export function segmentIntersectsNoGoZone(a,b,zone,buffer=0) {
  const z=normalizeNoGoZone(zone);
  if(!z || !a || !b) return false;
  const left=z.x-buffer,right=z.x+z.width+buffer;
  const top=z.y-buffer,bottom=z.y+z.height+buffer;
  if(pointInNoGoZone(a,z,buffer) || pointInNoGoZone(b,z,buffer)) return true;

  // Slab/clip test against the axis-aligned rectangle. Unlike a simple
  // orientation-only edge test, this also catches a route running exactly
  // along an obstacle edge or through a rectangle corner.
  const dx=b.x-a.x,dy=b.y-a.y;
  let t0=0,t1=1;
  const clip=(p,q)=>{
    if(Math.abs(p)<1e-12) return q>=0;
    const r=q/p;
    if(p<0){ if(r>t1) return false; if(r>t0) t0=r; }
    else { if(r<t0) return false; if(r<t1) t1=r; }
    return true;
  };
  if(!clip(-dx,a.x-left)) return false;
  if(!clip( dx,right-a.x)) return false;
  if(!clip(-dy,a.y-top)) return false;
  if(!clip( dy,bottom-a.y)) return false;
  return t0<=t1+1e-12;
}

export function routeNoGoConflicts(nodes,zones=[],buffer=0.5) {
  const clean=(zones||[]).map(normalizeNoGoZone).filter(z=>z && z.width>0 && z.height>0);
  if(!clean.length) return [];
  const out=[];

  nodes.forEach((node,nodeIndex)=>{
    for(const zone of clean){
      if(pointInNoGoZone(node,zone,buffer)){
        out.push({
          type:'node-in-no-go',
          zoneId:zone.id,
          zoneLabel:zone.label,
          nodeIndex,
          stationId:node.stationId,
          nodeKind:node.kind
        });
      }
    }
  });

  for(let i=0;i<nodes.length-1;i++){
    for(const zone of clean){
      if(segmentIntersectsNoGoZone(nodes[i],nodes[i+1],zone,buffer)){
        out.push({
          type:'route-through-no-go',
          zoneId:zone.id,
          zoneLabel:zone.label,
          segmentStartIndex:i,
          stationIds:[nodes[i].stationId,nodes[i+1].stationId].filter(Boolean)
        });
      }
    }
  }
  return out;
}


function insideRing(point, ring, margin = 1) {
  return point.x >= margin && point.y >= margin &&
         point.x <= ring.width - margin && point.y <= ring.height - margin;
}


export function relocateGeneratedAnchors(points, zones = [], ring, { buffer = 0.5, margin = 1.5, minGap = 4.5 } = {}) {
  const clean=(zones||[]).map(normalizeNoGoZone).filter(z=>z && z.width>0 && z.height>0);
  if(!clean.length) return points;
  if(!ring?.width || !ring?.height || !points?.length) return null;

  const out=points.map(p=>({...p}));
  const safe=p=>insideRing(p,ring,Math.min(0.5,buffer)) && !clean.some(z=>pointInNoGoZone(p,z,buffer));
  const gapOk=(p,i)=>{
    const prev=i>0?out[i-1]:null;
    const next=i<out.length-1?out[i+1]:null;
    if(prev && Math.hypot(p.x-prev.x,p.y-prev.y)<minGap) return false;
    if(next && Math.hypot(p.x-next.x,p.y-next.y)<minGap) return false;
    return true;
  };

  for(let i=0;i<out.length;i++){
    if(safe(out[i])) continue;
    const original={...out[i]};
    const candidates=[];
    for(const z of clean){
      if(!pointInNoGoZone(original,z,buffer)) continue;
      const pad=buffer+margin;
      const left=z.x-pad,right=z.x+z.width+pad;
      const top=z.y-pad,bottom=z.y+z.height+pad;
      candidates.push(
        {x:left,y:original.y},{x:right,y:original.y},
        {x:original.x,y:top},{x:original.x,y:bottom},
        {x:left,y:top},{x:left,y:bottom},{x:right,y:top},{x:right,y:bottom}
      );
    }

    const usable=candidates
      .filter(safe)
      .filter(p=>gapOk(p,i))
      .map(p=>({
        ...p,
        score:Math.hypot(p.x-original.x,p.y-original.y)
          + (i>0?0.08*Math.abs(Math.hypot(p.x-out[i-1].x,p.y-out[i-1].y)-Math.hypot(original.x-out[i-1].x,original.y-out[i-1].y)):0)
          + (i<out.length-1?0.08*Math.abs(Math.hypot(p.x-out[i+1].x,p.y-out[i+1].y)-Math.hypot(original.x-out[i+1].x,original.y-out[i+1].y)):0)
      }))
      .sort((a,b)=>a.score-b.score);
    if(!usable.length) return null;
    out[i]={...original,x:usable[0].x,y:usable[0].y,venueAdjusted:true};
  }

  out.routeFamily=points.routeFamily;
  out.venueAnchorAdjustCount=out.filter(p=>p.venueAdjusted).length;
  return out;
}

function visibleSegment(a, b, zones, buffer) {
  return !zones.some(zone => segmentIntersectsNoGoZone(a, b, zone, buffer));
}

function shortestVisiblePath(a, b, zones, ring, buffer = 0.5, margin = 1.5) {
  if (visibleSegment(a, b, zones, buffer)) return [a, b];

  // Build a small visibility graph from the corners just outside every obstacle.
  // The extra clearance keeps the detour line from merely riding the validator's
  // buffered boundary, which would still count as an intersection.
  const cornerPad = buffer + 0.9;
  const vertices = [a, b];
  for (const zone of zones) {
    for (const corner of rectCorners(zone, cornerPad)) {
      if (!insideRing(corner, ring, margin)) continue;
      if (zones.some(z => pointInNoGoZone(corner, z, buffer + 0.05))) continue;
      vertices.push(corner);
    }
  }

  const n = vertices.length;
  const graph = Array.from({ length:n }, () => []);
  for (let i=0;i<n;i++) {
    for (let j=i+1;j<n;j++) {
      if (!visibleSegment(vertices[i], vertices[j], zones, buffer)) continue;
      const d=Math.hypot(vertices[i].x-vertices[j].x, vertices[i].y-vertices[j].y);
      graph[i].push({to:j,w:d});
      graph[j].push({to:i,w:d});
    }
  }

  const dist=Array(n).fill(Infinity), prev=Array(n).fill(-1), used=Array(n).fill(false);
  dist[0]=0;
  for (let step=0;step<n;step++) {
    let u=-1;
    for (let i=0;i<n;i++) if(!used[i] && (u<0 || dist[i]<dist[u])) u=i;
    if(u<0 || !Number.isFinite(dist[u])) break;
    if(u===1) break;
    used[u]=true;
    for(const e of graph[u]) {
      const nd=dist[u]+e.w;
      if(nd+1e-9<dist[e.to]) {dist[e.to]=nd;prev[e.to]=u;}
    }
  }
  if(!Number.isFinite(dist[1])) return null;

  const idx=[];
  for(let u=1;u>=0;u=prev[u]) {
    idx.push(u);
    if(u===0) break;
    if(prev[u]<0) return null;
  }
  idx.reverse();
  return idx.map(i=>vertices[i]);
}

export function rerouteAroundNoGoZones(points, zones = [], ring, { buffer = 0.5, margin = 1.5 } = {}) {
  const clean=(zones||[]).map(normalizeNoGoZone).filter(z=>z && z.width>0 && z.height>0);
  if(!clean.length) return points;
  if(!ring?.width || !ring?.height || !points?.length) return null;

  // Do not silently move a real Start/Finish/station anchor out of an obstacle.
  // The route generator can try another anchor layout; rerouting is only used
  // for the travel legs between otherwise usable anchors.
  if(points.some(p=>clean.some(z=>pointInNoGoZone(p,z,buffer)))) return null;

  const out=[{...points[0]}];
  for(let i=0;i<points.length-1;i++) {
    const a=points[i], b=points[i+1];
    const path=shortestVisiblePath(a,b,clean,ring,buffer,margin);
    if(!path) return null;
    for(let k=1;k<path.length;k++) {
      const isDestination=k===path.length-1;
      out.push(isDestination
        ? {...b}
        : {...path[k], routeRole:'waypoint', venueDetour:true});
    }
  }

  out.routeFamily=points.routeFamily;
  out.venueDetourCount=out.filter(p=>p.routeRole==='waypoint').length;
  return out;
}

export function equipmentNoGoConflicts({ nodes, nodeIndex, sign, zones = [], buffer = 0.5 }) {
  if(!sign?.space?.footprint || !zones?.length) return [];
  // Delayed import avoidance: equipment footprints are represented as oriented
  // rectangles. Reconstruct the same footprint locally from the sign's metadata.
  const cfg=sign.space.footprint;
  const node=nodes[nodeIndex];
  if(!node) return [];
  const next=nodes[nodeIndex+1] || node;
  const dx=next.x-node.x,dy=next.y-node.y;
  const L=Math.max(1e-9,Math.hypot(dx,dy));
  const forward={x:dx/L,y:dy/L};
  const right={x:-forward.y,y:forward.x};
  const back=cfg.back??0, forwardFt=cfg.forward??0, halfWidth=cfg.halfWidth??0, centerOffset=cfg.centerOffset??0;
  const center={x:node.x+forward.x*centerOffset,y:node.y+forward.y*centerOffset};
  const local=(along,across)=>({x:center.x+forward.x*along+right.x*across,y:center.y+forward.y*along+right.y*across});
  const corners=[local(-back,-halfWidth),local(-back,halfWidth),local(forwardFt,halfWidth),local(forwardFt,-halfWidth)];
  const conflicts=[];
  for(const zone of zones.map(normalizeNoGoZone).filter(Boolean)) {
    const zc=rectCorners(zone,buffer);
    const pointInsideRect=p=>p.x>=zone.x-buffer&&p.x<=zone.x+zone.width+buffer&&p.y>=zone.y-buffer&&p.y<=zone.y+zone.height+buffer;
    let overlap=corners.some(pointInsideRect);
    if(!overlap) {
      // Is an obstacle corner inside the oriented equipment footprint?
      const inFoot=p=>{
        const px=p.x-center.x,py=p.y-center.y;
        const along=px*forward.x+py*forward.y;
        const across=px*right.x+py*right.y;
        return along>=-back-buffer&&along<=forwardFt+buffer&&Math.abs(across)<=halfWidth+buffer;
      };
      overlap=zc.some(inFoot);
    }
    if(!overlap) {
      for(let i=0;i<4&&!overlap;i++) for(let j=0;j<4;j++) {
        if(segmentsCross(corners[i],corners[(i+1)%4],zc[j],zc[(j+1)%4])) {overlap=true;break;}
      }
    }
    if(overlap) conflicts.push({type:'equipment-in-no-go',zoneId:zone.id,zoneLabel:zone.label,stationId:node.stationId,signId:sign.id,nodeIndex});
  }
  return conflicts;
}
