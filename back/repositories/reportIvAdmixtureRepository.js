const {sql,pool}=require('../models/db');
const {createIvReportReader}=require('../services/reportIvAdmixture');

module.exports=createIvReportReader(async(text,params)=>{
  await pool.connect();
  const request=pool.request();
  for(const [key,value] of Object.entries(params)) request.input(key,sql.VarChar(64),value);
  return request.query(text);
});
