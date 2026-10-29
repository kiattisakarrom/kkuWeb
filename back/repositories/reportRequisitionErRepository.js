const queryMssql=require('./requisitionMssqlSource');
const queryOpd=require('./requisitionOpdSource');
const {createRequisitionErReader}=require('../services/reportRequisitionEr');
module.exports=createRequisitionErReader({
  queryMssql,
  opdEnabled:()=>process.env.REPORT_REQUISITION_ER_OPD_ENABLED==='true',
  queryOpd
});
