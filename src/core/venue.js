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
  if(pointInNoGoZone(a,zone,buffer) || pointInNoGoZone(b,zone,buffer)) return true;
  const c=rectCorners(zone,buffer);
  if(c.length!==4) return false;
  for(let i=0;i<4;i++){
    if(segmentsCross(a,b,c[i],c[(i+1)%4])) return true;
  }
  return false;
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
