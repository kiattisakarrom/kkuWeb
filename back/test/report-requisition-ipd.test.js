const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument,PDFName}=require('pdf-lib');
const {createApp}=require('../app');
const {requisitionIpdFilters}=require('../routes/reportRequisitionIpdRoutes');
const {requisitionKinds,rowsSql,requisitionWindow,nativeInteger,assembleRequisitionRows,groupRequisitionRows,createRequisitionIpdReader}=require('../services/reportRequisitionIpd');
const {fields,createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
const filters={from:'2026-10-21',to:'2026-10-21',kind:'floor4'},now=new Date('2026-10-22T02:00:00Z');
const raw={orderitemcode:'000123',orderitemname:'ยาทดสอบ',orderqty:25.5,drugform:'Tablet',orderunitcode:'TAB',Inventorycode:'000456',pack:'10'};

test('IPD requisition accepts only four native categories and true bounded dates, never client rows or pharmacy overrides',()=>{
  for(const kind of Object.keys(requisitionKinds))assert.ok(requisitionIpdFilters({...filters,kind}));
  assert.deepEqual(requisitionIpdFilters(filters),filters);
  for(const value of [{from:'2026-02-30'},{from:'2026-10-22'},{to:'9999-12-31'},{kind:'constructor'},{kind:'__proto__'},{kind:[]},{departmentcode:'010'},{rows:[raw]},{sendStore:2}])assert.equal(requisitionIpdFilters({...filters,...value}),null);
});
test('IPD requisition uses Bangkok 08:00 cutoff including midnight and native 07:59:00 end for both selected dates',()=>{
  assert.deepEqual(requisitionWindow(filters.from,filters.to,now),{start:'2026-10-21 08:00:00',end:'2026-10-22 07:59:00'});
  assert.deepEqual(requisitionWindow(filters.from,filters.to,new Date('2026-10-22T00:59:00Z')),{start:'2026-10-20 08:00:00',end:'2026-10-21 07:59:00'});
  assert.deepEqual(requisitionWindow('2026-01-01','2026-01-02',new Date('2026-10-21T17:00:00Z')),{start:'2025-12-31 08:00:00',end:'2026-01-02 07:59:00'});
});
test('IPD requisition keeps native detail table, saved drug names, DEC(10,2) sum, master filters and original grouping without extra clinical filters',()=>{
  assert.match(rowsSql,/FROM dbo\.prescriptiondetail pt LEFT JOIN dbo\.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode/);
  assert.match(rowsSql,/SUM\(CAST\(pt.orderqty AS DEC\(10,2\)\)\)/);
  assert.match(rowsSql,/pt.departmentcode='001'.*\(pt.sendmachine='Y' OR pt.printstatus='1'\)/);
  assert.match(rowsSql,/pt.ordertype IN \('0','3'\)/);assert.match(rowsSql,/mdr.sendStore=@sendStore/);
  assert.match(rowsSql,/@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4/);
  assert.match(rowsSql,/GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack/);
  assert.match(rowsSql,/ORDER BY pt.orderitemname ASC/);
  assert.doesNotMatch(rowsSql,/voiddatetime|holddatetime|unused|genorderdatetime|confirmuserid|mysql|BACKUP|INSERT|UPDATE|DELETE/i);
});
test('IPD requisition reproduces VB CInt ties-to-even, Int32 limits and original pack calculation without hiding zero-pack master data',()=>{
  assert.deepEqual([0.5,1.5,2.5,3.5,-0.5,-1.5,-2.5].map(nativeInteger),[0,2,2,4,0,-2,-2]);
  assert.equal(nativeInteger('1,000'),1000);assert.equal(nativeInteger('2147483647'),2147483647);
  for(const value of ['','not a number','2147483648',NaN,null])assert.throws(()=>nativeInteger(value));
  const rows=assembleRequisitionRows([raw,{...raw,pack:null},{...raw,orderqty:10,pack:'0'},{...raw,orderqty:0,pack:'0'}],now);
  assert.deepEqual(rows.map(row=>row.Pack),['3 x 10','26','Infinity x 0','NaN x 0']);
  assert.equal(rows[0].orderqty,'26');
});
test('IPD requisition preserves saved fields/leading zeros, current-day UD number and blank form fallback without deriving stock/rate',()=>{
  const rows=assembleRequisitionRows([{...raw,drugform:' ',orderunitcode:null,Inventorycode:' 000456 '}],now);
  assert.deepEqual(rows[0],{RequisitionNo:'UD22102026',Room:'ห้องยา IPD',orderitemcode:'000123',orderitemname:'ยาทดสอบ',orderqty:'26',Pack:'3 x 10',dosageunitcode:'',INV_Code:'000456',drugform:'อื่นๆ'});
  assert.deepEqual(fields.map(field=>field.key),['no','INV_Code','orderitemcode','orderitemname','minStock','orderqty','rate','Pack','dosageunitcode']);
  assert.equal(rows[0].minStock,undefined);assert.equal(rows[0].rate,undefined);
});
test('IPD requisition Crystal groups forms ascending, preserves SQL drug order within forms and numbers continuously across groups',()=>{
  const a=assembleRequisitionRows([{...raw,drugform:'Tablet',orderitemname:'A'},{...raw,drugform:'Injection',orderitemname:'B'},{...raw,drugform:'Tablet',orderitemname:'C'}],now);
  const groups=groupRequisitionRows(a);
  assert.deepEqual(groups.map(group=>group.drugform),['Injection','Tablet']);
  assert.deepEqual(groups.flatMap(group=>group.rows.map(row=>[row.orderitemname,row.no])),[['B',1],['A',2],['C',3]]);
  assert.equal(a[0].orderitemname,'A');assert.equal(a[0].no,undefined);
});
test('IPD requisition reader binds fixed category predicates in one read per search and fixes number date at request time',async()=>{
  const calls=[],reader=createRequisitionIpdReader(async(sql,params)=>{calls.push({sql,params});return {recordset:[raw]};});
  for(const kind of Object.keys(requisitionKinds)){
    const data=await reader.getRequisitionIpdReport({...filters,kind},now),call=calls.at(-1);
    assert.deepEqual(call.params,{start:'2026-10-21 08:00:00',end:'2026-10-22 07:59:00',sendStore:requisitionKinds[kind].sendStore,sendF3F4:requisitionKinds[kind].sendF3F4});
    assert.equal(data.rows[0].RequisitionNo,'UD22102026');
  }
  assert.equal(calls.length,4);
});
test('IPD requisition PDF keeps A4 portrait, original logo/signatures and handles both long names and a native empty report',async()=>{
  for(const rows of [assembleRequisitionRows([raw],now),[]]){
    const {buffer,pageCount}=await createRequisitionIpdPdf({rows},now),pdf=await PDFDocument.load(buffer);
    assert.equal(buffer.subarray(0,5).toString(),'%PDF-');assert.equal(pageCount,1);assert.equal(pdf.getPageCount(),1);
    assert.deepEqual(pdf.getPage(0).getSize(),{width:595,height:842});
    assert.ok(pdf.getPage(0).node.Resources().lookup(PDFName.of('XObject')).keys().length>=2);
  }
  const rows=assembleRequisitionRows(Array.from({length:100},(_,i)=>({...raw,orderitemcode:`SYN-${i}`,orderitemname:`ยาทดสอบ ${i} ${i===30?'ชื่อยายาว '.repeat(20):''}`})),now);
  const report=await createRequisitionIpdPdf({rows},now);assert.ok(report.pageCount>=3);
  assert.equal((await PDFDocument.load(report.buffer)).getPageCount(),report.pageCount);
});
test('IPD requisition API authenticates, validates before reads, exports without writes and returns a blank PDF for native no-data modal',async(t)=>{
  let reads=0,rows=assembleRequisitionRows([raw],now);
  const repository={getRequisitionIpdReport:async()=>{reads++;return {rows};}};
  const server=createApp({repository,jwtSecret:'requisition-tests'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'requisition-tests');
  const send=({method='POST',body=filters,auth=true,path='pdf'}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-ipd/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:method==='GET'?undefined:JSON.stringify(body)});
  assert.equal((await send({auth:false})).status,401);
  assert.equal((await send({body:{...filters,rows:[raw]}})).status,400);assert.equal(reads,0);
  const response=await send();assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/pdf/);
  assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-report-rows'),'1');assert.equal(response.headers.get('x-report-pages'),'1');
  rows=[];const empty=await send();assert.equal(empty.status,200);assert.equal(empty.headers.get('x-report-rows'),'0');
  for(const method of ['PUT','PATCH','DELETE'])assert.equal((await send({method})).status,403);
  assert.equal((await send({path:'save'})).status,403);
});
