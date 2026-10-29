const express = require('express');
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && value >= '1753-01-02' && value <= '9999-12-30' && !Number.isNaN(Date.parse(value))
  && new Date(value).toISOString().slice(0,10) === value;
function workloadReportFilters(input) {
  if (!input || Object.keys(input).some(key => !['from','to','userId'].includes(key))
    || !validDate(input.from) || !validDate(input.to) || input.from > input.to
    || typeof input.userId !== 'string' || !/^[A-Za-z0-9_-]{0,32}$/.test(input.userId)) return null;
  return { from: input.from, to: input.to, userId: input.userId };
}
function reportWorkloadRoutes(repository) {
  const router = express.Router();
  router.get('/users', async (req,res,next) => {
    if (Object.keys(req.query).length) return res.status(400).json({message:'เงื่อนไขผู้ใช้งานไม่ถูกต้อง'});
    try { res.json({users:await repository.getWorkloadReportUsers()}); } catch(error) {next(error);}
  });
  router.post('/pdf', async (req,res,next) => {
    const filters=workloadReportFilters(req.body);
    if (!filters) return res.status(400).json({message:'กรุณาเลือกช่วงวันที่และผู้ใช้งานให้ถูกต้อง'});
    try {
      const data=await repository.getWorkloadReport(filters);
      if (!data.rows.length) return res.status(404).json({message:'ไม่พบข้อมูล'});
      const {buffer,pageCount}=await require('../services/reportWorkloadPdf').createWorkloadReportPdf(data);
      res.type('pdf').set({'Content-Disposition':'attachment; filename="Workload-Report.pdf"',
        'X-Report-Pages':String(pageCount),'X-Report-Rows':String(data.rows.length),
        'Access-Control-Expose-Headers':'X-Report-Pages, X-Report-Rows'}).send(buffer);
    } catch(error) {next(error);}
  });
  return router;
}
module.exports={reportWorkloadRoutes,workloadReportFilters};
