const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {createApp}=require('../app');
const {workloadReportFilters}=require('../routes/reportWorkloadRoutes');
const {usersSql,careSql,workloadWindow,activitySql,mergeWorkloadRows,createWorkloadReportReader}=require('../services/reportWorkload');
const {workloadCrossTab,workloadColumnBands,createWorkloadReportPdf}=require('../services/reportWorkloadPdf');
const {PDFDocument}=require('pdf-lib');
const filters={from:'2026-10-01',to:'2026-10-21',userId:''};
const row=(user,care,count,name='ผู้ทดสอบ')=>({Usercreatecode:user,Fname:name,CAn:count,GroupOfCareCd:'',GroupOfCare:care});

test('Workload accepts real bounded date ranges and optional user; rejects client data, room overrides and SQL input',()=>{
  assert.deepEqual(workloadReportFilters(filters),filters);
  assert.ok(workloadReportFilters({...filters,userId:'0001'}));
  for(const input of [{...filters,from:'2026-02-30'},{...filters,from:'2026-10-22'},{...filters,to:'9999-12-31'},{...filters,userId:[]},{...filters,userId:"a' OR 1=1"},{...filters,roomCode:'010'},{...filters,rows:[]}])assert.equal(workloadReportFilters(input),null);
});
test('Workload uses native Bangkok 08:00 boundary for both dates and preserves midnight no-date-clause behavior',()=>{
  assert.deepEqual(workloadWindow(filters.from,filters.to,new Date('2026-10-21T01:00:00Z')),{start:'2026-10-01 08:00:00',end:'2026-10-22 07:59:59'});
  assert.deepEqual(workloadWindow(filters.from,filters.to,new Date('2026-10-21T00:59:00Z')),{start:'2026-09-30 08:00:00',end:'2026-10-21 07:59:59'});
  assert.equal(workloadWindow(filters.from,filters.to,new Date('2026-10-20T17:00:59Z')),null);
});
test('Workload preserves native current and BACKUP prescription/package sources, distinct prescription-user counts and activity rules',()=>{
  for(const backup of [false,true]){
    const sql=activitySql(backup);
    assert.equal((sql.match(/SELECT DISTINCT p.prescriptionno/g)||[]).length,4);
    assert.equal((sql.match(/p.genorderdatetime IS NOT NULL/g)||[]).length,4);
    assert.equal((sql.match(/p.fromlocationname=N'ห้องยา IPD\[001\]'/g)||[]).length,4);
    assert.equal((sql.match(/p.ordercreatedate BETWEEN/g)||[]).length,4);
    assert.match(sql,/pa\.checkoutuserid IS NOT NULL/);assert.doesNotMatch(sql,/checkoutdatetime/);
    assert.match(sql,/pa\.leddispensedatetime IS NOT NULL/);assert.match(sql,/pa\.haddispensedatetime IS NOT NULL/);
    assert.match(sql,/UNPIVOT.*Screening_WL,Checkout,LED,HAD/);
    assert.equal(sql.includes('[BACKUP].dbo.prescription'),backup);
    assert.equal(sql.includes('[BACKUP].dbo.packagemaster'),backup);
    assert.doesNotMatch(activitySql(backup,false),/ordercreatedate BETWEEN/);
  }
  assert.match(careSql,/COUNT\(DISTINCT dh.OrderNo\)/);assert.match(careSql,/dh\.TypeOfPt='IPD'/);
  assert.match(careSql,/dh\.\[DateD\/C\] BETWEEN CAST\(@from AS datetime\) AND CAST\(@to AS datetime\)/);
  assert.doesNotMatch(careSql,/BACKUP|ms_drpdetail|CAST\(dh\.\[DateD\/C\]/);
  assert.match(usersSql,/userID<>'0201'/);assert.doesNotMatch(usersSql,/password|username|photo|userbarcode/);
});
test('Workload merges sources by trimmed user and care label, adds overlaps and zero rows, keeps first name/code and separate care labels',()=>{
  const merged=mergeWorkloadRows([
    [{...row('001','Drug Reconciliation',3,' เภสัชกร A '),GroupOfCareCd:'01'},row('001','Checkout',2)],
    [row(' 001 ','Checkout',4),row('001','HAD',0),row('002','Checkout',1,'เภสัชกร A')],
    [row('001','checkout',5),row('001','Screening_WL',7)],
  ]);
  assert.equal(merged.length,5);assert.equal(merged[1].CAn,11);assert.equal(merged[0].Fname,'เภสัชกร A');assert.equal(merged[0].GroupOfCareCd,'01');
  assert.equal(merged[2].CAn,0);assert.equal(merged[3].Usercreatecode,'002');assert.equal(merged[0].SAn,0);
});
test('Workload reader sends all three source queries in one parameterized request and never drops BACKUP errors',async()=>{
  const calls=[];
  const reader=createWorkloadReportReader(async(sql,params)=>{calls.push({sql,params});return {recordsets:[[row('001','Care',2)],[row('001','Checkout',4)],[row('001','Checkout',3)]]};});
  const result=await reader.getWorkloadReport(filters,new Date('2026-10-21T01:00:00Z'));
  assert.equal(calls.length,1);assert.equal(result.rows[1].CAn,7);
  assert.deepEqual(calls[0].params,{...filters,start:'2026-10-01 08:00:00',end:'2026-10-22 07:59:59'});
  await assert.rejects(()=>createWorkloadReportReader(async()=>{throw Error('BACKUP unavailable');}).getWorkloadReport(filters),/BACKUP unavailable/);
});
test('Workload CrossTab matches Crystal: columns sorted in English locale, same display name merged, missing cells zero and grand totals first',()=>{
  const pivot=workloadCrossTab([row('01','Screening_WL',3,'A'),row('01','Checkout',2,'A'),row('02','Checkout',4,'A'),row('03','กลุ่มการดูแล',9,'B')]);
  assert.deepEqual(pivot.columns,['Checkout','Screening_WL','กลุ่มการดูแล']);
  assert.deepEqual(pivot.people,[{name:'A',values:[6,3,0],total:9},{name:'B',values:[0,0,9],total:9}]);
  assert.deepEqual(pivot.totals,[6,3,9]);assert.equal(pivot.total,18);
  const bands=workloadColumnBands(15);assert.deepEqual(bands.map(b=>b.indices.length),[6,8,1]);
  assert.deepEqual(bands.map(b=>b.identity),[true,false,false]);
  assert.equal(new Set(bands.flatMap(b=>b.indices)).size,15);
});
test('Workload PDF retains native A4 landscape, hospital logo and horizontal CrossTab continuation with all data',async()=>{
  const rows=Array.from({length:10},(_,i)=>row('01',`Care ${i}`,i+1));
  const {buffer,pageCount}=await createWorkloadReportPdf({rows,filters},new Date('2026-10-21T03:00:00Z'));
  assert.equal(buffer.subarray(0,5).toString(),'%PDF-');assert.equal(pageCount,2);
  const pdf=await PDFDocument.load(buffer);assert.equal(pdf.getPageCount(),2);
  for(const page of pdf.getPages())assert.deepEqual(page.getSize(),{width:842,height:595});
  assert.ok(pdf.getPages()[0].node.Resources().lookup(require('pdf-lib').PDFName.of('XObject')));
});
test('Workload routes authenticate, validate filters, expose safe picker users, report no-data and forbid data writes',async(t)=>{
  let reads=0,rows=[];
  const repository={getWorkloadReportUsers:async()=>[{code:'001',name:'ผู้ทดสอบ'}],getWorkloadReport:async()=>{reads++;return {rows,filters};}};
  const server=createApp({repository,jwtSecret:'workload-tests'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'workload-tests');
  const send=(path,{method='GET',body,auth=true}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/workload/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  assert.equal((await send('users',{auth:false})).status,401);assert.equal((await send('pdf',{method:'POST',body:filters,auth:false})).status,401);
  const users=await send('users');assert.deepEqual(await users.json(),{users:[{code:'001',name:'ผู้ทดสอบ'}]});assert.equal(users.headers.get('cache-control'),'no-store');
  assert.equal((await send('users?secret=x')).status,400);
  assert.equal((await send('pdf',{method:'POST',body:{...filters,rows:[]}})).status,400);assert.equal(reads,0);
  const empty=await send('pdf',{method:'POST',body:filters});assert.equal(empty.status,404);assert.equal((await empty.json()).message,'ไม่พบข้อมูล');
  rows=[row('01','Checkout',4)];const pdf=await send('pdf',{method:'POST',body:filters});
  assert.equal(pdf.status,200);assert.equal(pdf.headers.get('cache-control'),'no-store');assert.match(pdf.headers.get('content-type'),/application\/pdf/);
  assert.equal(pdf.headers.get('x-report-pages'),'1');assert.equal(pdf.headers.get('x-report-rows'),'1');
  for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await send('users',{method,body:{}})).status,403);
});
