const fs=require('node:fs'),path=require('node:path');
const {assembleRequisitionFixedStockRows}=require('../back/services/reportRequisitionFixedStock');
const {createRequisitionIpdPdf}=require('../back/services/reportRequisitionIpdPdf');
const root=path.join(__dirname,'../tmp/pdfs');fs.mkdirSync(root,{recursive:true});
const now=new Date('2026-10-23T02:00:00Z');
(async()=>{
  const sample=Array.from({length:6},(_,i)=>({orderitemcode:`SYN00${i+1}`,orderitemname:`Synthetic Fixed Stock Medicine ${i+1}`,orderqty:(i+1)*11,pack:'10',orderunitcode:'TAB',Inventorycode:`INV00${i+1}`,drugform:i<3?'Injection':'Tablet'}));
  const report=await createRequisitionIpdPdf({rows:assembleRequisitionFixedStockRows(sample,now)},now);fs.writeFileSync(path.join(root,'requisition-fixed-stock-sample.pdf'),report.buffer);
  const raw=Array.from({length:120},(_,i)=>({orderitemcode:`FS${String(i+1).padStart(3,'0')}`,orderitemname:`FS-MED-${String(i+1).padStart(3,'0')} ยาจำลอง Fixed Stock ${i%30===0?'ชื่อยายาวและข้อความครบ '.repeat(8)+'END-FS-MED':''}`,orderqty:i+0.5,pack:'10',orderunitcode:'TAB',Inventorycode:`INV${i+1}`,drugform:['Injection','Tablet','External'][i%3]}));
  const stress=await createRequisitionIpdPdf({rows:assembleRequisitionFixedStockRows(raw,now)},now);fs.writeFileSync(path.join(root,'requisition-fixed-stock-stress.pdf'),stress.buffer);
  console.log(JSON.stringify({samplePages:report.pageCount,stressRows:raw.length,stressPages:stress.pageCount}));
})().catch(error=>{console.error(error);process.exitCode=1;});
