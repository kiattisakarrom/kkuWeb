const query=require('./requisitionMssqlSource');
const {createRequisitionIvRadReader}=require('../services/reportRequisitionIvRad');
module.exports=createRequisitionIvRadReader(query);
