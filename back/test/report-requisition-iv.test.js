const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {requisitionKinds,assembleRequisitionRows}=require('../services/reportRequisitionIpd');
const {rowsSql,assembleRequisitionIvRows,createRequisitionIvReader}=require('../services/reportRequisitionIv');
const {requisitionIvFilters}=require('../routes/reportRequisitionIvRoutes');
const {createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
const filters={from:'2026-10-22',to:'2026-10-22',kind:'floor4'},now=new Date('2026-10-23T02:00:00Z');
const raw={orderitemcode:'000123',orderitemname:'ยาจำลองสำหรับเตรียม',orderqty:25.5,drugform:'Injection',orderunitcode:'VIAL',Inventorycode:'000456',pack:'10'};

test('IV requisition reads native prescription with any non-null IVStatus and no extra detail/room/print/clinical predicates',()=>{
  assert.match(rowsSql,/FROM dbo\.prescription pt LEFT JOIN dbo\.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode/);
  assert.match(rowsSql,/WHERE pt.IVStatus IS NOT NULL AND mdr.sendStore=@sendStore/);
  assert.match(rowsSql,/@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4/);
  assert.match(rowsSql,/SUM\(CAST\(pt.orderqty AS DEC\(10,2\)\)\)/);
  assert.match(rowsSql,/GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack/);
  assert.match(rowsSql,/ORDER BY pt.orderitemname ASC/);
  assert.doesNotMatch(rowsSql,/prescriptiondetail|departmentcode|printstatus|sendmachine|ordertype|IVStatus\s*=|voiddatetime|holddatetime|unused|mysql|INSERT|UPDATE|DELETE/i);
});
test('IV rows keep current print-day IV number, exact native room name, saved drug name and master unit/pack, without changing IPD metadata',()=>{
  const row=assembleRequisitionIvRows([raw],now)[0];
  assert.deepEqual(row,{RequisitionNo:'IV23102026',Room:'ห้องเตรียมยาอาคารเภสัชกรรม',orderitemcode:'000123',orderitemname:'ยาจำลองสำหรับเตรียม',orderqty:'26',Pack:'3 x 10',dosageunitcode:'VIAL',INV_Code:'000456',drugform:'Injection'});
  assert.equal(assembleRequisitionRows([raw],now)[0].RequisitionNo,'UD23102026');
  assert.equal(assembleRequisitionIvRows([{...raw,orderqty:24.5,pack:'',drugform:null}],now)[0].Pack,'24');
  assert.equal(assembleRequisitionIvRows([{...raw,drugform:null}],now)[0].drugform,'อื่นๆ');
  assert.equal(assembleRequisitionIvRows([{...raw,pack:0}],now)[0].Pack,'Infinity x 0');
});
test('IV reader performs one bound read per category, preserving before/after 08:00 round and rejecting invalid category before reads',async()=>{
  const calls=[],reader=createRequisitionIvReader(async(sql,params)=>{calls.push({sql,params});return {recordset:[raw]};});
  for(const [kind,scope] of Object.entries(requisitionKinds)){
    await reader.getRequisitionIvReport({...filters,kind},new Date('2026-10-23T00:00:00Z'));
    assert.deepEqual(calls.at(-1).params,{start:'2026-10-21 08:00:00',end:'2026-10-22 07:59:00',sendStore:scope.sendStore,sendF3F4:scope.sendF3F4});
  }
  await reader.getRequisitionIvReport(filters,now);assert.deepEqual(calls.at(-1).params,{start:'2026-10-22 08:00:00',end:'2026-10-23 07:59:00',sendStore:1,sendF3F4:1});
  assert.equal(calls.length,5);assert.ok(calls.every(call=>call.sql===rowsSql));
  await assert.rejects(()=>reader.getRequisitionIvReport({...filters,kind:'constructor'},now),/Invalid requisition kind/);assert.equal(calls.length,5);
});
test('IV uses shared A4 native logo/signature template for populated and empty reports, with validated native category/date filters',async()=>{
  for(const kind of Object.keys(requisitionKinds))assert.deepEqual(requisitionIvFilters({...filters,kind}),{...filters,kind});
  for(const extra of [{room:'ห้องยา IPD'},{departmentcode:'002'},{IVStatus:'Y'},{sendStore:1},{rows:[raw]},{from:'2026-02-30'}])assert.equal(requisitionIvFilters({...filters,...extra}),null);
  for(const rows of [assembleRequisitionIvRows([raw],now),[]]){
    const result=await createRequisitionIpdPdf({rows},now),pdf=await PDFDocument.load(result.buffer);
    assert.equal(result.pageCount,1);assert.deepEqual(pdf.getPage(0).getSize(),{width:595,height:842});
  }
});
test('IV PDF endpoint requires auth, rejects client scope/data, exports one snapshot with native empty PDF and blocks writes',async(t)=>{
  let reads=0,rows=assembleRequisitionIvRows([raw],now);
  const server=createApp({repository:{getRequisitionIvReport:async()=>{reads++;return {rows};}},jwtSecret:'iv-requisition-test'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'iv-requisition-test');
  const send=({method='POST',body=filters,auth=true,path='pdf'}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-iv/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await send({auth:false})).status,401);assert.equal((await send({body:{...filters,departmentcode:'002'}})).status,400);assert.equal(reads,0);
  const response=await send();assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/pdf/);assert.equal(response.headers.get('content-disposition'),'attachment; filename="IV-Requisition-Report.pdf"');
  assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-report-rows'),'1');assert.equal(reads,1);
  rows=[];const empty=await send();assert.equal(empty.status,200);assert.equal(empty.headers.get('x-report-rows'),'0');assert.equal(empty.headers.get('x-report-pages'),'1');
  for(const method of ['PUT','PATCH','DELETE'])assert.equal((await send({method})).status,403);assert.equal((await send({path:'save'})).status,403);
});
