const express=require('express');
const {requisitionIpdFilters:requisitionErFilters}=require('./reportRequisitionIpdRoutes');
function reportRequisitionErRoutes(repository){
  const router=express.Router();
  router.post('/preview',async(req,res,next)=>{
    const filters=requisitionErFilters(req.body);
    if(!filters)return res.status(400).json({message:'กรุณาเลือกช่วงวันที่และประเภทใบเบิกให้ถูกต้อง'});
    try{
      const now=new Date(),data=await repository.getRequisitionErReport(filters,now);
      if(data.noSourceRows)return res.json({pdf:null,pages:0,rows:0,missingDrugs:[],sourceWarning:data.sourceWarning,message:'ไม่พบข้อมูลใบสั่งยา'});
      const {createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
      const {createRequisitionMissingPdf}=require('../services/reportRequisitionMissingPdf');
      const report=await createRequisitionIpdPdf(data,now);
      const missing=data.missingDrugs.length?await createRequisitionMissingPdf(data,now):null;
      res.json({pdf:report.buffer.toString('base64'),pages:report.pageCount,rows:data.rows.length,
        missingDrugs:data.missingDrugs,missingPdf:missing?.toString('base64')||null,sourceWarning:data.sourceWarning});
    }catch(error){next(error);}
  });return router;
}
module.exports={reportRequisitionErRoutes,requisitionErFilters};
