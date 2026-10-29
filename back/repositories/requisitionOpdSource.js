const mysql=require('mysql2/promise');
let opdPool;
// Lazy shared OPD reader: importing this module never opens a connection.
module.exports=async function queryRequisitionOpd(text,params){
  const keys=['SERVER_HOSPITALKKH','USER_HOSPITALKKH','PASSWORD_HOSPITALKKH','DATABASE_HOSPITALKKH'];
  if(keys.some(key=>!process.env[key]))throw Error('OPD connection is not configured');
  opdPool ||= mysql.createPool({host:process.env.SERVER_HOSPITALKKH,user:process.env.USER_HOSPITALKKH,
    password:process.env.PASSWORD_HOSPITALKKH,database:process.env.DATABASE_HOSPITALKKH,
    port:3306,connectTimeout:8000,connectionLimit:3,waitForConnections:false,dateStrings:true,decimalNumbers:true});
  // Report aggregates can cover a month; keep the connection timeout short.
  const [rows]=await opdPool.execute({sql:text,timeout:120000},params);return rows;
};
