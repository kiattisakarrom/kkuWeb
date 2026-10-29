const query=require('./requisitionMssqlSource');
const {createRequisitionDcReader}=require('../services/reportRequisitionDc');
module.exports=createRequisitionDcReader(query);
