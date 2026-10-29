const query=require('./requisitionMssqlSource');
const {createRequisitionFixedStockReader}=require('../services/reportRequisitionFixedStock');
module.exports=createRequisitionFixedStockReader(query);
