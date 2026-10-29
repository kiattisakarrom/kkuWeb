// Isolated local browser QA: synthetic patients only, no database imports.
const path=require('node:path'),express=require('../back/node_modules/express');
const {createApp}=require('../back/app');
const rooms=[{code:'001',name:'ห้องยา IPD — ข้อมูลจำลอง'}];
const wards=[{code:'W1',name:'หอจำลอง ก',patientCount:1,prescriptionCount:1},{code:'W2',name:'หอจำลอง ข',patientCount:1,prescriptionCount:1}];
const patients=wards.map((ward,i)=>({an:`QA100${i+1}`,hn:`QA-HN${i+1}`,patientname:`ผู้ป่วยจำลอง ${i+1}`,wardcode:ward.code,warddesc:ward.name,admitteddate:'2026-10-23',SumPresc:1,sex:'1',patientdob:'2000-01-01',prescriptionCount:1,totalPrescriptionCount:1}));
const headers=patients.map((patient,i)=>({...patient,currentWardCode:patient.wardcode,wardname:patient.warddesc,prescriptionno:`QA-RX${i+1}`,orderDay:'2026-10-23',ordertype:'0',fromlocationname:rooms[0].name}));
const checkoutHeaders=headers.map((row,i)=>({...row,key:`qa-checkout-${i+1}`}));
const repository={
  getLoginOptions:async()=>({rooms}),findUser:async(id)=>id==='1'?{id:'1',password:'1',name:'ทดสอบข้อมูลจำลอง',positionName:'QA'}:null,
  getWards:async()=>wards,findWard:async(code)=>wards.find(ward=>ward.code===code),
  getPatients:async(context)=>patients.filter(patient=>patient.wardcode===context.wardCode),
  getScreeningRooms:async()=>rooms,findScreeningRoom:async(code)=>rooms.find(room=>room.code===code),
  getScreeningWards:async()=>wards,
  getScreeningPrescriptions:async(_context,_filters,wardCode)=>headers.filter(row=>!wardCode||row.wardcode===wardCode),
  getScreeningPrescription:async(_context,_filters,wardCode,rx)=>{const header=headers.find(row=>row.wardcode===wardCode&&row.prescriptionno===rx);return header?{header,items:[],displayItems:[]}:null;},
  getPatientSummary:async(context,an)=>patients.find(patient=>patient.an===an&&patient.wardcode===context.wardCode),
  getPatientMedications:async()=>({medications:[]}),
  getPatientLabs:async()=>[],getPatientAllergies:async()=>[],getPatientNotes:async()=>[],getPatientIhosDue:async()=>[],
  getPatientInteractions:async()=>[],getPatientOperatingRoomAlert:async()=>[],getPatientPharmacistNotes:async()=>[],
  getPrescriptionDates:async()=>[],getPatientPrescriptions:async()=>({prescriptions:[]}),
  getCheckoutWards:async()=>wards,
  getCheckoutPrescriptions:async(_filters,wardCode)=>checkoutHeaders.filter(row=>row.wardcode===wardCode),
  getCheckoutDetail:async(_filters,wardCode,rx,headerKey)=>{
    const header=checkoutHeaders.find(row=>row.wardcode===wardCode&&row.prescriptionno===rx&&row.key===headerKey);
    return header?{header,patient:patients.find(row=>row.an===header.an),items:[],times:[],packets:[],allergies:[],preparers:[],screener:null,images:{}}:null;
  },
};
const app=createApp({repository,jwtSecret:'local-interaction-qa-only'}),dist=path.resolve(__dirname,'../front/dist');
app.get('/qa/mobile',(req,res)=>{
  const views={ipd:'/ipd',screening:'/ipd/screening?mode=continue-wait',quick:'/ipd/quick-order',checkout:'/ipd/checkout'};
  const target=views[req.query.view]||views.ipd;
  res.type('html').send(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>ทดสอบหน้าจอ 390px — ข้อมูลจำลอง</title></head><body style="margin:0;background:#e5e7eb;display:flex;flex-direction:column;align-items:center;font-family:sans-serif"><p>ทดสอบขนาดหน้าจอ 390 × 600px — ข้อมูลจำลองเท่านั้น</p><nav><a href="?view=ipd">IPD</a> · <a href="?view=screening">Screening</a> · <a href="?view=quick">Quick Order</a></nav><iframe title="หน้าจอมือถือ 390px" src="${target}" style="width:390px;height:600px;border:1px solid #64748b;background:white"></iframe></body></html>`);
});
app.use(express.static(dist));app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
app.listen(3108,'127.0.0.1',()=>console.log('Synthetic interaction QA only: http://127.0.0.1:3108/ipd'));
