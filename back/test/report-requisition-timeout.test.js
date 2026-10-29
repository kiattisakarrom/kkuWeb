const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const jwt=require('jsonwebtoken');
const {createApp}=require('../app');
const {createRequisitionMssqlSource,REQUISITION_QUERY_TIMEOUT_MS}=require('../repositories/requisitionMssqlSource');
const {requisitionIpdFilters}=require('../routes/reportRequisitionIpdRoutes');

test('long requisition reads use a lazy separate bounded pool and driver-supported timeout, retaining bound SQL types',async()=>{
  const configs=[],calls=[],result={recordset:[{orderqty:123}]};
  let closes=0,fail=false;
  const driver={Int:'Int',VarChar:size=>`VarChar(${size})`,ConnectionPool:class{
    constructor(config){configs.push(config);}
    on(){}
    async connect(){return this;}
    async close(){closes++;}
    request(){
      const call={inputs:[]};calls.push(call);
      return {
        set timeout(_value){throw Error('node-mssql 10 ignores request.timeout');},
        input:(...args)=>call.inputs.push(args),
        query:async(text)=>{call.text=text;if(fail)throw Object.assign(Error('slow read'),{code:'ETIMEOUT'});return result;}
      };
    }
  }};
  const interactiveConfig={server:'example',requestTimeout:15000,options:{encrypt:true},pool:{max:10}};
  const original=structuredClone(interactiveConfig),query=createRequisitionMssqlSource(driver,interactiveConfig);
  assert.equal(configs.length,0);
  const params={start:'2026-09-01 08:00:00',end:'2026-10-01 07:59:00',sendStore:1,sendF3F4:null};
  assert.equal(await query('SELECT @start,@end,@sendStore,@sendF3F4',params),result);
  assert.equal(configs[0].requestTimeout,120000);assert.equal(REQUISITION_QUERY_TIMEOUT_MS,120000);
  assert.equal(configs[0].pool.max,3);assert.equal(configs[0].pool.acquireTimeoutMillis,15000);
  assert.deepEqual(interactiveConfig,original);
  assert.deepEqual(calls[0].inputs,[['start','VarChar(32)',params.start],['end','VarChar(32)',params.end],['sendStore','Int',1],['sendF3F4','Int',null]]);
  fail=true;await assert.rejects(query('SELECT 1',{}),{code:'ETIMEOUT'});
  assert.equal(configs.length,1);await query.close();assert.equal(closes,1);
});

test('month and multi-month filters remain accepted without truncation; all aggregate queries replan for the selected dates',()=>{
  for(const [from,to] of [['2026-09-01','2026-09-30'],['2026-07-01','2026-09-30']])
    assert.deepEqual(requisitionIpdFilters({from,to,kind:'floor4'}),{from,to,kind:'floor4'});
  for(const scope of ['Ipd','Dc','Iv','FixedStock','IvRad','Er']){
    const {rowsSql}=require(`../services/reportRequisition${scope}`);
    assert.match(rowsSql,/ORDER BY pt.orderitemname ASC OPTION \(RECOMPILE\);/);
    assert.doesNotMatch(rowsSql,/\bTOP\b|NOLOCK|READ UNCOMMITTED|DATEADD|INSERT|UPDATE|DELETE/i);
  }
});

test('every requisition API distinguishes an expired aggregate from an unavailable database without leaking SQL',async(t)=>{
  const scopes={ipd:'Ipd',dc:'Dc',iv:'Iv','fixed-stock':'FixedStock',ivrad:'IvRad',er:'Er',opdrad:'OpdRad'};
  let code='ETIMEOUT',reads=0;
  const repository=Object.fromEntries(Object.values(scopes).map(name=>[`getRequisition${name}Report`,async()=>{
    reads++;throw Object.assign(Error('private SQL detail'),{code});
  }]));
  const server=createApp({repository,jwtSecret:'timeout-test'}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'timeout-test');
  const send=(scope,auth=true)=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-${scope}/${scope.startsWith('er')||scope==='opdrad'?'preview':'pdf'}`,{
    method:'POST',headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},
    body:JSON.stringify({from:'2026-09-01',to:'2026-09-30',kind:'floor4'})
  });
  assert.equal((await send('ipd',false)).status,401);assert.equal(reads,0);
  for(const scope of Object.keys(scopes)){
    const response=await send(scope);assert.equal(response.status,504,scope);
    const body=await response.json();assert.match(body.message,/รวมข้อมูลใบเบิก.*เกินกำหนด/);assert.doesNotMatch(JSON.stringify(body),/private SQL/);
  }
  code='ESOCKET';const unavailable=await send('ipd');assert.equal(unavailable.status,503);
  assert.match((await unavailable.json()).message,/เชื่อมต่อข้อมูลไม่ได้/);
});

test('browser and both proxy layers outlast the MSSQL plus optional OPD report reads',()=>{
  const read=relative=>fs.readFileSync(path.join(__dirname,'../..',relative),'utf8');
  const page=read('front/src/components/reports/RequisitionIpdReport.jsx');
  const browserMs=Number(page.match(/timeout:\s*(\d+)/)[1]);
  const mysqlMs=Number(read('back/repositories/requisitionOpdSource.js').match(/execute\(\{sql:text,timeout:(\d+)/)[1]);
  assert.ok(browserMs>REQUISITION_QUERY_TIMEOUT_MS+mysqlMs+15000);
  for(const filename of ['front/nginx.conf','nginx/nginx.conf']){
    const text=read(filename),report=text.match(/location \^~ \/api\/reports\/requisition- \{([\s\S]*?)\}/)[1];
    assert.ok(Number(report.match(/proxy_read_timeout (\d+)s/)[1])*1000>=browserMs);
    assert.match(text,/proxy_read_timeout 60s/); // Interactive endpoints retain their original budget.
  }
});
