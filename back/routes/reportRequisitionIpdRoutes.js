const express=require('express');
const {requisitionKinds}=require('../services/reportRequisitionIpd');
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1753-01-02'&&value<='9999-12-30'
  &&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
function requisitionIpdFilters(input){
  if(!input||Object.keys(input).some(key=>!['from','to','kind'].includes(key))||!validDate(input.from)||!validDate(input.to)||input.from>input.to
    ||typeof input.kind!=='string'||!Object.hasOwn(requisitionKinds,input.kind))return null;
  return {from:input.from,to:input.to,kind:input.kind};
}
function reportRequisitionIpdRoutes(repository){
  const router=express.Router();
  router.post('/pdf',async(req,res,next)=>{
    const filters=requisitionIpdFilters(req.body);
    if(!filters)return res.status(400).json({message:'กรุณาเลือกช่วงวันที่และประเภทใบเบิกให้ถูกต้อง'});
    try{
      const now=new Date(),data=await repository.getRequisitionIpdReport(filters,now);
      const {buffer,pageCount}=await require('../services/reportRequisitionIpdPdf').createRequisitionIpdPdf(data,now);
      res.type('pdf').set({'Content-Disposition':'attachment; filename="IPD-Requisition-Report.pdf"',
        'X-Report-Pages':String(pageCount),'X-Report-Rows':String(data.rows.length),
        'Access-Control-Expose-Headers':'X-Report-Pages, X-Report-Rows'}).send(buffer);
    }catch(error){next(error);}
  });return router;
}
module.exports={reportRequisitionIpdRoutes,requisitionIpdFilters};
