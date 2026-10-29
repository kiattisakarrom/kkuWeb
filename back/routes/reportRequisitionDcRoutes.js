const express=require('express');
const {requisitionIpdFilters:requisitionDcFilters}=require('./reportRequisitionIpdRoutes');
function reportRequisitionDcRoutes(repository){
  const router=express.Router();
  router.post('/pdf',async(req,res,next)=>{
    const filters=requisitionDcFilters(req.body);
    if(!filters)return res.status(400).json({message:'กรุณาเลือกช่วงวันที่และประเภทใบเบิกให้ถูกต้อง'});
    try{
      const now=new Date(),data=await repository.getRequisitionDcReport(filters,now);
      // IPD and D/C share crpRequisitionNew.rpt, including blank report behavior.
      const {buffer,pageCount}=await require('../services/reportRequisitionIpdPdf').createRequisitionIpdPdf(data,now);
      res.type('pdf').set({'Content-Disposition':'attachment; filename="DC-Requisition-Report.pdf"',
        'X-Report-Pages':String(pageCount),'X-Report-Rows':String(data.rows.length),
        'Access-Control-Expose-Headers':'X-Report-Pages, X-Report-Rows'}).send(buffer);
    }catch(error){next(error);}
  });return router;
}
module.exports={reportRequisitionDcRoutes,requisitionDcFilters};
