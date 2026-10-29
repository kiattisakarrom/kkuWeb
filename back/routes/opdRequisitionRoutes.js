const express=require('express');
const {requisitionIpdFilters:requisitionOpdFilters}=require('./reportRequisitionIpdRoutes');
function opdRequisitionRoutes(repository,readMethod){
  const router=express.Router();
  router.post('/preview',async(req,res,next)=>{
    const filters=requisitionOpdFilters(req.body);
    if(!filters)return res.status(400).json({message:'กรุณาเลือกช่วงวันที่และประเภทใบเบิกให้ถูกต้อง'});
    try{
      const now=new Date(),data=await repository[readMethod](filters,now);
      if(!data.sourceReady)return res.json({pdf:null,pages:0,rows:0,missingDrugs:[],missingPdf:null,sourceReady:false,sourceWarning:data.sourceWarning});
      const {createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
      const {createRequisitionMissingPdf}=require('../services/reportRequisitionMissingPdf');
      const report=await createRequisitionIpdPdf(data,now);
      const missing=data.missingDrugs.length?await createRequisitionMissingPdf(data,now):null;
      res.json({pdf:report.buffer.toString('base64'),pages:report.pageCount,rows:data.rows.length,sourceReady:true,sourceWarning:'',
        message:data.message||'',missingDrugs:data.missingDrugs,missingPdf:missing?.toString('base64')||null});
    }catch(error){next(error);}
  });return router;
}
module.exports={requisitionOpdFilters,opdRequisitionRoutes};
