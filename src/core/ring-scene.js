// Preview scenery only; this does not alter the course or its boundaries.
export function ringFence(ring,start={x:ring.width/2,y:0}) {
  const {width:w,height:h}=ring;
  const sides=[{a:[0,0],b:[w,0],distance:Math.abs(start.y),along:start.x},
    {a:[w,0],b:[w,h],distance:Math.abs(w-start.x),along:start.y},
    {a:[0,h],b:[w,h],distance:Math.abs(h-start.y),along:start.x},
    {a:[0,0],b:[0,h],distance:Math.abs(start.x),along:start.y}];
  const gate=sides.reduce((a,b)=>a.distance<=b.distance?a:b);
  const panels=[];
  for(const side of sides){
    const length=Math.hypot(side.b[0]-side.a[0],side.b[1]-side.a[1]);
    const center=Math.max(3,Math.min(length-3,side.along));
    const ranges=side===gate?[[0,center-2.5],[center+2.5,length]]:[[0,length]];
    for(const [from,to] of ranges){
      const count=Math.ceil((to-from)/6);
      for(let i=0;i<count;i++){
        const point=t=>[side.a[0]+(side.b[0]-side.a[0])*t/length,side.a[1]+(side.b[1]-side.a[1])*t/length];
        panels.push({a:point(from+(to-from)*i/count),b:point(from+(to-from)*(i+1)/count)});
      }
    }
  }
  return panels;
}
