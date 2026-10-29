const {sql,pool}=require('../models/db');
const {createMedTransferReportReader}=require('../services/reportMedTransfer');
module.exports=createMedTransferReportReader(async(text,params)=>{
  await pool.connect();const request=pool.request();
  for(const [key,value] of Object.entries(params))request.input(key,sql.VarChar(64),value);
  return request.query(text);
});
