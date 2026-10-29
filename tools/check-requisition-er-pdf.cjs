const fs=require('node:fs'),path=require('node:path');
const {assembleRequisitionErRows,opdDisabled}=require('../back/services/reportRequisitionEr');
const {createRequisitionIpdPdf}=require('../back/services/reportRequisitionIpdPdf');
const {createRequisitionMissingPdf}=require('../back/services/reportRequisitionMissingPdf');
const root=path.join(__dirname,'../tmp/pdfs');fs.mkdirSync(root,{recursive:true});
const now=new Date('2026-10-22T02:00:00Z');
(async()=>{
  const masters=Array.from({length:120},(_,i)=>({orderitemcode:`ER${String(i+1).padStart(3,'0')}`,orderitemENname:`ER-MED-${String(i+1).padStart(3,'0')} ยาจำลอง ${i%30===0?'ทดสอบชื่อยายาวและข้อความครบ '.repeat(8)+'END-ER-MED':''}`,pack:'10',orderunitcode:'TAB',Inventorycode:`INV${i+1}`,drugform:['Injection','Tablet','External'][i%3],sendStore:1,sendF3F4:1}));
  const raw=masters.map((m,i)=>({orderitemcode:m.orderitemcode,orderqty:i+0.5}));
  const full=assembleRequisitionErRows(raw,masters,[],'floor4',now);
  const sample=await createRequisitionIpdPdf({rows:full.rows.slice(0,6)},now);
  fs.writeFileSync(path.join(root,'requisition-er-sample.pdf'),sample.buffer);
  const stress=await createRequisitionIpdPdf({...full,sourceWarning:opdDisabled},now);
  fs.writeFileSync(path.join(root,'requisition-er-stress.pdf'),stress.buffer);
  const missing=Array.from({length:90},(_,i)=>({orderitemcode:`MISS${i+1}`,orderitemname:`MISSING-MED-${String(i+1).padStart(3,'0')} ยาจำลอง ${i%30===0?'ชื่อยายาว '.repeat(25)+'END-MISSING-MED':''}`}));
  fs.writeFileSync(path.join(root,'requisition-er-missing.pdf'),await createRequisitionMissingPdf({missingDrugs:missing,sourceWarning:opdDisabled},now));
  console.log(JSON.stringify({samplePages:sample.pageCount,stressRows:full.rows.length,stressPages:stress.pageCount,missingRows:missing.length}));
})().catch(error=>{console.error(error);process.exitCode=1;});
