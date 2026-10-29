const express=require('express');
const {ivModes}=require('../services/reportIvAdmixture');
function validDate(value) {
  return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1753-01-01'
    &&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
}
const validTime=(value)=>typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const keys=['mode','kind','from','to','startTime','endTime'];
function ivReportFilters(input,extra=[]) {
  if(Object.keys(input).some((key)=>![...keys,...extra].includes(key))
    ||typeof input.mode!=='string'||!Object.hasOwn(ivModes,input.mode)||!['iv','individual'].includes(input.kind)
    ||!validDate(input.from)||!validDate(input.to)||!validTime(input.startTime)||!validTime(input.endTime)) return null;
  const start=`${input.from} ${input.startTime}:00`,end=`${input.to} ${input.endTime}:00`;
  if(start>end) return null;
  return {...Object.fromEntries(keys.map((key)=>[key,input[key]])),start,end};
}
const validId=(value)=>typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value);
function validWard(input,filters) {
  return ivModes[filters.mode].total?input.wardCode===undefined:
    typeof input.wardCode==='string'&&/^[A-Za-z0-9-]{1,20}$/.test(input.wardCode);
}
function reportIvAdmixtureRoutes(repository) {
  const router=express.Router();
  router.get('/wards',async(req,res,next)=>{
    const filters=ivReportFilters(req.query);
    if(!filters||ivModes[filters.mode].total) return res.status(400).json({message:'เงื่อนไขรายงานหอผู้ป่วยไม่ถูกต้อง'});
    try{res.json({wards:await repository.getIvReportWards(filters),filters});}catch(error){next(error);}
  });
  router.get('/prescriptions',async(req,res,next)=>{
    const filters=ivReportFilters(req.query,['wardCode']);
    if(!filters||!validWard(req.query,filters)) return res.status(400).json({message:'กรุณาเลือกหอผู้ป่วยและช่วงเวลาให้ถูกต้อง'});
    try{res.json({items:await repository.getIvReportHeaders(filters,req.query.wardCode),filters});}catch(error){next(error);}
  });
  router.get('/items',async(req,res,next)=>{
    const filters=ivReportFilters(req.query,['wardCode','headerId']);
    if(!filters||ivModes[filters.mode].sent||!validWard(req.query,filters)||!validId(req.query.headerId)) return res.status(400).json({message:'รายการใบสั่งยาหรือหน้ารายงานไม่ถูกต้อง'});
    try{res.json(await repository.getIvReportItems(filters,req.query.wardCode,req.query.headerId));}catch(error){next(error);}
  });
  // Selection only. Reads saved data and generates a download, never confirms IVStatus.
  router.post('/pdf',async(req,res,next)=>{
    const input=req.body||{};
    const filters=ivReportFilters(input,['wardCode','ids']);
    if(!filters||!validWard(input,filters)||!Array.isArray(input.ids)||!input.ids.length||input.ids.length>200
      ||input.ids.some((id)=>!validId(id))||new Set(input.ids).size!==input.ids.length)
      return res.status(400).json({message:'กรุณาเลือกใบสั่งยาสำหรับ PDF ให้ถูกต้อง (ไม่เกิน 200 ใบ)'});
    try{
      const data=await repository.getIvReportPdfData(filters,input.wardCode,input.ids);
      if(!data.rows.length) return res.status(404).json({message:'ไม่พบข้อมูลสำหรับออกรายงาน'});
      const buffer=await require('../services/reportIvAdmixturePdf').createIvAdmixturePdf(data);
      res.type('pdf').set('Content-Disposition','attachment; filename="IV-Admixture.pdf"').send(buffer);
    }catch(error){next(error);}
  });
  router.use((error,_req,res,next)=>{
    if(['IV_REPORT_SELECTION_CHANGED','IV_REPORT_AMBIGUOUS_PATIENT'].includes(error.code))
      return res.status(409).json({message:'ข้อมูลใบสั่งยามีการเปลี่ยนแปลงหรือไม่ตรงกัน กรุณาค้นหาและเลือกใหม่'});
    next(error);
  });
  return router;
}
module.exports={reportIvAdmixtureRoutes,ivReportFilters};
