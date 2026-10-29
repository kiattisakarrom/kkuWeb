const queryMssql=require('./requisitionMssqlSource');
const queryOpd=require('./requisitionOpdSource');
const {createRequisitionOpdRadReader}=require('../services/reportRequisitionOpdRad');
module.exports=createRequisitionOpdRadReader({
  opdEnabled:()=>process.env.REPORT_REQUISITION_OPDRAD_ENABLED==='true',
  queryMssql,queryOpd
});
