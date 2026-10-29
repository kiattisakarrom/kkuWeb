const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {ivReportFilters}=require('../routes/reportIvAdmixtureRoutes');
const {ivModes,wardsSql,headersSql,itemsSql,pdfRowsSql,headerKey,assembleHeaders,assembleItems,assemblePdfRows,createIvReportReader}=require('../services/reportIvAdmixture');
const {createIvAdmixturePdf,ivPdfDefinition}=require('../services/reportIvAdmixturePdf');

const input={mode:'ward-wait',kind:'iv',from:'2026-10-21',to:'2026-10-21',startTime:'00:00',endTime:'23:59'};
const filters=ivReportFilters(input);
const savedHeader={prescriptionno:'SYN-RX',hn:'SYN-HN',an:'SYN-AN',patientname:'ผู้ป่วยทดสอบ',wardcode:'1',wardname:'หอทดสอบ',bedcode:'A',ordertype:0,dischargeddate:null,DCdatetime:null};
const saved={...savedHeader,wardname:'[1] หอทดสอบ',seq:1,prioritycode:'C',orderitemcode:'SYN-D',orderitemname:'Saved brand',genericname:'GENERIC',dosage:0,orderqty:10,dosageunitcode:'MG',orderunitcode:'TAB',instructiondesc:'รับประทาน',frequencydesc:'วันละครั้ง',timedesc:'หลังอาหาร',timecode:'0800',freetext2:'คำอธิบายที่บันทึก',freetext3:'บันทึกเพิ่มเติม',pharmacyitemdesc:'ผู้บันทึกเดิม'};

test('IV filters validate all modes, classification, true calendar dates and native inclusive minute boundaries',()=>{
  for(const mode of Object.keys(ivModes)) assert.ok(ivReportFilters({...input,mode}));
  assert.equal(filters.start,'2026-10-21 00:00:00');assert.equal(filters.end,'2026-10-21 23:59:00');
  for(const changes of [{mode:'constructor'},{mode:[]},{kind:'other'},{from:'2026-02-30'},{from:[]},{startTime:'24:00'},{endTime:'23:59:59'},
    {from:'2026-10-22'},{startTime:'23:59',endTime:'00:00'},{roomCode:'001'},{sql:'x'}]) assert.equal(ivReportFilters({...input,...changes}),null);
  assert.ok(ivReportFilters({...input,from:'2024-02-29',to:'2024-03-01'}));
});
test('IV wards/headers use native sendmix Y, IVStatus and approval type 7 without active-ward, pharmacy, Off/Hold or quantity exclusions',()=>{
  for(const mode of Object.keys(ivModes)) {
    const f={...filters,mode};
    const expected=ivModes[mode].sent?/pc\.IVStatus IS NOT NULL/:/pc\.IVStatus IS NULL/;
    for(const query of [wardsSql(f),headersSql(f)]) {
      assert.match(query,expected);assert.match(query,/pc\.sendmix='Y'/);
      assert.match(query,/pc\.ordercreatedate BETWEEN CAST\(@start AS datetime\) AND CAST\(@end AS datetime\)/);
      assert.match(query,/NOT IN[\s\S]*approvetypecode='7'/);
      assert.doesNotMatch(query,/voiddatetime IS NULL|holddatetime IS NULL|orderqty\s*>|wardstatus|roomcode/i);
    }
    assert.equal(headersSql(f).includes('pc.wardcode=@wardCode'),!ivModes[mode].total);
    assert.match(headersSql({...f,kind:'individual'}),/pc\.orderitemcode IN/);
  }
  assert.match(wardsSql(filters),/COUNT\(DISTINCT pc.prescriptionno\)/);
  assert.match(wardsSql(filters),/ISNULL\(RTRIM\(orderitemcode\),''\)/);
  assert.match(wardsSql(filters),/UNION ALL SELECT '' WHERE NOT EXISTS/);
});
test('IV detail rows use timecode as native usage code and freetext2 as description, with Off preceding Hold and zero quantities retained',()=>{
  const rows=assembleItems([saved,{...saved,voiddatetime:'x',holddatetime:'x'},{...saved,holddatetime:'x',orderqty:0}]);
  assert.equal(rows[0].timecode,'0800');assert.equal(rows[0].freetext2,'คำอธิบายที่บันทึก');assert.equal(rows[0].dosage,'0');
  assert.equal(rows[1].orderitemname,'[OFF] Saved brand');assert.equal(rows[2].orderitemname,'[HOLD] Saved brand');assert.equal(rows[2].orderqty,'0');
  assert.doesNotMatch(itemsSql(filters),/ordercreatedate|@start|@end/);
  assert.match(itemsSql(filters),/pc\.hn=@hn AND pc\.an=@an AND pc\.wardcode=@selectedWard/);
});
test('IV view columns follow each native designer including Ordertype only in ward-sent and no drug table in sent modes',async()=>{
  const {ivModes:frontModes,ivWardColumns,ivDrugColumns,ivDrugColumnsFor,ivHeaderColumns}=await import('../../front/src/components/reports/ivAdmixtureFormat.js');
  assert.deepEqual(frontModes,ivModes);
  assert.deepEqual(ivWardColumns.map(([,label])=>label),['หอผู้ป่วย','จำนวน']);
  assert.deepEqual(ivDrugColumns.map(([,label])=>label),['รหัสยา','ชื่อยา','Dose','QTY','รหัสวิธีใช้','คำอธิบายวิธีใช้']);
  assert.equal(ivHeaderColumns('ward-sent')[1][1],'Ordertype');
  assert.deepEqual(Object.keys(frontModes),['ward-wait','ward-sent','total-wait','total-sent']);
  assert.equal(ivDrugColumnsFor('ward-wait').find(([key])=>key==='orderitemname')[2],350);
  assert.equal(ivDrugColumnsFor('total-wait').find(([key])=>key==='orderitemname')[2],400);
  for(const mode of Object.keys(ivModes)) {
    const columns=ivHeaderColumns(mode);
    assert.equal(columns.length,ivModes[mode].total?7:6);
    assert.equal(columns.some(([key])=>key==='wardname'),ivModes[mode].total);
    assert.ok(!columns.some(([key])=>['bedcode','wardcode'].includes(key)));
  }
});
test('IV total basket follows native duplicate rows, removes single entries, and exports unique selections',async()=>{
  const {ivBasketAdd,ivPdfIds}=await import('../../front/src/components/reports/ivAdmixtureFormat.js');
  const first={id:'A'.repeat(43),prescriptionno:'SYN-RX'};
  const basket=ivBasketAdd(ivBasketAdd([],first),first);
  assert.equal(basket.length,2);assert.notEqual(basket[0].entryId,basket[1].entryId);
  assert.deepEqual(ivPdfIds(basket),[first.id]);
  const remaining=basket.filter(item=>item.entryId!==basket[0].entryId);
  assert.equal(remaining.length,1);assert.equal(remaining[0].id,first.id);
});
test('IV header identity preserves native grouping snapshots and uses DCdatetime alone for discharged status',()=>{
  const rows=assembleHeaders([savedHeader,{...savedHeader,dischargeddate:'2026-01-01'},{...savedHeader,DCdatetime:'2026-01-01'}],true);
  assert.equal(rows[0].wardname,'[1] หอทดสอบ');assert.equal(rows[0].ordertype,'0');
  assert.deepEqual(rows.map((row)=>row.status),['Admit','Admit','ผู้ป่วยจำหน่าย']);
  assert.equal(new Set(rows.map((row)=>row.id)).size,3);assert.match(rows[0].id,/^[A-Za-z0-9_-]{43}$/);
});
test('IV PDF preserves native generic/diluent naming, saved author, separate usage and instructions; individual preparation is not grouped',()=>{
  const iv=assemblePdfRows([saved], 'iv',new Date('2026-10-21T02:00:00Z'));
  const individual=assemblePdfRows([{...saved,withoutVolname:'Diluent name'}],'individual');
  assert.equal(iv[0].orderitemname,'GENERIC   0 MG');
  assert.equal(iv[0].dosage,'รับประทาน วันละครั้ง หลังอาหาร  (10 TAB)');
  assert.equal(iv[0].username,'ผู้บันทึกเดิม');assert.equal(iv[0].freetext3,'บันทึกเพิ่มเติม');
  assert.equal(individual[0].orderitemname,'Diluent name   0 MG');
  assert.equal(assemblePdfRows([{...saved,groupdrug:'G'},{...saved,groupdrug:'G'}],'individual').length,2);
});
test('IV PDF mixed medicines stay within prescription/patient and preserve all components, including groups of three and saved Off/Hold',()=>{
  const rows=[{...saved,groupdrug:'G'}, {...saved,groupdrug:'G',genericname:'SECOND',dosage:2,diluentadd:'+',voiddatetime:'x'},
    {...saved,groupdrug:'G',genericname:'THIRD',dosage:3,holddatetime:'x'},
    {...saved,groupdrug:'G',prescriptionno:'OTHER',an:'OTHER-AN'}];
  const result=assemblePdfRows(rows,'iv',new Date('2026-10-21T02:00:00Z'));
  assert.equal(result.length,2);assert.match(result[0].orderitemname,/GENERIC.*\+.*\[OFF\] SECOND.*\+.*\[HOLD\] THIRD/);
  assert.equal(result[1].prescriptionno,'OTHER');assert.equal(result[1].an,'OTHER-AN');
  assert.equal(result[1].orderitemname,'GENERIC   0 MG');
});
test('IV PDF Hold approval flag uses native end-day and strictly-after-08:00 condition without changing data',()=>{
  const row={...saved,holdEndDate:'2026-10-21'};
  assert.equal(assemblePdfRows([row],'iv',new Date('2026-10-21T01:00:59Z'))[0].orderitemname,'GENERIC   0 MG');
  assert.equal(assemblePdfRows([row],'iv',new Date('2026-10-21T01:01:00Z'))[0].orderitemname,'[HOLD] GENERIC   0 MG');
  assert.equal(assemblePdfRows([{...row,holdEndDate:'2026-10-22'}],'iv',new Date('2026-10-21T02:00:00Z'))[0].orderitemname,'GENERIC   0 MG');
});
test('IV readers resolve header context server side, bind all SQL values, distinguish missing selection and batch preview reads',async()=>{
  const calls=[];
  const reader=createIvReportReader(async(query,params)=>{calls.push({query,params});return {recordset:query.includes('GROUP BY pc.prescriptionno')?[savedHeader]:[saved]};});
  const id=headerKey(savedHeader);
  const detail=await reader.getIvReportItems(filters,'1',id);assert.equal(detail.items.length,1);
  assert.deepEqual(calls.at(-1).params,{prescriptionno:'SYN-RX',hn:'SYN-HN',an:'SYN-AN',selectedWard:'1'});
  calls.length=0;
  const pdf=await reader.getIvReportPdfData(filters,'1',[id]);assert.equal(pdf.rows.length,1);assert.equal(calls.length,2);
  assert.deepEqual(calls.at(-1).params,{rx0:'SYN-RX'});
  assert.doesNotMatch(calls.at(-1).query,/pc\.IVStatus|ordercreatedate/);
  const before=calls.length;await assert.rejects(()=>reader.getIvReportItems(filters,'1','unknown'),{code:'IV_REPORT_SELECTION_CHANGED'});
  assert.equal(calls.length,before+1);
  const ambiguous=createIvReportReader(async(query)=>({recordset:query.includes('GROUP BY pc.prescriptionno')?[savedHeader]:[{...saved,hn:'OTHER'}]}));
  await assert.rejects(()=>ambiguous.getIvReportPdfData(filters,'1',[id]),{code:'IV_REPORT_AMBIGUOUS_PATIENT'});
});
test('IV SQL for reads and exports is MSSQL SELECT-only; PDF reuses all saved statuses and batched Hold/diluent data without per-item queries',()=>{
  for(const query of [wardsSql(filters),headersSql(filters),itemsSql(filters),pdfRowsSql(filters)]) {
    assert.doesNotMatch(query,/\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i);
    assert.doesNotMatch(query,/mysql|\.PrintToPrinter|OCS/i);
  }
  assert.match(pdfRowsSql(filters),/OUTER APPLY[\s\S]*ms_diluentname/);
  assert.match(pdfRowsSql(filters),/al\.AllowStatus='Hold'/);
  assert.match(pdfRowsSql(filters,2),/pc\.prescriptionno IN \(@rx0,@rx1\)/);
  assert.throws(()=>pdfRowsSql(filters,0));assert.throws(()=>pdfRowsSql(filters,201));
  assert.doesNotMatch(pdfRowsSql(filters),/pc\.IVStatus|ordercreatedate/);
});
const pdfData={mode:'ward-wait',kind:'iv',rows:assemblePdfRows([saved],'iv')};
test('IV PDF uses each original RPT artwork with hospital logo, native margins, repeated header and uncoloured patient/order groups',async()=>{
  const definition=ivPdfDefinition(pdfData,new Date('2026-10-21T02:00:00Z'));
  assert.equal(definition.info.title,'IV Admixture Report');
  assert.match(definition.content[0].image,/ward-header\.png$/);
  assert.equal(definition.pageMargins[0],9.6);assert.equal(definition.content.at(-1).table.headerRows,2);
  assert.deepEqual(definition.content.at(-1).table.body[1].map((cell)=>cell.text),['ชื่อผู้ป่วย','AN','Medicine','วิธีใช้','เลขที่ใบสั่งยา']);
  assert.equal(definition.content.at(-1).table.body[2][0].fillColor,undefined);
  const total=ivPdfDefinition({...pdfData,mode:'total-sent'});
  assert.match(total.content[0].image,/total-header\.png$/);assert.equal(total.pageMargins[0],18);
  assert.notEqual(definition.content[0].height,total.content[0].height);
  for(const mode of Object.keys(ivModes)) {
    const metadata=require(`../assets/reports/iv/${ivModes[mode].total?'total':'ward'}-layout.json`);
    assert.equal(metadata.sections[0].objects.find(obj=>obj.kind==='PictureObject').name,'Picture2');
  }
  const bytes=await createIvAdmixturePdf(pdfData);
  assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal((await PDFDocument.load(bytes)).getPageCount(),1);
  const many=await PDFDocument.load(await createIvAdmixturePdf({...pdfData,rows:Array.from({length:100},(_,i)=>({...pdfData.rows[0],orderitemname:`ยาทดสอบ ${i+1}`}))}));
  assert.ok(many.getPageCount()>1);
});
test('IV API authenticates, validates mode-specific ward/details, exports PDF without status writes and rejects tampered selection',async(t)=>{
  let fail=false,changed=false;let calls=0;
  const repository={getIvReportWards:async()=>{calls++;if(fail)throw Error('Synthetic failure');return [];},
    getIvReportHeaders:async()=>[],getIvReportItems:async()=>({header:{},items:[]}),
    getIvReportPdfData:async()=>{if(changed)throw Object.assign(Error(),{code:'IV_REPORT_SELECTION_CHANGED'});return pdfData;}};
  const server=createApp({repository,jwtSecret:'iv-report-secret'}).listen(0,'127.0.0.1');await new Promise((resolve)=>server.once('listening',resolve));
  t.after(()=>new Promise((resolve)=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'iv-report-secret');
  const send=(endpoint,data=input,options={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/iv-admixture/${endpoint}${options.body?'':'?'+new URLSearchParams(data)}`,{
    method:options.method||'GET',headers:{...(options.auth===false?{}:{Authorization:`Bearer ${token}`}),'Content-Type':'application/json'},
    body:options.body?JSON.stringify(data):undefined});
  assert.equal((await send('wards',input,{auth:false})).status,401);
  const empty=await send('wards');assert.equal(empty.status,200);assert.deepEqual((await empty.json()).wards,[]);
  const before=calls;
  for(const data of [{...input,mode:'total-wait'},{...input,roomCode:'001'},{...input,startTime:'99:99'}])assert.equal((await send('wards',data)).status,400);
  assert.equal(calls,before);
  assert.equal((await send('prescriptions',input)).status,400);
  assert.equal((await send('prescriptions',{...input,wardCode:'1'})).status,200);
  assert.equal((await send('prescriptions',{...input,mode:'total-sent'})).status,200);
  assert.equal((await send('prescriptions',{...input,mode:'total-wait',wardCode:'1'})).status,400);
  assert.equal((await send('items',{...input,wardCode:'1',headerId:'A'.repeat(43)})).status,200);
  assert.equal((await send('items',{...input,mode:'ward-sent',wardCode:'1',headerId:'A'.repeat(43)})).status,400);
  for(const ids of [[],['x'],['A'.repeat(43),'A'.repeat(43)]])assert.equal((await send('pdf',{...input,wardCode:'1',ids},{method:'POST',body:true})).status,400);
  const response=await send('pdf',{...input,wardCode:'1',ids:['A'.repeat(43)]},{method:'POST',body:true});
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/pdf/);assert.equal(response.headers.get('cache-control'),'no-store');
  changed=true;assert.equal((await send('pdf',{...input,wardCode:'1',ids:['A'.repeat(43)]},{method:'POST',body:true})).status,409);
  for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await send('prescriptions',input,{method,body:true})).status,403);
  fail=true;assert.equal((await send('wards')).status,503);
});
