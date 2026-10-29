const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {medTransferReportFilters}=require('../routes/reportMedTransferRoutes');
const {wardsSql,rowsSql,reportMedTransferWindow,assembleMedTransferRows,createMedTransferReportReader}=require('../services/reportMedTransfer');
const {columns,medTransferPdfDefinition,createMedTransferReportPdf}=require('../services/reportMedTransferPdf');
const filters={date:'2026-10-21',wardCode:'1'};
const saved={prescriptionno:'SYN-RX-001',hn:'SYN-HN',an:'SYN-AN',patientname:'ผู้ป่วยทดสอบ',wardname:'หอทดสอบ',username:'ผู้บรรจุยาทดสอบ',cartname:'CART-01'};

test('Med Transfer report validates calendar date and ward, forbids time/room/status/SQL overrides',()=>{
  assert.deepEqual(medTransferReportFilters(filters),filters);
  assert.ok(medTransferReportFilters({...filters,date:'2024-02-29'}));
  for(const changes of [{date:'2026-02-30'},{date:[]},{date:'1753-01-01'},{date:'9999-12-31'},
    {wardCode:''},{wardCode:[]},{wardCode:"1' OR 1=1"},{roomCode:'001'},{status:'pending'},
    {start:'x'},{workdate:'2026-10-20'},{sql:'SELECT'}])assert.equal(medTransferReportFilters({...filters,...changes}),null);
  assert.equal(medTransferReportFilters(null),null);
});
test('Med Transfer report reproduces native current-clock 08:00 boundary even for a historical selected date; end is 07:59:00',()=>{
  assert.deepEqual(reportMedTransferWindow('2026-01-01',new Date('2026-10-21T00:59:59Z')),{workdate:'2025-12-31',start:'2025-12-31 08:00:00',end:'2026-01-01 07:59:00'});
  assert.deepEqual(reportMedTransferWindow('2026-01-01',new Date('2026-10-21T01:00:00Z')),{workdate:'2026-01-01',start:'2026-01-01 08:00:00',end:'2026-01-02 07:59:00'});
});
test('Med Transfer report uses all master wards, inner-joined saved packer and native snapshot groups without adding clinical/room exclusions or writes',()=>{
  assert.match(wardsSql,/FROM dbo\.ms_ward/);assert.doesNotMatch(wardsSql,/wardstatus|packagemaster|roomcode/i);
  assert.match(rowsSql,/INNER JOIN dbo\.ms_users u ON u\.userID=pm\.medtransferuserid/);
  assert.match(rowsSql,/pm\.medtransferdatetime IS NOT NULL/);
  assert.match(rowsSql,/pm\.ordercreatedate BETWEEN CAST\(@start AS datetime\) AND CAST\(@end AS datetime\)/);
  assert.match(rowsSql,/GROUP BY pm\.prescriptionno,pm\.patientname,pm\.hn,pm\.an,pm\.wardname,pm\.cartname,u\.firstname,u\.lastname/);
  assert.match(rowsSql,/ORDER BY pm\.prescriptionno ASC/);
  assert.doesNotMatch(rowsSql,/voiddatetime|holddatetime|checkoutdatetime|orderqty|ordertype|roomcode|mysql/i);
  for(const query of [wardsSql,rowsSql])assert.doesNotMatch(query,/\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i);
});
test('Med Transfer report preserves repeated prescription groups, saved patient/cart/packer fields and native row numbering',()=>{
  const rows=assembleMedTransferRows([saved,{...saved,cartname:'CART-02',username:null}]);
  assert.equal(rows.length,2);assert.deepEqual(rows.map(row=>row.no),[1,2]);
  assert.equal(rows[1].prescriptionno,saved.prescriptionno);assert.equal(rows[1].username,'');assert.equal(rows[1].cartname,'CART-02');
  assert.deepEqual(columns.map(([,title])=>title),['No.','เลขที่ใบสั่งยา','HN','AN','ชื่อผู้ป่วย','หอผู้ป่วย','ผู้บรรจุยา','รถเข็น']);
});
test('Med Transfer reader binds ward/time values, does not deduplicate native groups and reads master options independently',async()=>{
  const calls=[];const reader=createMedTransferReportReader(async(sql,params)=>{calls.push({sql,params});return {recordset:sql===wardsSql?[{wardcode:'1 ',name:'[1] หอทดสอบ '}]:[saved,{...saved,cartname:'OTHER'}]};});
  assert.deepEqual(await reader.getMedTransferReportWards(),[{code:'1',name:'[1] หอทดสอบ'}]);
  const data=await reader.getMedTransferReport(filters,new Date('2026-10-21T03:00:00Z'));
  assert.equal(data.rows.length,2);assert.deepEqual(calls[1].params,{wardCode:'1',start:'2026-10-21 08:00:00',end:'2026-10-22 07:59:00'});
});
test('Med Transfer PDF preserves original landscape logo/artwork, eight report columns, header repetition and global record numbers',async()=>{
  const data={rows:assembleMedTransferRows([saved])};
  const definition=medTransferPdfDefinition(data,new Date('2026-10-21T03:00:00Z'));
  assert.deepEqual(definition.pageSize,{width:842,height:595});assert.match(definition.content[0].image,/med-transfer[\\/]header\.png$/);
  assert.ok(Math.abs(definition.content[0].height-125.95)<0.001);assert.equal(definition.content[1].table.headerRows,1);
  assert.deepEqual(definition.content[1].table.body[0].map(cell=>cell.text),columns.map(([,title])=>title));
  const one=await createMedTransferReportPdf(data);assert.equal(one.buffer.subarray(0,5).toString(),'%PDF-');assert.equal(one.pageCount,1);
  const many=await createMedTransferReportPdf({rows:assembleMedTransferRows(Array.from({length:100},(_,i)=>({...saved,prescriptionno:`SYN-RX-${i+1}`})))});
  assert.ok(many.pageCount>1);assert.equal((await PDFDocument.load(many.buffer)).getPageCount(),many.pageCount);
  assert.equal((await createMedTransferReportPdf({rows:[]})).pageCount,1);
});
test('Med Transfer report API authenticates, rejects invalid filters before reads, returns PDF preview metadata and blocks writes',async(t)=>{
  let reads=0,fail=false;
  const repository={getMedTransferReportWards:async()=>{if(fail)throw Error('Synthetic failure');return [{code:'1',name:'[1] หอทดสอบ'}];},getMedTransferReport:async()=>{reads++;return {rows:assembleMedTransferRows([saved])};}};
  const server=createApp({repository,jwtSecret:'med-transfer-report-test'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'med-transfer-report-test');
  const send=(path,{data,method='GET',auth=true}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/med-transfer/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
  assert.equal((await send('wards',{auth:false})).status,401);
  assert.equal((await send('pdf',{method:'POST',auth:false,data:filters})).status,401);
  assert.equal((await send('wards?roomCode=001')).status,400);assert.equal((await send('wards')).status,200);
  assert.equal((await send('pdf',{method:'POST',data:{...filters,roomCode:'001'}})).status,400);assert.equal(reads,0);
  const result=await send('pdf',{method:'POST',data:filters});assert.equal(result.status,200);
  assert.match(result.headers.get('content-type'),/application\/pdf/);assert.equal(result.headers.get('cache-control'),'no-store');
  assert.equal(result.headers.get('x-report-pages'),'1');assert.equal(result.headers.get('x-report-rows'),'1');
  assert.equal(Buffer.from(await result.arrayBuffer()).subarray(0,5).toString(),'%PDF-');
  for(const method of ['POST','PUT','DELETE','PATCH'])assert.equal((await send('wards',{method,data:{}})).status,403);
  fail=true;assert.equal((await send('wards')).status,503);
});
