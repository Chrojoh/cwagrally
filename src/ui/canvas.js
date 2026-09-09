import { equipmentFootprintFor, requiredTurnAt } from '../core/geometry.js';

const cache = new Map();

export function getImageCache() { return cache; }

export function loadSignImage(pack, signId, redraw) {
  const key = `${pack.id}:${pack.version}:${signId}`;
  if (cache.has(key)) return cache.get(key);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => redraw?.();
  img.onerror = () => { cache.set(key, null); redraw?.(); };
  img.src = `${pack.assetBase}${signId}.png`;
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

  // Equipment working-footprint overlay.
  // This is drawn before the path so the route remains readable. The same
  // overlay appears in the exported PDF, making setup space visible to judges.
  course.nodes.forEach((node, nodeIndex) => {
    if (node.kind !== 'station') return;
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

    ordinal++;
    const r = opts.print ? 28 : 12;
    ctx.fillStyle = '#27344c'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`bold ${opts.print?25:11}px Arial`; ctx.fillText(String(ordinal),p.x,p.y);

    const sign = pack.signs[node.signId];
    const img = imageFor(pack,node.signId);
    const thumb = opts.print ? 90 : 40;
    const tx=p.x+r+(opts.print?10:5), ty=p.y-thumb/2;
    if (img?.complete && img.naturalWidth) {
      ctx.fillStyle='#fff'; ctx.fillRect(tx,ty,thumb,thumb);
      ctx.drawImage(img,tx,ty,thumb,thumb);
      ctx.strokeStyle='#9aa5b7';ctx.lineWidth=opts.print?2:1;ctx.strokeRect(tx,ty,thumb,thumb);
    } else {
      ctx.fillStyle='#fff';ctx.fillRect(tx,ty,thumb,thumb);
      ctx.strokeStyle='#9aa5b7';ctx.strokeRect(tx,ty,thumb,thumb);
      ctx.fillStyle='#4e5a70';ctx.font=`bold ${opts.print?20:9}px Arial`;
      ctx.textAlign='center';ctx.fillText(node.signId,tx+thumb/2,ty+thumb/2);
    }

    if (!opts.print) {
      ctx.fillStyle='#526079';ctx.font='10px Arial';ctx.textAlign='left';ctx.textBaseline='alphabetic';
      ctx.fillText(`${node.signId} · Δ${Math.round(requiredTurnAt(course.nodes,i))}°`,p.x+16,p.y-16);
    }
  });

  ctx.restore();
}

export function drawCourse(canvas, course, pack) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawCourseToContext(ctx, course, pack, {x:0,y:0,w:canvas.width,h:canvas.height}, cache, {});
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
  const ringPt = canvasPointToRing(canvas,course,clientX,clientY);
  let best=-1,bestD=Infinity;
  course.nodes.forEach((n,i)=>{
    const d=Math.hypot(n.x-ringPt.x,n.y-ringPt.y);
    if(d<bestD){bestD=d;best=i;}
  });
  return bestD<=2.3?best:-1;
}
