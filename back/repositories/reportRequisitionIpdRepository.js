const query=require('./requisitionMssqlSource');
const {createRequisitionIpdReader}=require('../services/reportRequisitionIpd');
module.exports=createRequisitionIpdReader(query);
