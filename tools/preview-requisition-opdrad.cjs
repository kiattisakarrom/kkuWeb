// Local browser QA fixture only: synthetic data, no database modules or hardware.
const path=require('node:path'),express=require('../back/node_modules/express');
const {createApp}=require('../back/app');
const {assembleRequisitionOpdRadRows}=require('../back/services/reportRequisitionOpdRad');
const {sourceDisabled}=require('../back/services/reportRequisitionOpdRad');
const now=new Date('2026-10-23T02:00:00Z');
const repository={
  getLoginOptions:async()=>({rooms:[{code:'001',name:'ห้องยา IPD — ข้อมูลจำลอง'}]}),
  findUser:async(id)=>id==='1'?{id:'1',password:'1',name:'ทดสอบข้อมูลจำลอง',positionName:'QA'}:null,
  getRequisitionOpdRadReport:async(filters)=>{
    if(filters.kind==='narcotic')return {rows:[],missingDrugs:[],sourceReady:true,sourceWarning:'',message:'ไม่พบข้อมูล'};
    if(filters.kind==='hospital')return {rows:[],missingDrugs:[],sourceReady:false,sourceWarning:sourceDisabled};
    const master=Array.from({length:120},(_,i)=>({orderitemcode:`RAD${String(i+1).padStart(3,'0')}`,orderitemENname:`OPDRAD QA Medicine ${i+1} ยาจำลอง`,drugform:['Injection','Tablet','External'][i%3],orderunitcode:'TAB',Inventorycode:`INV${i+1}`,pack:10,sendStore:1,sendF3F4:1}));
    const raw=master.map((row,i)=>({orderitemcode:row.orderitemcode,orderqty:i+0.5}));
    const data=assembleRequisitionOpdRadRows(raw,master,[],filters.kind,now);
    return {...data,sourceReady:true,sourceWarning:'',missingDrugs:[{orderitemcode:'QA-MISSING-1',orderitemname:'ยาจำลองที่ไม่มีรหัส 1'},{orderitemcode:'QA-MISSING-2',orderitemname:'ยาจำลองที่ไม่มีรหัส 2'}]};
  }
};
const app=createApp({repository,jwtSecret:'local-opdrad-qa-only'}),dist=path.resolve(__dirname,'../front/dist');
app.use(express.static(dist));app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
app.listen(3107,'127.0.0.1',()=>console.log('Synthetic OPDRAD QA only: http://127.0.0.1:3107/ipd/reports/requisition-opdrad'));
