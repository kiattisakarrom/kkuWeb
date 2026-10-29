const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {requisitionKinds,assembleRequisitionRows}=require('../services/reportRequisitionIpd');
const {rowsSql,assembleRequisitionFixedStockRows,createRequisitionFixedStockReader}=require('../services/reportRequisitionFixedStock');
const {requisitionFixedStockFilters}=require('../routes/reportRequisitionFixedStockRoutes');
const {createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
const filters={from:'2026-10-22',to:'2026-10-22',kind:'floor4'},now=new Date('2026-10-23T02:00:00Z');
const raw={orderitemcode:'000123',orderitemname:'ยาจำลอง Fixed Stock',orderqty:25.5,drugform:'Tablet',orderunitcode:'TAB',Inventorycode:'000456',pack:'10'};

test('Fixed Stock uses native pharmacy 018 detail rows, sent OR printed and types 0/3, without adding other clinical predicates',()=>{
  assert.match(rowsSql,/FROM dbo\.prescriptiondetail pt LEFT JOIN dbo\.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode/);
  assert.match(rowsSql,/WHERE pt.departmentcode='018' AND \(pt.sendmachine='Y' OR pt.printstatus='1'\)/);
  assert.match(rowsSql,/pt.ordertype IN \('0','3'\) AND mdr.sendStore=@sendStore/);
  assert.match(rowsSql,/@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4/);
  assert.match(rowsSql,/SUM\(CAST\(pt.orderqty AS DEC\(10,2\)\)\)/);
  assert.match(rowsSql,/GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack/);
  assert.match(rowsSql,/ORDER BY pt.orderitemname ASC/);
  assert.doesNotMatch(rowsSql,/departmentcode='001'|IVStatus|voiddatetime|holddatetime|unused|mysql|INSERT|UPDATE|DELETE/i);
});
test('Fixed Stock preserves AD print-day number, exact full report room, saved name and units without altering IPD metadata',()=>{
  assert.deepEqual(assembleRequisitionFixedStockRows([raw],now)[0],{RequisitionNo:'AD23102026',Room:'ห้องจ่ายยาเสพติด และ Fixed Stock',orderitemcode:'000123',orderitemname:'ยาจำลอง Fixed Stock',orderqty:'26',Pack:'3 x 10',dosageunitcode:'TAB',INV_Code:'000456',drugform:'Tablet'});
  assert.equal(assembleRequisitionRows([raw],now)[0].RequisitionNo,'UD23102026');
  assert.equal(assembleRequisitionFixedStockRows([{...raw,orderqty:24.5,pack:'',drugform:null}],now)[0].Pack,'24');
  assert.equal(assembleRequisitionFixedStockRows([{...raw,drugform:null}],now)[0].drugform,'อื่นๆ');
  assert.equal(assembleRequisitionFixedStockRows([{...raw,pack:0}],now)[0].Pack,'Infinity x 0');
});
test('Fixed Stock supports all four categories with one bound read each and native before/after 08:00 window',async()=>{
  const calls=[],reader=createRequisitionFixedStockReader(async(sql,params)=>{calls.push({sql,params});return {recordset:[raw]};});
  for(const [kind,scope] of Object.entries(requisitionKinds)){
    await reader.getRequisitionFixedStockReport({...filters,kind},new Date('2026-10-23T00:00:00Z'));
    assert.deepEqual(calls.at(-1).params,{start:'2026-10-21 08:00:00',end:'2026-10-22 07:59:00',sendStore:scope.sendStore,sendF3F4:scope.sendF3F4});
  }
  await reader.getRequisitionFixedStockReport(filters,now);assert.deepEqual(calls.at(-1).params,{start:'2026-10-22 08:00:00',end:'2026-10-23 07:59:00',sendStore:1,sendF3F4:1});
  assert.equal(calls.length,5);assert.ok(calls.every(call=>call.sql===rowsSql));
  await assert.rejects(()=>reader.getRequisitionFixedStockReport({...filters,kind:'constructor'},now),/Invalid requisition kind/);assert.equal(calls.length,5);
});
test('Fixed Stock keeps A4 native template and empty-report support, validating categories/dates and refusing client scope overrides',async()=>{
  for(const kind of Object.keys(requisitionKinds))assert.deepEqual(requisitionFixedStockFilters({...filters,kind}),{...filters,kind});
  for(const extra of [{room:'ห้องยา IPD'},{departmentcode:'018'},{sendStore:2},{rows:[raw]},{from:'2026-02-30'}])assert.equal(requisitionFixedStockFilters({...filters,...extra}),null);
  for(const rows of [assembleRequisitionFixedStockRows([raw],now),[]]){
    const result=await createRequisitionIpdPdf({rows},now),pdf=await PDFDocument.load(result.buffer);
    assert.equal(result.pageCount,1);assert.deepEqual(pdf.getPage(0).getSize(),{width:595,height:842});
  }
});
test('Fixed Stock PDF API authenticates and validates before reads, returns filename/counts and native empty PDF, and blocks writes',async(t)=>{
  let reads=0,rows=assembleRequisitionFixedStockRows([raw],now);
  const server=createApp({repository:{getRequisitionFixedStockReport:async()=>{reads++;return {rows};}},jwtSecret:'fixed-stock-test'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'fixed-stock-test');
  const send=({method='POST',body=filters,auth=true,path='pdf'}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-fixed-stock/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await send({auth:false})).status,401);assert.equal((await send({body:{...filters,departmentcode:'001'}})).status,400);assert.equal(reads,0);
  const response=await send();assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/pdf/);assert.equal(response.headers.get('content-disposition'),'attachment; filename="Fixed-Stock-Requisition-Report.pdf"');
  assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-report-rows'),'1');assert.equal(reads,1);
  rows=[];const empty=await send();assert.equal(empty.status,200);assert.equal(empty.headers.get('x-report-rows'),'0');assert.equal(empty.headers.get('x-report-pages'),'1');
  for(const method of ['PUT','PATCH','DELETE'])assert.equal((await send({method})).status,403);assert.equal((await send({path:'save'})).status,403);
});
