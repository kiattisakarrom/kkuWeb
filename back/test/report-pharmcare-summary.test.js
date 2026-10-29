const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {PDFDocument}=require('pdf-lib');
const {createApp}=require('../app');
const {pharmcareSummaryFilters}=require('../routes/reportPharmcareSummaryRoutes');
const {columns,summarySql,assembleSummaryRows,summarySnapshot,sortSummaryRows,createPharmcareSummaryReader}=require('../services/reportPharmcareSummary');
const {bands,pharmcareSummaryPdfDefinition,createPharmcareSummaryPdf}=require('../services/reportPharmcareSummaryPdf');
const ExcelJS=require('exceljs');
const {createPharmcareSummaryExcel,headers:excelHeaders}=require('../services/reportPharmcareSummaryExcel');
const filters={from:'2026-10-01',to:'2026-10-21',type:'IPD'};
const row=Object.fromEntries(columns.map(([key])=>[key,`SYN-${key}`]));

test('Pharmcare summary keeps all 43 ordered native headers, duplicate captions and column widths in both builds',()=>{
  assert.equal(columns.length,43);assert.equal(new Set(columns.map(([key])=>key)).size,43);
  assert.deepEqual(require('../../front/src/components/reports/pharmcareSummaryColumns.json'),columns);
  assert.deepEqual(columns.slice(0,8).map(([,title])=>title),['วันที่','HN','AN','ชื่อผู้ป่วย','เพศ','Admit','รหัส','หอผู้ป่วย']);
  assert.deepEqual(columns.slice(-4).map(([,title])=>title),['ผู้เกี่ยวข้อง','ผู้รายงาน','Pharmacist Note','Plan']);
  assert.equal(columns.filter(([,title])=>title==='DRP').length,2);
  assert.equal(columns.filter(([,title])=>title==='รหัสยา').length,2);
  assert.equal(columns.find(([key])=>key==='causeDrug')[2],350);
});
test('Pharmcare summary validates true date ranges, IPD/OPD and optional export sort/snapshot; forbids ward/room and payload injection',()=>{
  assert.deepEqual(pharmcareSummaryFilters(filters),filters);
  assert.ok(pharmcareSummaryFilters({...filters,type:'OPD'}));
  for(const change of [{from:'2026-02-30'},{from:[]},{from:'2026-10-22'},{type:[]},{type:'ER'},{wardCode:'1'},{roomCode:'001'},{sql:'x'}])assert.equal(pharmcareSummaryFilters({...filters,...change}),null);
  assert.ok(pharmcareSummaryFilters({...filters,snapshot:'A'.repeat(43)},true));
  for(const change of [{snapshot:['A'.repeat(43)]},{snapshot:'x'},{sortKey:'constructor',sortDirection:'asc'},{sortKey:'hn'},{sortDirection:'asc'},{rows:[row]}])assert.equal(pharmcareSummaryFilters({...filters,snapshot:'A'.repeat(43),...change},true),null);
});
test('Pharmcare summary reproduces native detail/header/patient joins, date-only filter and restricted master mappings without fallback labels or row multiplication',()=>{
  assert.match(summarySql,/INNER JOIN dbo\.ms_drpheader dh ON dt\.OrderNo=dh\.OrderNo/);
  assert.match(summarySql,/LEFT JOIN dbo\.ms_patient pt ON dh\.HN=pt\.hn/);
  assert.match(summarySql,/dh\.TypeOfPt=@type AND dt\.OrderCreatedate BETWEEN CAST\(@from AS date\) AND CAST\(@to AS date\)/);
  assert.match(summarySql,/ORDER BY dt\.OrderCreatedate ASC/);
  assert.equal((summarySql.match(/OUTER APPLY/g)||[]).length,17);
  assert.match(summarySql,/x\.userID<>'0201'/);assert.match(summarySql,/x\.departmentcode<>'000'/);
  assert.match(summarySql,/ISNULL\(x\.GeneralChemo,'N'\)='N'/);
  assert.match(summarySql,/x\.\[fullname\]/);assert.match(summarySql,/x\.\[orderitemENname\]/);
  assert.doesNotMatch(summarySql,/COALESCE|username|orderitemTHname|wardstatus|roomcode|DISTINCT|GROUP BY|mysql|\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i);
});
test('Pharmcare summary preserves zero values, raw flags/codes, blank lookups and duplicate detail rows',()=>{
  const raw={...row,sex:0,newCase:false,preventable:0,no:0,pharmacist:null,causeDrug:'',process:'2',drp:'Y'};
  const rows=assembleSummaryRows([raw,raw]);assert.equal(rows.length,2);
  assert.equal(rows[0].sex,'0');assert.equal(rows[0].newCase,'False');assert.equal(rows[0].preventable,'0');assert.equal(rows[0].no,'0');
  assert.equal(rows[0].pharmacist,'');assert.equal(rows[0].causeDrug,'');assert.equal(rows[0].process,'2');assert.equal(rows[0].drp,'Y');
});
test('Pharmcare snapshots tolerate SQL tie ordering but retain duplicate counts and detect changed fields; sort uses native displayed strings',()=>{
  const a={...row,no:'2'},b={...row,no:'10'};
  assert.equal(summarySnapshot([a,b]),summarySnapshot([b,a]));
  assert.notEqual(summarySnapshot([a]),summarySnapshot([a,a]));
  assert.notEqual(summarySnapshot([a]),summarySnapshot([{...a,plan:'changed'}]));
  assert.deepEqual(sortSummaryRows([a,b],'no','asc').map(row=>row.no),['10','2']);
  assert.deepEqual(sortSummaryRows([a,b],'no','desc').map(row=>row.no),['2','10']);
  assert.deepEqual([a,b].map(row=>row.no),['2','10']);assert.throws(()=>sortSummaryRows([a],'unknown','asc'));
});
test('Pharmcare summary performs one parameterized read for all detail/master fields, with no per-row queries',async()=>{
  const calls=[];const reader=createPharmcareSummaryReader(async(sql,params)=>{calls.push({sql,params});return {recordset:[row,row]};});
  const result=await reader.getPharmcareSummary(filters);assert.equal(calls.length,1);assert.deepEqual(calls[0].params,filters);
  assert.equal(result.rows.length,2);assert.equal(result.snapshot,summarySnapshot(result.rows));
});
test('Pharmcare PDF includes every native column across five readable A3 bands and repeats patient identity plus row links',async()=>{
  const all=new Set(bands.flatMap(band=>band.indices));assert.equal(all.size,43);
  for(const band of bands)assert.deepEqual(band.indices.slice(0,4),[0,1,2,3]);
  const definition=pharmcareSummaryPdfDefinition({rows:[row],filters});
  assert.deepEqual(definition.pageSize,{width:1190.55,height:841.89});assert.equal(definition.content.length,5);
  for(const part of definition.content){assert.equal(part.table.headerRows,2);assert.equal(part.table.body[2][0].text,'1');}
  const pdf=await createPharmcareSummaryPdf({rows:[row],filters});assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
  assert.equal((await PDFDocument.load(pdf)).getPageCount(),5);
});

test('Pharmcare Excel preserves native unique export headers, all 43 columns, all rows, Thai notes and literal text including leading zeros and formula-like values',async()=>{
  const rows=Array.from({length:70},(_,i)=>Object.fromEntries(columns.map(([key])=>[key,`${i}-${key}`])));
  Object.assign(rows[0],{hn:'0000123',an:'00000456',no:'0',pharmacist:'',pharmacistNote:'บันทึกภาษาไทย\nบรรทัดที่สอง',plan:'=1+1'});
  const buffer=await createPharmcareSummaryExcel({rows});
  assert.equal(buffer.subarray(0,2).toString(),'PK');
  const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(buffer);
  assert.equal(workbook.worksheets.length,1);const sheet=workbook.getWorksheet('Pharmcare');
  assert.equal(sheet.rowCount,71);assert.equal(sheet.columnCount,43);
  assert.deepEqual(sheet.getRow(1).values.slice(1),excelHeaders);
  assert.equal(new Set(excelHeaders).size,43);
  assert.deepEqual(excelHeaders.slice(23,28),['Problem','รหัสยา1','DrugCause','รหัสยา2','DrugDispense']);
  assert.deepEqual(excelHeaders.slice(-2),['PharmacistNote','Plan']);
  rows.forEach((row,index)=>columns.forEach(([key],column)=>{
    const cell=sheet.getCell(index+2,column+1);
    assert.equal(cell.value??'',row[key]);assert.equal(cell.formula,undefined);
  }));
  assert.equal(sheet.getCell('B2').numFmt,'@');
  assert.equal(sheet.views[0].ySplit,1);assert.ok(sheet.getTable('Pharmcare'));
});
test('Pharmcare summary API authenticates, returns 43-field rows and snapshot, validates exports, detects staleness, handles empty data and forbids writes',async(t)=>{
  let rows=[row],calls=0;const repository={getPharmcareSummary:async()=>{calls++;return {rows,snapshot:summarySnapshot(rows)};}};
  const server=createApp({repository,jwtSecret:'pharmcare-summary-tests'}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'pharmcare-summary-tests');
  const send=(path,{method='GET',body,auth=true,query=filters}={})=>fetch(`http://127.0.0.1:${server.address().port}/api/reports/pharmcare-summary/${path}${method==='GET'?'?'+new URLSearchParams(query):''}`,{method,headers:{...(auth?{Authorization:`Bearer ${token}`} :{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  assert.equal((await send('rows',{auth:false})).status,401);
  assert.equal((await send('xlsx',{method:'POST',body:{},auth:false})).status,401);
  assert.equal((await send('rows',{query:{...filters,roomCode:'001'}})).status,400);assert.equal(calls,0);
  const response=await send('rows');assert.equal(response.status,200);const data=await response.json();assert.equal(Object.keys(data.rows[0]).length,43);
  const input={...filters,snapshot:data.snapshot,sortKey:'date',sortDirection:'asc'};
  assert.equal((await send('pdf',{method:'POST',body:{...input,rows:[row]}})).status,400);
  const pdf=await send('pdf',{method:'POST',body:input});assert.equal(pdf.status,200);assert.match(pdf.headers.get('content-type'),/application\/pdf/);assert.equal(pdf.headers.get('cache-control'),'no-store');
  assert.equal((await send('xlsx',{method:'POST',body:{...input,rows:[row]}})).status,400);
  rows=[{...row,hn:'2'},{...row,hn:'1'}];
  const xlsx=await send('xlsx',{method:'POST',body:{...input,snapshot:summarySnapshot(rows),sortKey:'hn'}});
  assert.equal(xlsx.status,200);assert.match(xlsx.headers.get('content-type'),/application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/);
  assert.equal(xlsx.headers.get('content-disposition'),'attachment; filename="Pharmcare-Summary.xlsx"');assert.equal(xlsx.headers.get('cache-control'),'no-store');
  const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(Buffer.from(await xlsx.arrayBuffer()));
  assert.equal(workbook.getWorksheet('Pharmcare').getCell('B2').value,'1');assert.equal(workbook.getWorksheet('Pharmcare').getCell('B3').value,'2');
  rows=[{...row,plan:'changed'}];assert.equal((await send('pdf',{method:'POST',body:input})).status,409);
  assert.equal((await send('xlsx',{method:'POST',body:input})).status,409);
  rows=[];assert.equal((await send('pdf',{method:'POST',body:{...filters,snapshot:summarySnapshot(rows)}})).status,404);
  assert.equal((await send('xlsx',{method:'POST',body:{...filters,snapshot:summarySnapshot(rows)}})).status,404);
  for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await send('rows',{method,body:{}})).status,403);
});
