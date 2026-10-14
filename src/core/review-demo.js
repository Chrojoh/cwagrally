// Deliberately short animation demo, not a legal trial course.
export function makeReviewDemo() {
  return {schemaVersion:3,organizationId:'cwags',levelId:'S',ring:{width:60,height:50},noGoZones:[],name:'3D movement demonstration',nodes:[
    {kind:'start',x:10,y:43},
    {kind:'station',stationId:'demo-halt',signId:'S30',x:10,y:32},
    {kind:'station',stationId:'demo-pivot',signId:'S5',x:10,y:20},
    {kind:'station',stationId:'demo-zig',signId:'S22',x:25,y:20},
    {kind:'station',stationId:'demo-270',signId:'S3',x:43,y:20},
    {kind:'station',stationId:'demo-circle',signId:'S24',x:43,y:8},
    {kind:'finish',x:43,y:3}
  ]};
}
