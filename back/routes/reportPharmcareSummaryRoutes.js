const express=require('express');
const {columns,sortSummaryRows}=require('../services/reportPharmcareSummary');
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1753-01-01'&&value<='9999-12-31'
  &&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
function pharmcareSummaryFilters(input,exporting=false){
  const extra=exporting?['snapshot','sortKey','sortDirection']:[];
  if(!input||Object.keys(input).some(key=>!['from','to','type',...extra].includes(key))
    ||!validDate(input.from)||!validDate(input.to)||input.from>input.to||!['IPD','OPD'].includes(input.type))return null;
  if(exporting&&(typeof input.snapshot!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(input.snapshot)
    ||(input.sortKey!==undefined||input.sortDirection!==undefined)&&(!columns.some(([key])=>key===input.sortKey)||!['asc','desc'].includes(input.sortDirection))))return null;
  return {from:input.from,to:input.to,type:input.type};
}
function reportPharmcareSummaryRoutes(repository){
  const router=express.Router();
  router.get('/rows',async(req,res,next)=>{
    const filters=pharmcareSummaryFilters(req.query);
    if(!filters)return res.status(400).json({message:'กรุณาเลือกช่วงวันที่และ IPD/OPD ให้ถูกต้อง'});
    try{res.json({...await repository.getPharmcareSummary(filters),filters});}catch(error){next(error);}
  });
  for(const format of ['pdf','xlsx'])router.post(`/${format}`,async(req,res,next)=>{
    const filters=pharmcareSummaryFilters(req.body,true);
    if(!filters)return res.status(400).json({message:'เงื่อนไขการ Export ไม่ถูกต้อง กรุณาค้นหาใหม่'});
    try{
      const data=await repository.getPharmcareSummary(filters);
      if(data.snapshot!==req.body.snapshot)return res.status(409).json({message:'ข้อมูลรายงานเปลี่ยนแปลง กรุณากด OK เพื่อค้นหาใหม่ก่อน Export'});
      if(!data.rows.length)return res.status(404).json({message:'ไม่พบข้อมูลสำหรับ Export'});
      const rows=sortSummaryRows(data.rows,req.body.sortKey,req.body.sortDirection);
      const buffer=format==='pdf'
        ? await require('../services/reportPharmcareSummaryPdf').createPharmcareSummaryPdf({rows,filters})
        : await require('../services/reportPharmcareSummaryExcel').createPharmcareSummaryExcel({rows});
      res.type(format==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .set('Content-Disposition',`attachment; filename="Pharmcare-Summary.${format}"`).send(buffer);
    }catch(error){next(error);}
  });return router;
}
module.exports={reportPharmcareSummaryRoutes,pharmcareSummaryFilters};
