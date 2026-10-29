const express=require('express');
function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1753-01-02'&&value<='9999-12-30'
  &&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
function medTransferReportFilters(input){
  if(!input||Object.keys(input).some(key=>!['date','wardCode'].includes(key))||!validDate(input.date)
    ||typeof input.wardCode!=='string'||!/^[A-Za-z0-9-]{1,20}$/.test(input.wardCode))return null;
  return {date:input.date,wardCode:input.wardCode};
}
function reportMedTransferRoutes(repository){
  const router=express.Router();
  router.get('/wards',async(req,res,next)=>{
    if(Object.keys(req.query).length)return res.status(400).json({message:'เงื่อนไขหอผู้ป่วยไม่ถูกต้อง'});
    try{res.json({wards:await repository.getMedTransferReportWards()});}catch(error){next(error);}
  });
  // POST produces only an in-memory report. It never confirms a transfer.
  router.post('/pdf',async(req,res,next)=>{
    const filters=medTransferReportFilters(req.body);
    if(!filters)return res.status(400).json({message:'กรุณาเลือกวันที่และหอผู้ป่วยให้ถูกต้อง'});
    try{
      const data=await repository.getMedTransferReport(filters);
      const {buffer,pageCount}=await require('../services/reportMedTransferPdf').createMedTransferReportPdf(data);
      res.type('pdf').set({'Content-Disposition':'attachment; filename="Medicine-Cart-Report.pdf"',
        'X-Report-Pages':String(pageCount),'X-Report-Rows':String(data.rows.length),
        'Access-Control-Expose-Headers':'X-Report-Pages, X-Report-Rows'}).send(buffer);
    }catch(error){next(error);}
  });return router;
}
module.exports={reportMedTransferRoutes,medTransferReportFilters};
