export const cwagsSources={
 general:{label:'Rally guidelines (effective April 2021)',url:'https://c-wags.org/wp-content/uploads/2021/04/Rally-Rules-and-Guidelines-2021.pdf'},
 starter:{label:'Starter (April 2021)',url:'https://c-wags.org/wp-content/uploads/2021/04/Starter.2021-web.pdf'},
 advanced:{label:'Advanced (v3.13)',url:'https://c-wags.org/wp-content/uploads/2017/01/Advanced3.13.pdf'},
 pro:{label:'Pro (v11.12)',url:'https://c-wags.org/wp-content/uploads/2017/01/Pro_Rally_Class.pdf'},
 arf:{label:'ARF (v3.13)',url:'https://c-wags.org/wp-content/uploads/2017/01/ARF_Class3.13.pdf'},
 zoom:{label:'Zoom (April 2021)',url:'https://c-wags.org/wp-content/uploads/2021/04/Zoom-Rally-2021.pdf'}
};
// Source measurements describe equipment or dog/handler positions. They are
// deliberately separate from this app's chosen rectangular design envelopes.
const measurements={
 S13:'1 + 2 + 3 forward steps; no feet-per-step value.',
 S14:'Optional 2–3 backward steps.',S17:'1 + 2 + 3 backward steps; no feet-per-step value.',
 S21:'One forward-diagonal right step.',S22:'2–3 steps between turns.',S31:'2–3 steps between turns.',
 S25:'4 cones; approximately 6–8 ft apart.',S26:'Same 4-cone arrangement as S25.',
 S27:'3 cones; approximately 6–8 ft apart.',S28:'3 cones; approximately 6–8 ft apart.',S29:'2 cones; approximately 6–8 ft apart.',
 A9:'Handler 3 ft from upright jump in moving use.',A10:'Cones approximately 10–12 ft apart; middle bowls approximately 8 ft apart.',
 A11:'4 cones in diamond; approximately 8–10 ft spacing.',A15:'Approximately 5 ft from left dog to turn sign.',A17:'Approximately 8–10 ft from left dog.',
 A19:'Optional 2–3 backward steps.',A21:'2–3 steps between successive turns.',A22:'2–3 steps between successive turns.',
 P1:'1–2 forward steps after turn; 2 backward steps.',P2:'1–2 forward steps after turn; 2 backward steps.',PR4:'3 backward steps.',
 P5:'At least 2–3 running steps before recall; optional 2–3 backward steps.',
 P9:'Handler 6 ft from moving jump.',P10:'Outer bowls approximately 10–12 ft apart; middle pair approximately 8 ft.',P12:'One right step.',
 P14:'Recall at least 20 ft; drop at least 3 ft from handler.',P15:'Approximately 12 ft from left dog.',
 P16:'Dog ≥15 ft before jump, ~4–6 ft beside; handler ≥15 ft beyond, ~4–6 ft beside.',
 P17:'8–18 ft from left dog.',P18:'8–18 ft from left dog.',P21:'At least 2–3 running steps before call.',PR19:'One lateral right step.',PR20:'One lateral left step.',
 R1:'One left step; dog on right.',R5:'3 handler steps towards dog.',
 APR9:'At least 15 ft between jumps; handler offset up to 6 ft, as judge specifies.',
 R10:'Tunnel diameter ≥24 in; judge-chosen send distance 0–6 ft. Zoom 2: no distance.',
 R11:'Sign 6 ft from table; handler stays ≥6 ft until position achieved. Table height depends on jump class.',
 R18:'Sign 6 ft from box; handler stays ≥6 ft until position achieved. Inside ~48 in square; walls ~2–4 in.',
 R21:'Sign 6 ft from object; handler stays behind that line. Cone ≥15 in tall.',
 PR22:'Moving broad jump: no handler lateral distance stated.'
};
const pages={
 S1:1,S2:1,S3:2,S4:2,S5:2,S6:2,S7:2,S8:2,S9:3,S10:3,S11:3,S12:3,S13:3,S14:3,S15:4,S16:4,S17:4,S18:4,S19:4,S20:4,S21:4,S22:5,S23:5,S24:5,S25:5,S26:5,S27:5,S28:6,S29:6,S30:6,S31:6,S32:6,S33:6,S34:7,S35:7,
 A1:1,A2:1,A3:2,A4:2,A5:2,A6:2,A7:2,A8:2,A9:2,A10:3,A11:3,A12:3,A13:3,A14:3,A15:3,A16:3,A17:4,A18:4,A19:4,A20:4,A21:4,A22:4,A23:5,A24:5,
 P1:1,P2:1,PR3:1,PR4:2,P5:2,PR6:2,PR7:2,PR8:2,P9:2,P10:2,P11:3,P12:3,P13:3,P14:3,P15:3,P16:3,P17:3,P18:4,P21:4,PR19:4,PR20:4,PR22:4,
 R1:1,R2:1,R5:2,APR9:2,R10:2,R11:3,R12:3,R13:3,R14:3,R15:4,R16:4,R17:4,R18:4,R21:5
};
function sourceFor(id){return id.startsWith('S')?'starter':id.startsWith('APR')||id.startsWith('R')?'arf':id.startsWith('A')?'advanced':'pro';}
const fullTurns={S3:270,S4:-270,S7:180,S8:-180,S23:360,S24:-360,S34:225,S35:-225};
export function cwagsSpaceEntry(sign,pack){
 const id=sign.id,source=sourceFor(id),footprint=sign.space?.footprint;
 const turn=fullTurns[id]??sign.motion?.turnDelta??0;
 const path=['S34','S35'].includes(id)?'Ribbon: more than 180°, less than 270°; app uses 225°.':turn===0?'Net exit continues on original heading.':`${Math.abs(turn)}° ${turn<0?'left':'right'}${Math.abs(turn)>180?' (full movement; net exit differs)':''}.`;
 const issues=[];
 if(!footprint)issues.push('No swept working-area model.');
 if(['A15','A16','A18','A19','P14','P15','P16','P17','P18','R5'].includes(id))issues.push('Dog position / return path needs explicit geometry.');
 if(id==='P16')issues.push('Automatic generation disabled: jump placement and recall corridor not modeled.');
 if(id==='R16')issues.push('ARF single switch and Zoom 2 double-switch variant need separate definitions.');
 const sourceId=sourceFor(id);
 return {id,name:sign.name,levels:sign.levels||[],source:sourceId,page:pages[id]||null,
   measurement:measurements[id]||'No fixed distance in feet for this exercise in the reviewed description.',
   approach:Math.abs(sign.motion?.turnDelta||0)>0?'Direction-changing: general sign-in-front guidance applies.':'General sign-to-right guidance; equipment/sequence exceptions apply.',
   movement:path,
   designEnvelope:footprint?`${footprint.back+footprint.forward} × ${footprint.halfWidth*2} ft (app allowance, not an official minimum)`:'Not modeled; no numeric safe-area claim.',
   status:issues.length?'Review required':'Equipment allowance only; exact placement still needs checking',issues};
}
export function cwagsSpaceCatalog(pack){
 return [...Object.values(pack.signs).map(sign=>cwagsSpaceEntry(sign,pack)),
 {id:'R12',name:'Side Switch',source:'arf',page:3,measurement:'Unnumbered companion sign.',approach:'Requires eligible companion exercise.',movement:'Side-state changes.',designEnvelope:'Not modeled.',status:'Not implemented as a dedicated companion',issues:['Missing dedicated companion representation.'],levels:['ARF']},
 {id:'R17',name:'Freestyle Short',source:'arf',page:4,measurement:'4 chosen moves; no fixed rectangular dimensions.',approach:'Depends on declared moves.',movement:'Handler-defined.',designEnvelope:'Cannot assign a universal footprint.',status:'Not implemented',issues:['Requires a move-specific layout.'],levels:['ARF']}];
}
