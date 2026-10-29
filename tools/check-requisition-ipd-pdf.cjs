const fs=require('node:fs'),path=require('node:path');
const {assembleRequisitionRows}=require('../back/services/reportRequisitionIpd');
const {createRequisitionIpdPdf}=require('../back/services/reportRequisitionIpdPdf');
const root=path.join(__dirname,'../tmp/pdfs');fs.mkdirSync(root,{recursive:true});
(async()=>{
  const raw=Array.from({length:120},(_,i)=>({orderitemcode:`SYN${String(i+1).padStart(3,'0')}`,orderitemname:`MED-${String(i+1).padStart(3,'0')} ยาจำลอง ${i%30===0?'ทดสอบชื่อยายาวและข้อความครบ '.repeat(8)+'END-MED':''}`,orderqty:i+0.5,pack:'10',orderunitcode:'TAB',Inventorycode:`INV${i+1}`,drugform:['Injection','Tablet','External'][i%3]}));
  const stress=await createRequisitionIpdPdf({rows:assembleRequisitionRows(raw,new Date('2026-10-22T02:00:00Z'))},new Date('2026-10-22T02:00:00Z'));
  fs.writeFileSync(path.join(root,'requisition-web-stress.pdf'),stress.buffer);
  const empty=await createRequisitionIpdPdf({rows:[]},new Date('2026-10-22T02:00:00Z'));
  fs.writeFileSync(path.join(root,'requisition-web-empty.pdf'),empty.buffer);
  console.log(JSON.stringify({stressRows:raw.length,stressPages:stress.pageCount,emptyPages:empty.pageCount}));
})().catch(error=>{console.error(error);process.exitCode=1;});
