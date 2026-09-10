import { officialStationCount, stationCountLabel } from './pack.js';
function asciiBytes(s) {
  return new TextEncoder().encode(s);
}

function concatBytes(parts) {
  const size = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

function dataUrlToBytes(url) {
  const b64 = url.split(',')[1];
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function jpegToSinglePagePdf(jpegBytes, imageWidth, imageHeight) {
  const objects = [];
  objects[1] = asciiBytes('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects[2] = asciiBytes('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects[3] = asciiBytes('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');

  const imgHead = asciiBytes(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  const imgTail = asciiBytes('\nendstream\nendobj\n');
  objects[4] = concatBytes([imgHead, jpegBytes, imgTail]);

  const stream = 'q\n792 0 0 612 0 0 cm\n/Im0 Do\nQ\n';
  objects[5] = asciiBytes(`5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);

  const header = asciiBytes('%PDF-1.4\n%RCD3\n');
  const parts = [header];
  const offsets = [0];
  let offset = header.length;
  for (let i = 1; i <= 5; i++) {
    offsets[i] = offset;
    parts.push(objects[i]);
    offset += objects[i].length;
  }

  const xrefOffset = offset;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  parts.push(asciiBytes(xref));
  return concatBytes(parts);
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = text.split(/\s+/);
  let line = '', lines = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line); line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

export async function exportCoursePdf({ course, pack, drawCourseToContext, imageCache, setupMode = false }) {
  const W = 3300, H = 2550; // Letter landscape at 300 dpi
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#172033';
  ctx.font = 'bold 64px Arial';
  ctx.fillText(`${pack.name} — ${pack.levels[course.levelId].name}${setupMode?' — PHYSICAL SETUP':''}`, 120, 105);
  ctx.font = '32px Arial';
  ctx.fillStyle = '#596579';
  const level=pack.levels[course.levelId];
  ctx.fillText(`Rules ${pack.version} · Ring ${course.ring.width} × ${course.ring.height} ft · ${officialStationCount(course,level)} ${stationCountLabel(level)}`, 120, 155);

  // Course map, left 72% of page.
  const mapBox = { x: 90, y: 210, w: 2240, h: 2200 };
  drawCourseToContext(ctx, course, pack, mapBox, imageCache, { print: true, setupMode });

  // Station list, right side.
  const sx = 2400, sw = 790;
  ctx.strokeStyle = '#cbd2dd'; ctx.lineWidth = 3;
  ctx.strokeRect(sx, 210, sw, 2200);
  ctx.fillStyle = '#172033'; ctx.font = 'bold 34px Arial';
  ctx.fillText('STATION LIST', sx + 35, 275);

  const stations = course.nodes.filter(n => n.kind === 'station');
  const rowH = Math.min(setupMode?94:88, 1970 / Math.max(1, stations.length));
  ctx.font = '26px Arial';
  stations.forEach((node, i) => {
    const y = 325 + i * rowH;
    ctx.strokeStyle = '#edf0f4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx + 25, y + rowH - 8); ctx.lineTo(sx + sw - 25, y + rowH - 8); ctx.stroke();
    ctx.fillStyle = '#172033'; ctx.font = 'bold 27px Arial';
    ctx.fillText(String(i + 1), sx + 35, y + 35);
    ctx.fillStyle = '#5e6a7e'; ctx.font = '23px Arial';
    ctx.fillText(node.signId, sx + 90, y + 35);
    ctx.fillStyle = '#172033'; ctx.font = setupMode?'22px Arial':'25px Arial';
    drawWrapped(ctx, pack.signs[node.signId]?.name || node.signId, sx + 190, y + 32, 560, 25, setupMode?1:2);

    if(setupMode){
      let nodeIndex=course.nodes.indexOf(node),prevIndex=nodeIndex-1;
      while(prevIndex>=0 && !['start','station'].includes(course.nodes[prevIndex]?.kind)) prevIndex--;
      let feet=0;
      if(prevIndex>=0){
        for(let k=prevIndex+1;k<=nodeIndex;k++){
          const a=course.nodes[k-1],b=course.nodes[k];
          feet+=Math.hypot(b.x-a.x,b.y-a.y);
        }
      }
      const from=i===0?'Start':`#${i}`;
      ctx.fillStyle='#5e6a7e';ctx.font='18px Arial';
      ctx.fillText(`${feet.toFixed(1)} ft from ${from} · x ${node.x.toFixed(1)} · y ${node.y.toFixed(1)}`,sx+190,y+58);
    }
  });

  const aux = course.auxiliary || [];
  if (aux.length) {
    const ay = 2320;
    ctx.fillStyle='#5f447f';ctx.font='bold 24px Arial';
    ctx.fillText(`Auxiliary / non-counted: ${aux.map(a=>`${a.signId} ${a.label||''}`).join(' · ')}`, sx + 35, ay);
  }

  ctx.fillStyle = '#7b8799'; ctx.font = '22px Arial';
  ctx.fillText(`Course ID: ${course.courseId}`, 120, 2490);

  let dataUrl;
  try {
    dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  } catch (err) {
    throw new Error('PDF export could not read the print canvas. This usually means a sign image was loaded without CORS permission.');
  }

  const jpg = dataUrlToBytes(dataUrl);
  const pdf = jpegToSinglePagePdf(jpg, W, H);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${course.organizationId}-${course.levelId}-${setupMode?'setup':'course'}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

export async function exportCourseSetupPdf(args) {
  return exportCoursePdf({ ...args, setupMode:true });
}
