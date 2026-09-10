import { equipmentFootprintFor, requiredTurnAt } from '../core/geometry.js';
import { signImageUrl } from '../core/pack.js';

const cache = new Map();

let lastScreenStationLayout = new Map();

export function isNumberedStationNode(node) {
  return node?.kind === 'station';
}

function rectsOverlap(a, b, pad = 0) {
  return !(
    a.right + pad <= b.left ||
    a.left >= b.right + pad ||
    a.bottom + pad <= b.top ||
    a.top >= b.bottom + pad
  );
}

function overflowAmount(rect, bounds) {
  return (
    Math.max(0, bounds.left - rect.left) +
    Math.max(0, rect.right - bounds.right) +
    Math.max(0, bounds.top - rect.top) +
    Math.max(0, rect.bottom - bounds.bottom)
  );
}

function stationDisplayCandidate(anchor, r, thumb, gap, dx, dy, side, opts) {
  const center = { x: anchor.x + dx, y: anchor.y + dy };
  const tx = side === 'left'
    ? center.x - r - gap - thumb
    : center.x + r + gap;
  const ty = center.y - thumb / 2;

  const labelPad = opts.print ? 0 : 16;
  const bbox = {
    left: Math.min(center.x - r, tx) - 3,
    right: Math.max(center.x + r, tx + thumb) + 3,
    top: Math.min(center.y - r, ty) - labelPad - 3,
    bottom: Math.max(center.y + r, ty + thumb) + 3
  };

  return { anchor, center, tx, ty, side, bbox, dx, dy };
}

function buildStationDisplayLayout(course, pt, box, opts = {}) {
  const print = !!opts.print;
  const r = print ? 28 : 12;
  const thumb = print ? 90 : 40;
  const gap = print ? 10 : 5;
  const separation = thumb + (print ? 20 : 10);
  const bounds = {
    left: box.x + 5,
    right: box.x + box.w - 5,
    top: box.y + 5,
    bottom: box.y + box.h - 5
  };

  const occupied = [];

  // Keep station graphics from covering Start / Finish.
  for (const node of course.nodes) {
    if (node.kind !== 'start' && node.kind !== 'finish') continue;
    const p = pt(node);
    const rr = print ? 32 : 15;
    occupied.push({
      left: p.x - rr,
      right: p.x + rr,
      top: p.y - rr,
      bottom: p.y + rr
    });
  }

  const layout = new Map();

  for (let i = 0; i < course.nodes.length; i++) {
    const node = course.nodes[i];
    if (!isNumberedStationNode(node)) continue;

    const anchorPoint = pt(node);
    const joined = !!node.joinedToPrevious;

    // Joined exercises are deliberately close physically, so prefer moving
    // the second display vertically before trying other directions.
    const offsets = joined
      ? [
          [0, -separation],
          [0, separation],
          [0, 0],
          [-separation * 0.70, 0],
          [separation * 0.70, 0],
          [0, -separation * 2],
          [0, separation * 2],
          [-separation * 0.75, -separation],
          [-separation * 0.75, separation],
          [separation * 0.75, -separation],
          [separation * 0.75, separation]
        ]
      : [
          [0, 0],
          [0, -separation],
          [0, separation],
          [-separation * 0.70, 0],
          [separation * 0.70, 0],
          [0, -separation * 2],
          [0, separation * 2],
          [-separation * 0.75, -separation],
          [-separation * 0.75, separation],
          [separation * 0.75, -separation],
          [separation * 0.75, separation]
        ];

    let best = null;
    for (const [dx, dy] of offsets) {
      for (const side of ['right', 'left']) {
        const candidate = stationDisplayCandidate(
          anchorPoint, r, thumb, gap, dx, dy, side, opts
        );

        let collisions = 0;
        for (const other of occupied) {
          if (rectsOverlap(candidate.bbox, other, print ? 6 : 3)) collisions++;
        }

        const overflow = overflowAmount(candidate.bbox, bounds);
        const distanceCost = Math.hypot(dx, dy);
        const sideCost = side === 'left' ? (print ? 5 : 2) : 0;

        // Collision-free and inside the canvas always wins. Among those,
        // keep the graphic as close as possible to its true station position.
        const score =
          collisions * 100000 +
          overflow * 1000 +
          distanceCost +
          sideCost;

        if (!best || score < best.score) {
          best = { ...candidate, score, collisions, overflow };
        }
      }
    }

    layout.set(i, best);
    occupied.push(best.bbox);
  }

  return layout;
}


export function getImageCache() { return cache; }

export function loadSignImage(pack, signId, redraw) {
  const key = `${pack.id}:${pack.version}:${signId}`;
  if (cache.has(key)) return cache.get(key);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => redraw?.();
  img.onerror = () => { cache.set(key, null); redraw?.(); };
  img.src = signImageUrl(pack, signId);
  cache.set(key, img);
  return img;
}

function imageFor(pack, signId) {
  return cache.get(`${pack.id}:${pack.version}:${signId}`) || null;
}

export function drawCourseToContext(ctx, course, pack, box, imageCache = cache, opts = {}) {
  const { x, y, w, h } = box;
  const ring = course.ring;
  const pad = opts.print ? 65 : 42;
  const scale = Math.min((w - pad * 2) / ring.width, (h - pad * 2) / ring.height);
  const ox = x + (w - ring.width * scale) / 2;
  const oy = y + (h - ring.height * scale) / 2;
  const pt = n => ({ x: ox + n.x * scale, y: oy + n.y * scale });

  ctx.save();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#748197'; ctx.lineWidth = opts.print ? 3 : 1.5;
  ctx.strokeRect(ox, oy, ring.width * scale, ring.height * scale);

  // Measurement grid:
  // - light line every 5 ft
  // - stronger line every 10 ft
  // - 10 ft perimeter labels so the judge can place stations without guessing scale
  for (let gx = 5; gx < ring.width; gx += 5) {
    const major = gx % 10 === 0;
    ctx.strokeStyle = major ? '#c4ccd8' : '#e9edf3';
    ctx.lineWidth = major ? (opts.print ? 4 : 1.8) : (opts.print ? 2 : 1);
    ctx.beginPath();
    ctx.moveTo(ox + gx * scale, oy);
    ctx.lineTo(ox + gx * scale, oy + ring.height * scale);
    ctx.stroke();
  }
  for (let gy = 5; gy < ring.height; gy += 5) {
    const major = gy % 10 === 0;
    ctx.strokeStyle = major ? '#c4ccd8' : '#e9edf3';
    ctx.lineWidth = major ? (opts.print ? 4 : 1.8) : (opts.print ? 2 : 1);
    ctx.beginPath();
    ctx.moveTo(ox, oy + gy * scale);
    ctx.lineTo(ox + ring.width * scale, oy + gy * scale);
    ctx.stroke();
  }

  // 10-foot perimeter labels.
  ctx.fillStyle = '#5f6b7f';
  ctx.font = `${opts.print ? 'bold 24' : '10'}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  for (let gx = 0; gx <= ring.width; gx += 10) {
    ctx.fillText(`${gx}'`, ox + gx * scale, oy - (opts.print ? 14 : 5));
  }
  // Always label the actual far edge too when width is not divisible by 10.
  if (ring.width % 10 !== 0) {
    ctx.fillText(`${ring.width}'`, ox + ring.width * scale, oy - (opts.print ? 14 : 5));
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let gy = 0; gy <= ring.height; gy += 10) {
    ctx.fillText(`${gy}'`, ox - (opts.print ? 16 : 6), oy + gy * scale);
  }
  if (ring.height % 10 !== 0) {
    ctx.fillText(`${ring.height}'`, ox - (opts.print ? 16 : 6), oy + ring.height * scale);
  }

  // Small key on the course map.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#7b8799';
  ctx.font = `${opts.print ? '20' : '9'}px Arial`;
  ctx.fillText('Grid: 5 ft · Major lines/labels: 10 ft', ox, oy + ring.height * scale + (opts.print ? 38 : 18));

  // Venue no-go zones (pillars, tables, doors, judge areas, etc.).
  const venueZones=[...(course.noGoZones||[])];
  if(opts.previewNoGoZone) venueZones.push({...opts.previewNoGoZone,preview:true});
  for(const zone of venueZones){
    const zx=ox+zone.x*scale,zy=oy+zone.y*scale;
    const zw=zone.width*scale,zh=zone.height*scale;
    ctx.save();
    ctx.fillStyle=zone.preview?'rgba(186,55,55,.12)':'rgba(186,55,55,.16)';
    ctx.strokeStyle='#b53a3a';
    ctx.lineWidth=opts.print?4:2;
    ctx.setLineDash(opts.print?[14,9]:[6,4]);
    ctx.fillRect(zx,zy,zw,zh);
    ctx.strokeRect(zx,zy,zw,zh);
    ctx.setLineDash([]);
    ctx.fillStyle='#8d2929';
    ctx.font=`bold ${opts.print?20:9}px Arial`;
    ctx.textAlign='left';ctx.textBaseline='bottom';
    ctx.fillText(zone.label||'NO-GO',zx+(opts.print?8:4),zy-(opts.print?7:3));
    ctx.restore();
  }

  // Equipment working-footprint overlay.
  // This is drawn before the path so the route remains readable. The same
  // overlay appears in the exported PDF, making setup space visible to judges.
  course.nodes.forEach((node, nodeIndex) => {
    if (!isNumberedStationNode(node)) return;
    const sign = pack.signs[node.signId];
    const fp = equipmentFootprintFor(sign, course.nodes, nodeIndex);
    if (!fp) return;

    const corners = fp.corners.map(p => ({ x: ox + p.x * scale, y: oy + p.y * scale }));
    ctx.save();
    ctx.setLineDash(opts.print ? [14, 10] : [6, 4]);
    ctx.lineWidth = opts.print ? 4 : 1.5;
    ctx.strokeStyle = '#b67812';
    ctx.fillStyle = 'rgba(214, 154, 39, 0.10)';
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let k = 1; k < corners.length; k++) ctx.lineTo(corners[k].x, corners[k].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const labelAt = corners[0];
    ctx.setLineDash([]);
    ctx.fillStyle = '#855b11';
    ctx.font = `${opts.print ? 'bold 18' : '9'}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `${node.signId} footprint ${fp.length.toFixed(0)}'×${fp.width.toFixed(0)}'`,
      labelAt.x,
      labelAt.y - (opts.print ? 6 : 3)
    );
    ctx.restore();
  });

  // Path line + arrows.
  ctx.strokeStyle = '#245b9b'; ctx.fillStyle = '#245b9b'; ctx.lineWidth = opts.print ? 8 : 3;
  for (let i = 0; i < course.nodes.length - 1; i++) {
    const a = pt(course.nodes[i]), b = pt(course.nodes[i+1]);
    const dx = b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
    const ux=dx/len, uy=dy/len;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, s=opts.print?22:9;
    ctx.beginPath();
    ctx.moveTo(mx+ux*s,my+uy*s);
    ctx.lineTo(mx-ux*s*.55-uy*s*.55,my-uy*s*.55+ux*s*.55);
    ctx.lineTo(mx-ux*s*.55+uy*s*.55,my-uy*s*.55-ux*s*.55);
    ctx.closePath(); ctx.fill();

    if(opts.setupMode){
      const feet=Math.hypot(course.nodes[i+1].x-course.nodes[i].x,course.nodes[i+1].y-course.nodes[i].y);
      const label=`${feet.toFixed(1)} ft`;
      const lx=mx-uy*(opts.print?26:11),ly=my+ux*(opts.print?26:11);
      ctx.save();
      ctx.font=`bold ${opts.print?22:10}px Arial`;
      const tw=ctx.measureText(label).width;
      ctx.fillStyle='rgba(255,255,255,.92)';
      ctx.fillRect(lx-tw/2-(opts.print?8:4),ly-(opts.print?20:10),tw+(opts.print?16:8),opts.print?32:16);
      ctx.fillStyle='#174b82';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(label,lx,ly-(opts.print?4:2));
      ctx.restore();
    }
  }


  // Joined exercises: show the pair explicitly on the map. C-WAGS requires the
  // judge to indicate joined exercises on the course map.
  for (let i = 1; i < course.nodes.length; i++) {
    const node = course.nodes[i];
    if (!isNumberedStationNode(node) || !node.joinedToPrevious) continue;
    const prev = course.nodes[i - 1];
    if (!isNumberedStationNode(prev)) continue;

    const a = pt(prev), b = pt(node);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;

    ctx.save();
    ctx.strokeStyle = '#d99a16';
    ctx.fillStyle = '#9b6510';
    ctx.lineWidth = opts.print ? 8 : 3;
    ctx.setLineDash(opts.print ? [18, 10] : [7, 4]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = `bold ${opts.print ? 18 : 9}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('JOINED', mx, my - (opts.print ? 8 : 4));
    ctx.restore();
  }

  const displayLayout = buildStationDisplayLayout(course, pt, { x, y, w, h }, opts);

  // Leader lines show the true station location whenever its number/sign block
  // has been offset for readability. The course geometry itself never moves.
  for (const [i, display] of displayLayout.entries()) {
    const moved = Math.hypot(display.dx, display.dy);
    if (moved <= (opts.print ? 5 : 2)) continue;

    ctx.save();
    ctx.strokeStyle = '#7f8da2';
    ctx.fillStyle = '#7f8da2';
    ctx.lineWidth = opts.print ? 3 : 1.2;
    ctx.setLineDash(opts.print ? [10, 7] : [4, 3]);
    ctx.beginPath();
    ctx.moveTo(display.anchor.x, display.anchor.y);
    ctx.lineTo(display.center.x, display.center.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const anchorR = opts.print ? 7 : 3;
    ctx.beginPath();
    ctx.arc(display.anchor.x, display.anchor.y, anchorR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  let ordinal = 0;
  course.nodes.forEach((node, i) => {
    const p = pt(node);
    if (node.kind === 'start' || node.kind === 'finish') {
      const r = opts.print ? 30 : 13;
      ctx.fillStyle = '#d99a16'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font = `bold ${opts.print?28:12}px Arial`; ctx.fillText(node.kind==='start'?'S':'F',p.x,p.y);
      return;
    }

    // Venue detours and future route-control nodes shape the walking line only.
    // They are not rally exercises, must never receive a station number/sign,
    // and must not shift the numbering of the real stations.
    if (!isNumberedStationNode(node)) {
      if (opts.setupMode && node.kind === 'waypoint') {
        ctx.save();
        ctx.fillStyle='#fff';
        ctx.strokeStyle='#245b9b';
        ctx.lineWidth=opts.print?4:1.5;
        ctx.beginPath();
        ctx.arc(p.x,p.y,opts.print?9:4,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    ordinal++;
    const display = displayLayout.get(i);
    const center = display?.center || p;
    const r = opts.print ? 28 : 12;
    const highlighted = !opts.print && opts.highlightStationIds?.has?.(node.stationId);
    const selected = !opts.print && opts.selectedStationId === node.stationId;

    if (highlighted) {
      ctx.strokeStyle='#cf3232';ctx.lineWidth=4;ctx.beginPath();ctx.arc(center.x,center.y,r+5,0,Math.PI*2);ctx.stroke();
    }
    if (selected) {
      ctx.strokeStyle='#d99a16';ctx.lineWidth=4;ctx.beginPath();ctx.arc(center.x,center.y,r+9,0,Math.PI*2);ctx.stroke();
    }

    const changeState=!opts.print ? opts.changeStatusByStationId?.get?.(node.stationId) : null;
    if(changeState && changeState!=='KEEP'){
      const color=changeState==='ADD'?'#2d7a45':changeState==='MOVE'?'#8d55a7':'#b26a16';
      ctx.save();
      ctx.strokeStyle=color;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(center.x,center.y,r+6,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#27344c';
    ctx.beginPath();
    ctx.arc(center.x,center.y,r,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font=`bold ${opts.print?25:11}px Arial`;
    ctx.fillText(String(ordinal),center.x,center.y);

    const sign = pack.signs[node.signId];
    const img = imageFor(pack,node.signId);
    const thumb = opts.print ? 90 : 40;
    const tx = display?.tx ?? (center.x+r+(opts.print?10:5));
    const ty = display?.ty ?? (center.y-thumb/2);

    if (img?.complete && img.naturalWidth) {
      ctx.fillStyle='#fff'; ctx.fillRect(tx,ty,thumb,thumb);
      ctx.drawImage(img,tx,ty,thumb,thumb);
      ctx.strokeStyle='#9aa5b7';ctx.lineWidth=opts.print?2:1;ctx.strokeRect(tx,ty,thumb,thumb);
    } else {
      ctx.fillStyle='#fff';ctx.fillRect(tx,ty,thumb,thumb);
      ctx.strokeStyle='#9aa5b7';ctx.strokeRect(tx,ty,thumb,thumb);
      ctx.fillStyle='#4e5a70';ctx.font=`bold ${opts.print?20:9}px Arial`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(node.signId,tx+thumb/2,ty+thumb/2);
    }

    if (!opts.print) {
      ctx.fillStyle='#526079';
      ctx.font='10px Arial';
      ctx.textAlign='left';
      ctx.textBaseline='alphabetic';
      const labelX = display?.bbox?.left ?? center.x+16;
      const labelY = (display?.bbox?.top ?? center.y-16) - 2;
      ctx.fillText(`${node.signId} · Δ${Math.round(requiredTurnAt(course.nodes,i))}°`,labelX,labelY);
    }
  });

  // Draw non-counted companion/auxiliary exercises separately from the
  // numbered route. CKC Excellent/Master are represented as real post-Finish
  // flow: Finish -> Stay -> minimum 15-ft leash retrieval lane.
  for (const aux of course.auxiliary || []) {
    if (aux.x == null || aux.y == null) continue;
    const p = pt(aux);
    const thumb = opts.print ? 100 : 44;
    const img = aux.signId ? imageFor(pack, aux.signId) : null;
    ctx.save();

    // Retrieval lane. This is a distance guide, not an obstacle footprint.
    if (aux.leashX != null && aux.leashY != null) {
      const leash = pt({x:aux.leashX,y:aux.leashY});
      const dx=leash.x-p.x,dy=leash.y-p.y,len=Math.hypot(dx,dy)||1;
      const ux=dx/len,uy=dy/len;
      ctx.strokeStyle='#7b5aa6';
      ctx.fillStyle='#7b5aa6';
      ctx.lineWidth=opts.print?5:2;
      ctx.setLineDash(opts.print?[16,10]:[7,5]);
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(leash.x,leash.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const arrow=opts.print?22:9;
      ctx.beginPath();
      ctx.moveTo(leash.x,leash.y);
      ctx.lineTo(leash.x-ux*arrow-uy*arrow*.55,leash.y-uy*arrow+ux*arrow*.55);
      ctx.lineTo(leash.x-ux*arrow+uy*arrow*.55,leash.y-uy*arrow-ux*arrow*.55);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(leash.x,leash.y,opts.print?12:5,0,Math.PI*2);
      ctx.fill();

      const mx=(p.x+leash.x)/2,my=(p.y+leash.y)/2;
      ctx.font=`bold ${opts.print?20:9}px Arial`;
      ctx.textAlign='center';
      ctx.textBaseline='bottom';
      ctx.fillText(`${aux.distanceFt||15} ft min to leash`,mx,my-(opts.print?10:5));

      ctx.font=`${opts.print?18:8}px Arial`;
      ctx.textBaseline='top';
      ctx.fillText('LEASH',leash.x,leash.y+(opts.print?14:6));
    }

    // Stay sign: subtle outline only so it cannot be mistaken for a square
    // equipment footprint.
    ctx.setLineDash(opts.print ? [12,8] : [5,4]);
    ctx.strokeStyle='#7b5aa6';
    ctx.lineWidth=opts.print?3:1.5;
    ctx.beginPath();
    ctx.arc(p.x,p.y,thumb/2+(opts.print?8:4),0,Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (img?.complete && img.naturalWidth) {
      ctx.fillStyle='#fff';ctx.fillRect(p.x-thumb/2,p.y-thumb/2,thumb,thumb);
      ctx.drawImage(img,p.x-thumb/2,p.y-thumb/2,thumb,thumb);
    } else {
      ctx.fillStyle='#f4effa';ctx.fillRect(p.x-thumb/2,p.y-thumb/2,thumb,thumb);
      ctx.fillStyle='#5f447f';ctx.font=`bold ${opts.print?22:10}px Arial`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(aux.signId||'AUX',p.x,p.y);
    }

    ctx.fillStyle='#5f447f';
    ctx.font=`bold ${opts.print?22:10}px Arial`;
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(aux.label||'Auxiliary',p.x,p.y+thumb/2+(opts.print?12:5));
    ctx.restore();
  }

  // Keep hit-testing aligned with any auto-offset station graphics.
  // PDF rendering must not overwrite the active screen layout.
  if (!opts.print) {
    lastScreenStationLayout = new Map();
    for (const [i, display] of displayLayout.entries()) {
      lastScreenStationLayout.set(i, {
        bbox: { ...display.bbox },
        center: { ...display.center }
      });
    }
  }
  ctx.restore();
}

export function drawCourse(canvas, course, pack, opts = {}) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawCourseToContext(ctx, course, pack, {x:0,y:0,w:canvas.width,h:canvas.height}, cache, opts);
}

export function canvasPointToRing(canvas, course, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) * canvas.width / rect.width;
  const py = (clientY - rect.top) * canvas.height / rect.height;
  const pad = 42;
  const scale = Math.min((canvas.width-pad*2)/course.ring.width,(canvas.height-pad*2)/course.ring.height);
  const ox=(canvas.width-course.ring.width*scale)/2, oy=(canvas.height-course.ring.height*scale)/2;
  return {
    x: Math.max(0, Math.min(course.ring.width, (px-ox)/scale)),
    y: Math.max(0, Math.min(course.ring.height, (py-oy)/scale))
  };
}

export function findNodeAt(canvas, course, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) * canvas.width / rect.width;
  const py = (clientY - rect.top) * canvas.height / rect.height;

  // First test the visible, possibly offset number/sign block.
  for (const [i, display] of lastScreenStationLayout.entries()) {
    const b = display.bbox;
    if (px >= b.left && px <= b.right && py >= b.top && py <= b.bottom) {
      return i;
    }
  }

  // Fall back to the true physical station anchor.
  const ringPt = canvasPointToRing(canvas,course,clientX,clientY);
  let best=-1,bestD=Infinity;
  course.nodes.forEach((n,i)=>{
    if(!isNumberedStationNode(n)) return;
    const d=Math.hypot(n.x-ringPt.x,n.y-ringPt.y);
    if(d<bestD){bestD=d;best=i;}
  });
  return bestD<=2.3?best:-1;
}
