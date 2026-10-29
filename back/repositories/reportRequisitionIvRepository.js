const query=require('./requisitionMssqlSource');
const {createRequisitionIvReader}=require('../services/reportRequisitionIv');
module.exports=createRequisitionIvReader(query);
