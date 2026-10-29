const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument,PDFName}=require('pdf-lib');
const {createApp}=require('../app');
const {requisitionKinds}=require('../services/reportRequisitionIpd');
const {masterSql,mappingSql}=require('../services/reportRequisitionEr');
const {opdSql,sourceDisabled,sourceUnavailable,assembleRequisitionOpdRadRows,createRequisitionOpdRadReader}=require('../services/reportRequisitionOpdRad');
const now=new Date('2026-10-23T02:00:00Z'),filters={from:'2026-07-01',to:'2026-09-30',kind:'floor4'};
const master={orderitemcode:'0001',orderitemENname:'OPD42 Master medicine',drugform:'Tablet',orderunitcode:'TAB',Inventorycode:'000123',pack:10,sendStore:1,sendF3F4:1,unused:'N'};
const mapping=[{mc_id:'ALIAS-A',Sum_MCID:'0001'},{mc_id:'ALIAS-B',Sum_MCID:'0001'}];
const raw=(code,qty)=>({orderitemcode:code,orderitemname:'Saved OPD42 name',orderqty:qty});
const assemble=(rows,masters=[master],aliases=mapping,kind='floor4')=>assembleRequisitionOpdRadRows(rows,masters,aliases,kind,now);

test('OPDRAD native OPD42 SQL aggregates the whole calendar range once without extra status/category/time predicates',()=>{
  assert.match(opdSql,/FROM view_pharmacy_opd_drug_item\s+WHERE location='OPD42' AND inv_type != '9' AND `Date` BETWEEN \? AND \?/);
  assert.match(opdSql,/IFNULL\(SUM\(CAST\(t.no AS DEC\(10,2\)\)\),0\)/);
  assert.match(opdSql,/GROUP BY t.drugcode/);
  assert.doesNotMatch(opdSql,/location='ER'|prescription|08:00|07:59|sendStore|sendF3F4|ordertype|zzzzzz|LIMIT|DATE\(`Date`\)|INSERT|UPDATE|DELETE/i);
});

test('OPDRAD retains separate source aliases, VB rounding/packs, master names/units and print-day OPDRAD room metadata',()=>{
  const result=assemble([raw('ALIAS-A',24.5),raw('ALIAS-B',25.5)]);
  assert.equal(result.rows.length,2);assert.deepEqual(result.missingDrugs,[]);
  assert.deepEqual(result.rows.map(row=>[row.orderitemcode,row.orderqty,row.Pack]),[['0001','24','3 x 10'],['0001','26','3 x 10']]);
  assert.ok(result.rows.every(row=>row.RequisitionNo==='OPDRAD23102026'&&row.Room==='ห้องยา OPD อาคารรังสี'&&row.orderitemname===master.orderitemENname&&row.dosageunitcode==='TAB'&&row.INV_Code==='000123'));
});

test('OPDRAD preserves first mapping/matching master, all four categories, missing duplicates and native blank/zero pack behavior',()=>{
  const masters=[{...master,sendF3F4:0},master,{...master,orderitemENname:'Later duplicate'}];
  const aliases=[...mapping,{mc_id:'ALIAS-A',Sum_MCID:'BAD'}];
  assert.equal(assemble([raw('ALIAS-A',1)],masters,aliases).rows[0].orderitemname,master.orderitemENname);
  for(const [kind,scope] of Object.entries(requisitionKinds))assert.equal(assemble([raw('ALIAS-A',2)],[{...master,sendStore:scope.sendStore,sendF3F4:scope.sendF3F4??99}],mapping,kind).rows.length,1);
  const missing=assemble([raw('MISSING',1),raw('MISSING',2),raw('0001',3)],[{...master,sendF3F4:0}]);
  assert.equal(missing.rows.length,0);assert.equal(missing.missingDrugs.length,2);
  assert.equal(assemble([raw('0001',2.5)],[{...master,pack:'',drugform:''}]).rows[0].Pack,'2');
  assert.equal(assemble([raw('0001',1)],[{...master,pack:0}]).rows[0].Pack,'Infinity x 0');
  assert.equal(assemble([raw('0001',0)],[{...master,pack:0}]).rows[0].Pack,'NaN x 0');
  assert.throws(()=>assemble([raw('0001',2147483648)]),/Invalid saved/);
});

test('OPDRAD prepared mode never probes either DB and invalid categories fail before any source call',async()=>{
  let calls=0;const query=async()=>{calls++;throw Error('Must not connect');};
  const reader=createRequisitionOpdRadReader({queryMssql:query,queryOpd:query});
  const result=await reader.getRequisitionOpdRadReport(filters,now);
  assert.equal(result.sourceReady,false);assert.equal(result.sourceWarning,sourceDisabled);assert.equal(result.message,undefined);assert.equal(calls,0);
  await assert.rejects(()=>reader.getRequisitionOpdRadReport({...filters,kind:'constructor'},now),/Invalid requisition kind/);assert.equal(calls,0);
});

test('OPDRAD monthly and quarter reads bind the full range, perform exactly one source plus two master reads even for 6000 rows',async()=>{
  const calls=[],source=Array.from({length:6000},(_,i)=>raw(i%2?'ALIAS-A':'ALIAS-B',i+0.5));
  const reader=createRequisitionOpdRadReader({opdEnabled:()=>true,
    queryOpd:async(sql,params)=>{calls.push({sql,params});return source;},
    queryMssql:async(sql,params)=>{calls.push({sql,params});return {recordset:sql===masterSql?[master]:mapping};}
  });
  for(const [from,to] of [['2026-09-01','2026-09-30'],['2026-07-01','2026-09-30']]){
    for(const clock of [new Date('2026-10-23T00:00:00Z'),now]){
      const data=await reader.getRequisitionOpdRadReport({...filters,from,to},clock);assert.equal(data.rows.length,6000);
    }
  }
  assert.equal(calls.length,12);assert.equal(calls.filter(c=>c.sql===opdSql).length,4);
  assert.deepEqual(calls.filter(c=>c.sql===opdSql).map(c=>c.params),[['2026-09-01','2026-09-30'],['2026-09-01','2026-09-30'],['2026-07-01','2026-09-30'],['2026-07-01','2026-09-30']]);
  assert.equal(calls.filter(c=>c.sql===masterSql).length,4);assert.equal(calls.filter(c=>c.sql===mappingSql).length,4);
});

test('OPDRAD distinguishes unreachable MySQL, confirmed no source rows and nonempty source with no selected category',async()=>{
  let state='failed',masterCalls=0;
  const reader=createRequisitionOpdRadReader({opdEnabled:()=>true,queryOpd:async()=>{
    if(state==='failed')throw Error('private details');return state==='empty'?[]:[raw('0001',1)];
  },queryMssql:async(sql)=>{masterCalls++;return {recordset:sql===masterSql?[{...master,sendF3F4:0}]:[]};}});
  const failed=await reader.getRequisitionOpdRadReport(filters,now);assert.equal(failed.sourceReady,false);assert.equal(failed.sourceWarning,sourceUnavailable);assert.equal(masterCalls,0);
  state='empty';const empty=await reader.getRequisitionOpdRadReport(filters,now);assert.equal(empty.sourceReady,true);assert.equal(empty.message,'ไม่พบข้อมูล');assert.equal(masterCalls,0);
  state='category';const category=await reader.getRequisitionOpdRadReport(filters,now);assert.equal(category.rows.length,0);assert.equal(category.message,undefined);assert.equal(masterCalls,2);
});

test('OPDRAD API uses authenticated bounded filters, retains logos and both PDF formats, blocks writes and never fabricates an unavailable PDF',async(t)=>{
  let reads=0,data={...assemble([raw('ALIAS-A',3),raw('MISSING',1)]),sourceReady:true,sourceWarning:''};
  const server=createApp({repository:{getRequisitionOpdRadReport:async()=>{reads++;return data;}},jwtSecret:'opdrad-test'}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'opdrad-test');
  const send=({auth=true,body=filters,method='POST',path='preview'}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-opdrad/${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await send({auth:false})).status,401);
  for(const extra of [{location:'OPD42'},{rows:[raw('0001',1)]},{opdEnabled:true},{kind:'__proto__'},{from:'2026-02-30'}])assert.equal((await send({body:{...filters,...extra}})).status,400);
  assert.equal(reads,0);const response=await send(),result=await response.json();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(result.rows,1);assert.equal(result.missingDrugs.length,1);
  const pdf=await PDFDocument.load(Buffer.from(result.pdf,'base64'));assert.deepEqual(pdf.getPage(0).getSize(),{width:595,height:842});
  assert.ok(pdf.getPage(0).node.Resources().lookup(PDFName.of('XObject')).keys().length>=2);
  assert.deepEqual((await PDFDocument.load(Buffer.from(result.missingPdf,'base64'))).getPage(0).getSize(),{width:612,height:792});
  data={rows:[],missingDrugs:[],sourceReady:true,sourceWarning:'',message:'ไม่พบข้อมูล'};const empty=await(await send()).json();assert.ok(empty.pdf);assert.equal(empty.pages,1);assert.equal(empty.message,'ไม่พบข้อมูล');
  data={rows:[],missingDrugs:[],sourceReady:false,sourceWarning:sourceDisabled};const disabled=await(await send()).json();assert.equal(disabled.pdf,null);assert.equal(disabled.sourceReady,false);assert.equal(disabled.message,undefined);
  for(const method of ['PUT','PATCH','DELETE'])assert.equal((await send({method})).status,403);assert.equal((await send({path:'save'})).status,403);
});
