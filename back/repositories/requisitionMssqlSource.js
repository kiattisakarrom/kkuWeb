const sql=require('mssql');
const config=require('../config/dbConfig');
const REQUISITION_QUERY_TIMEOUT_MS=120000;

function createRequisitionMssqlSource(driver,connectionConfig){
  let pool;
  const query=async(text,params)=>{
    // node-mssql 10 uses the POOL timeout; request.timeout has no effect.
    // Keep long report reads separate from the interactive patient/login pool.
    if(!pool){
      pool=new driver.ConnectionPool({...connectionConfig,requestTimeout:REQUISITION_QUERY_TIMEOUT_MS,
        pool:{max:3,min:0,idleTimeoutMillis:30000,acquireTimeoutMillis:15000}});
      pool.on('error',error=>console.error('Requisition SQL pool failed:',error.code||error.name));
    }
    await pool.connect();
    const request=pool.request();
    for(const [key,value] of Object.entries(params))request.input(key,key.startsWith('send')?driver.Int:driver.VarChar(32),value);
    return request.query(text);
  };
  query.close=async()=>{if(pool)await pool.close();};
  return query;
}
module.exports=createRequisitionMssqlSource(sql,config);
module.exports.createRequisitionMssqlSource=createRequisitionMssqlSource;
module.exports.REQUISITION_QUERY_TIMEOUT_MS=REQUISITION_QUERY_TIMEOUT_MS;
