const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {requisitionDcFilters}=require('../routes/reportRequisitionDcRoutes');
const {requisitionKinds,assembleRequisitionRows}=require('../services/reportRequisitionIpd');
const {rowsSql,assembleRequisitionDcRows,createRequisitionDcReader}=require('../services/reportRequisitionDc');
const {createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
const filters={from:'2026-10-21',to:'2026-10-21',kind:'floor4'},now=new Date('2026-10-22T02:00:00Z');
const raw={orderitemcode:'000123',orderitemname:'ยาทดสอบกลับบ้าน',orderqty:25.5,drugform:'Tablet',orderunitcode:'TAB',Inventorycode:'000456',pack:'10'};

test('D/C requisition keeps native printed home-drug rows from both 005 and 001, without IPD sendmachine or ordertype filters',()=>{
  assert.match(rowsSql,/FROM dbo\.prescriptiondetail pt LEFT JOIN dbo\.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode/);
  assert.match(rowsSql,/WHERE \(pt.departmentcode='005' OR pt.departmentcode='001'\) AND pt.printstatus='1'/);
  assert.match(rowsSql,/pt.ordertype='1'/);assert.match(rowsSql,/SUM\(CAST\(pt.orderqty AS DEC\(10,2\)\)\)/);
  assert.match(rowsSql,/mdr.sendStore=@sendStore/);assert.match(rowsSql,/@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4/);
  assert.match(rowsSql,/GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack/);
  assert.match(rowsSql,/ORDER BY pt.orderitemname ASC/);
  assert.doesNotMatch(rowsSql,/sendmachine|IN \('0','3'\)|voiddatetime|holddatetime|unused|mysql|BACKUP|INSERT|UPDATE|DELETE/i);
});
test('D/C requisition uses DC print-day number and room while retaining shared CInt, packs, saved names and leading zeros; IPD remains UD',()=>{
  const row=assembleRequisitionDcRows([raw],now)[0],ipd=assembleRequisitionRows([raw],now)[0];
  assert.deepEqual(row,{RequisitionNo:'DC22102026',Room:'ห้องยา D/C',orderitemcode:'000123',orderitemname:'ยาทดสอบกลับบ้าน',orderqty:'26',Pack:'3 x 10',dosageunitcode:'TAB',INV_Code:'000456',drugform:'Tablet'});
  assert.equal(ipd.RequisitionNo,'UD22102026');assert.equal(ipd.Room,'ห้องยา IPD');
  assert.equal(assembleRequisitionDcRows([{...raw,pack:'0'}],now)[0].Pack,'Infinity x 0');
  assert.equal(assembleRequisitionDcRows([{...raw,pack:null,drugform:null}],now)[0].Pack,'26');
  assert.equal(assembleRequisitionDcRows([{...raw,drugform:null}],now)[0].drugform,'อื่นๆ');
});
test('D/C reader performs one parameterized read per category with the same before-08:00 native range and checked category mapping',async()=>{
  const calls=[],reader=createRequisitionDcReader(async(sql,params)=>{calls.push({sql,params});return {recordset:[raw]};});
  for(const [kind,scope] of Object.entries(requisitionKinds)){
    const data=await reader.getRequisitionDcReport({...filters,kind},new Date('2026-10-22T00:00:00Z'));
    assert.equal(data.rows[0].RequisitionNo,'DC22102026');assert.equal(data.rows[0].Room,'ห้องยา D/C');
    assert.deepEqual(calls.at(-1).params,{start:'2026-10-20 08:00:00',end:'2026-10-21 07:59:00',sendStore:scope.sendStore,sendF3F4:scope.sendF3F4});
  }
  assert.equal(calls.length,4);assert.ok(calls.every(call=>call.sql===rowsSql));
  await assert.rejects(()=>reader.getRequisitionDcReport({...filters,kind:'constructor'},now),/Invalid requisition kind/);
});
test('D/C report uses the shared native Requisition template with A4 portrait, all four category filters and blank report support',async()=>{
  for(const kind of Object.keys(requisitionKinds))assert.deepEqual(requisitionDcFilters({...filters,kind}),{...filters,kind});
  for(const extra of [{room:'ห้องยา IPD'},{departmentcode:'001'},{sendStore:1},{rows:[raw]},{kind:'__proto__'}])assert.equal(requisitionDcFilters({...filters,...extra}),null);
  for(const rows of [assembleRequisitionDcRows([raw],now),[]]){
    const report=await createRequisitionIpdPdf({rows},now),pdf=await PDFDocument.load(report.buffer);
    assert.equal(report.pageCount,1);assert.equal(pdf.getPageCount(),1);assert.deepEqual(pdf.getPage(0).getSize(),{width:595,height:842});
  }
});
test('D/C PDF API enforces auth and read-only filters, uses its own repository/filename, preserves empty PDF and keeps the IPD endpoint independent',async(t)=>{
  let dcReads=0,ipdReads=0,rows=assembleRequisitionDcRows([raw],now);
  const repository={getRequisitionDcReport:async()=>{dcReads++;return {rows};},getRequisitionIpdReport:async()=>{ipdReads++;return {rows:assembleRequisitionRows([raw],now)};}};
  const server=createApp({repository,jwtSecret:'dc-requisition-tests'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'dc-requisition-tests');
  const send=({method='POST',body=filters,auth=true,scope='dc',path='pdf'}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-${scope}/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:method==='GET'?undefined:JSON.stringify(body)});
  assert.equal((await send({auth:false})).status,401);assert.equal((await send({body:{...filters,departmentcode:'001'}})).status,400);assert.equal(dcReads,0);
  const dc=await send();assert.equal(dc.status,200);assert.equal(dc.headers.get('content-disposition'),'attachment; filename="DC-Requisition-Report.pdf"');
  assert.match(dc.headers.get('content-type'),/application\/pdf/);assert.equal(dc.headers.get('cache-control'),'no-store');assert.equal(dc.headers.get('x-report-rows'),'1');assert.equal(ipdReads,0);
  const ipd=await send({scope:'ipd'});assert.equal(ipd.status,200);assert.equal(ipd.headers.get('content-disposition'),'attachment; filename="IPD-Requisition-Report.pdf"');assert.equal(ipdReads,1);assert.equal(dcReads,1);
  rows=[];const empty=await send();assert.equal(empty.status,200);assert.equal(empty.headers.get('x-report-rows'),'0');assert.equal(empty.headers.get('x-report-pages'),'1');
  for(const method of ['PUT','PATCH','DELETE'])assert.equal((await send({method})).status,403);
  assert.equal((await send({path:'save'})).status,403);
});
