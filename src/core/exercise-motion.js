// Illustrative handler motion, sourced from C-WAGS Starter.2021-web.pdf.
// Distances/radii/timing are preview choices, not mandated performance dimensions.
const rad=degrees=>degrees*Math.PI/180;
const smooth=t=>t*t*(3-2*t);
export function exerciseScript(packId,signId) {
  if(packId!=='cwags')return null;
  const turn=degrees=>({type:'turn',degrees,duration:Math.max(1.5,Math.abs(degrees)/65)});
  const pivot=degrees=>({type:'pivot',degrees,duration:Math.abs(degrees)/60});
  const hold={type:'hold',duration:.9};
  const scripts={
    S1:[turn(90)],S2:[turn(-90)],S3:[turn(270)],S4:[turn(-270)],
    S5:[hold,pivot(90),hold],S6:[hold,pivot(90)],
    S7:[turn(180)],S8:[turn(-180)],
    S13:[hold,{type:'move',forward:1.5,duration:.7},hold,{type:'move',forward:3,duration:1.2},hold,{type:'move',forward:4.5,duration:1.7},hold],
    S17:[hold,{type:'move',forward:-1.5,duration:.7},hold,{type:'move',forward:-3,duration:1.2},hold,{type:'move',forward:-4.5,duration:1.7},hold],
    S18:[{type:'pace',pace:.55,duration:.3}],S19:[{type:'pace',pace:1.5,duration:.3}],S20:[{type:'pace',pace:1,duration:.3}],
    S21:[{type:'move',forward:1.5,right:1.5,duration:1}],
    S22:[pivot(90),{type:'move',forward:3.75,duration:1.5},pivot(-90)],
    S23:[turn(360)],S24:[turn(-360)],S30:[hold],
    S31:[pivot(-90),{type:'move',forward:3.75,duration:1.5},pivot(90)],
    S32:[turn(45)],S33:[turn(-45)]
  };
  const steps=scripts[signId];
  return steps?{steps,duration:steps.reduce((sum,s)=>sum+s.duration,0),pace:steps.find(s=>s.type==='pace')?.pace}:null;
}
export function sampleExercise(script,time) {
  let x=0,y=0,heading=0,remaining=Math.max(0,time);
  for(const step of script.steps){
    const t=smooth(Math.min(1,remaining/step.duration));
    const f={x:Math.cos(heading),y:Math.sin(heading)},r={x:-f.y,y:f.x};
    if(step.type==='turn'){
      const angle=rad(Math.abs(step.degrees))*t,dir=Math.sign(step.degrees),radius=1.5;
      const forward=radius*Math.sin(angle),right=dir*radius*(1-Math.cos(angle));
      x+=f.x*forward+r.x*right;y+=f.y*forward+r.y*right;heading+=dir*angle;
    }else if(step.type==='pivot')heading+=rad(step.degrees)*t;
    else if(step.type==='move'){
      x+=(f.x*(step.forward||0)+r.x*(step.right||0))*t;
      y+=(f.y*(step.forward||0)+r.y*(step.right||0))*t;
    }
    if(remaining<step.duration)break;
    remaining-=step.duration;
  }
  return {x,y,heading,done:time>=script.duration};
}
export function exerciseWorldPose(origin,local) {
  const c=Math.cos(origin.heading),s=Math.sin(origin.heading);
  return {x:origin.x+local.x*c-local.y*s,y:origin.y+local.x*s+local.y*c,heading:origin.heading+local.heading};
}
