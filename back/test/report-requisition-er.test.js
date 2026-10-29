const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {requisitionKinds}=require('../services/reportRequisitionIpd');
const {rowsSql,masterSql,mappingSql,opdSql,assembleRequisitionErRows,createRequisitionErReader,opdDisabled,opdUnavailable}=require('../services/reportRequisitionEr');
const {createRequisitionIpdPdf}=require('../services/reportRequisitionIpdPdf');
const {createRequisitionMissingPdf}=require('../services/reportRequisitionMissingPdf');
const filters={from:'2026-10-21',to:'2026-10-21',kind:'floor4'},now=new Date('2026-10-22T02:00:00Z');
const master={orderitemcode:'0001',orderitemENname:'Master name',drugform:'Tablet',orderunitcode:'TAB',Inventorycode:'00123',pack:'10',sendStore:1,sendF3F4:1,unused:'N'};
const raw=(code,qty,name='Saved name')=>({orderitemcode:code,orderqty:qty,orderitemname:name});
const assemble=(rows,masters=[master],mapping=[],kind='floor4')=>assembleRequisitionErRows(rows,masters,mapping,kind,now);

test('ER uses the ER() source predicates, OPD calendar dates and post-mapping category filters',()=>{
  assert.match(rowsSql,/pt.departmentcode='004' AND pt.printstatus='1'/);
  assert.doesNotMatch(rowsSql,/ordertype|sendmachine|sendStore|sendF3F4|unused|voiddatetime|holddatetime/i);
  assert.match(rowsSql,/SUM\(CAST\(pt.orderqty AS DEC\(10,2\)\)\)/);
  assert.match(opdSql,/location='ER' AND inv_type != '9' AND `Date` BETWEEN \? AND \?/);
  assert.match(opdSql,/IFNULL\(SUM\(CAST\(t.no AS DEC\(10,2\)\)\),0\)/);
  assert.match(opdSql,/GROUP BY t.drugcode/);assert.match(masterSql,/ISNULL\(pack,0\) AS pack/);
});
test('ER maps aliases before selecting category, uses the first matching master, and rounds each source before merging codes',()=>{
  const masters=[{...master,orderitemENname:'Excluded',sendF3F4:0},master];
  const mappings=[{mc_id:'OPD001',Sum_MCID:'0001'},{mc_id:'OPD001',Sum_MCID:'WRONG'}];
  const {rows,missingDrugs}=assemble([raw('0001',2.5),raw(' opd001 ',3.5),raw('OPD001',2.5)],masters,mappings);
  assert.deepEqual(missingDrugs,[]);assert.equal(rows.length,1);
  assert.deepEqual(rows[0],{RequisitionNo:'ER22102026',Room:'ห้องยา ER',orderitemcode:'0001',orderitemname:'Master name',orderqty:'8',Pack:'1 x 10',dosageunitcode:'TAB',INV_Code:'00123',drugform:'Tablet'});
});
test('ER distinguishes missing master from other categories, retains repeated missing rows, uses blank mapping fallback and native zero packs',()=>{
  const source=[raw('0001',1),raw('MISSING',2,'Missing one'),raw('MISSING',3,'Missing two')];
  const result=assemble(source,[{...master,sendF3F4:0}]);assert.equal(result.rows.length,0);assert.equal(result.missingDrugs.length,2);
  assert.equal(assemble([raw('0001',1)],[master],[{mc_id:'0001',Sum_MCID:''}]).rows.length,1);
  assert.equal(assemble([raw('0001',0)],[{...master,pack:0}]).rows[0].Pack,'NaN x 0');
  assert.equal(assemble([raw('0001',1),raw('0001',2)],[{...master,pack:0}]).rows[0].Pack,'Infinity x 0');
  assert.throws(()=>assemble([raw('0001',1),raw('0001',2)],[{...master,pack:''}]),/Invalid saved/);
  assert.throws(()=>assemble([raw('0001',2147483647),raw('0001',1)]),/Invalid saved/);
});
test('ER reader never probes MySQL while disabled; enabled source uses calendar dates while IPD uses the native before-08 round',async()=>{
  let enabled=false,opdCalls=0;const calls=[];
  const reader=createRequisitionErReader({opdEnabled:()=>enabled,queryOpd:async(sql,params)=>{opdCalls++;assert.equal(sql,opdSql);assert.deepEqual(params,[filters.from,filters.to]);return [raw('ALIAS',3.5)];},queryMssql:async(sql,params)=>{
    calls.push({sql,params});return {recordset:sql===rowsSql?[raw('0001',2.5)]:sql===masterSql?[master]:[{mc_id:'ALIAS',Sum_MCID:'0001'}]};
  }});
  const partial=await reader.getRequisitionErReport(filters,new Date('2026-10-22T00:00:00Z'));
  assert.equal(opdCalls,0);assert.equal(partial.sourceWarning,opdDisabled);assert.equal(partial.rows[0].orderqty,'2');assert.equal(partial.noSourceRows,false);
  assert.deepEqual(calls[0].params,{start:'2026-10-20 08:00:00',end:'2026-10-21 07:59:00'});
  enabled=true;const complete=await reader.getRequisitionErReport(filters,now);
  assert.equal(opdCalls,1);assert.equal(complete.sourceWarning,'');assert.equal(complete.rows[0].orderqty,'6');
});
test('ER filters all four categories after conversion and flags source failure without silently declaring a complete report',async()=>{
  for(const [kind,scope] of Object.entries(requisitionKinds)){
    assert.equal(assemble([raw('ALIAS',5)],[{...master,sendStore:scope.sendStore,sendF3F4:scope.sendF3F4??99}],[{mc_id:'ALIAS',Sum_MCID:'0001'}],kind).rows.length,1);
  }
  const reader=createRequisitionErReader({opdEnabled:()=>true,queryOpd:async()=>{throw Error('private connection detail');},queryMssql:async()=>({recordset:[]})});
  const result=await reader.getRequisitionErReport(filters,now);assert.equal(result.sourceWarning,opdUnavailable);assert.equal(result.noSourceRows,true);
  await assert.rejects(()=>reader.getRequisitionErReport({...filters,kind:'constructor'},now),/Invalid requisition kind/);
});
test('ER PDFs preserve A4 requisition / Letter missing-drug paper sizes and support warning metadata',async()=>{
  const data={...assemble([raw('0001',2),raw('MISSING',1)]),sourceWarning:opdDisabled};
  const main=await createRequisitionIpdPdf(data,now),missing=await createRequisitionMissingPdf(data,now);
  assert.deepEqual((await PDFDocument.load(main.buffer)).getPage(0).getSize(),{width:595,height:842});
  assert.deepEqual((await PDFDocument.load(missing)).getPage(0).getSize(),{width:612,height:792});
});
test('ER preview API is authenticated/read-only, keeps native source-empty versus category-empty behavior, and returns same-search PDFs/missing rows',async(t)=>{
  let reads=0,data={...assemble([raw('0001',2),raw('MISSING',1)]),sourceWarning:opdDisabled,noSourceRows:false};
  const server=createApp({repository:{getRequisitionErReport:async()=>{reads++;return data;}},jwtSecret:'er-test'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'er-test');
  const send=({body=filters,auth=true,method='POST',path='preview'}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-er/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await send({auth:false})).status,401);
  for(const extra of [{departmentcode:'004'},{rows:[master]},{opdEnabled:true},{kind:'__proto__'}])assert.equal((await send({body:{...filters,...extra}})).status,400);
  assert.equal(reads,0);const response=await send(),result=await response.json();assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(result.rows,1);assert.equal(result.missingDrugs.length,1);assert.equal(result.sourceWarning,opdDisabled);assert.ok(Buffer.from(result.pdf,'base64').subarray(0,4).equals(Buffer.from('%PDF')));assert.ok(result.missingPdf);
  data={rows:[],missingDrugs:[],sourceWarning:'',noSourceRows:false};const categoryEmpty=await (await send()).json();assert.ok(categoryEmpty.pdf);assert.equal(categoryEmpty.rows,0);assert.equal(categoryEmpty.message,undefined);
  data={...data,noSourceRows:true};const sourceEmpty=await (await send()).json();assert.equal(sourceEmpty.pdf,null);assert.equal(sourceEmpty.message,'ไม่พบข้อมูลใบสั่งยา');
  for(const method of ['PUT','PATCH','DELETE'])assert.equal((await send({method})).status,403);assert.equal((await send({path:'save'})).status,403);
});
