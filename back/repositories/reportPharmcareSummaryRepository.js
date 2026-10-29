const {sql,pool}=require('../models/db');
const {createPharmcareSummaryReader}=require('../services/reportPharmcareSummary');
module.exports=createPharmcareSummaryReader(async(text,params)=>{
  await pool.connect();const request=pool.request();
  for(const [key,value] of Object.entries(params))request.input(key,sql.VarChar(32),value);
  return request.query(text);
});
