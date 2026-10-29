// Read-only diagnostic. Counts/timings/digests only: never print stored drug data.
const {performance}=require('node:perf_hooks');
const {createHash}=require('node:crypto');
const sql=require('../back/node_modules/mssql');
const config=require('../back/config/dbConfig');
const {requisitionWindow,requisitionKinds,assembleRequisitionRows}=require('../back/services/reportRequisitionIpd');
const modules={ipd:'Ipd',dc:'Dc',iv:'Iv','fixed-stock':'FixedStock',ivrad:'IvRad',er:'Er'};
const scope=process.argv[2]||'ipd',from=process.argv[3]||'2026-09-01',to=process.argv[4]||'2026-09-30';
const timeout=Number(process.argv[5]||120000),mode=process.argv[6]||'current';
// Installed node-mssql 10 reads the timeout from the pool, not request.timeout.
const pool=new sql.ConnectionPool({...config,requestTimeout:timeout,pool:{max:1,min:0}});
if(!Object.hasOwn(modules,scope))throw Error('Invalid scope');
const {rowsSql}=require(`../back/services/reportRequisition${modules[scope]}`);
const filters={from,to,kind:'floor4'},now=new Date();
(async()=>{
  await pool.connect();
  const request=pool.request();
  const params={...requisitionWindow(from,to,now),...(scope==='er'?{}:requisitionKinds.floor4)};
  delete params.label;
  for(const [key,value] of Object.entries(params))request.input(key,key.startsWith('send')?sql.Int:sql.VarChar(32),value);
  const started=performance.now();
  try{
    const baseline=rowsSql.replace(/\s+OPTION\s*\(RECOMPILE\)/i,'');
    const statement=mode==='baseline'?baseline:baseline.replace(/;\s*$/,' OPTION (RECOMPILE);');
    const {recordset}=await request.query(statement),queryMs=Math.round(performance.now()-started);
    const digest=createHash('sha256').update(JSON.stringify(recordset.map(row=>JSON.stringify(row)).sort())).digest('hex');
    const pdfStart=performance.now();
    const {buffer,pageCount}=await require('../back/services/reportRequisitionIpdPdf').createRequisitionIpdPdf({rows:assembleRequisitionRows(recordset,now),filters},now);
    console.log(JSON.stringify({scope,from,to,mode,timeout,rows:recordset.length,queryMs,pdfMs:Math.round(performance.now()-pdfStart),pages:pageCount,bytes:buffer.length,digest}));
  }catch(error){console.log(JSON.stringify({scope,from,to,mode,timeout,elapsedMs:Math.round(performance.now()-started),code:error.code,message:error.message}));process.exitCode=1;}
})().catch(error=>{console.error(error.code||error.name);process.exitCode=1;}).finally(()=>pool.close());
