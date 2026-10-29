const fs=require('node:fs');
const path=require('node:path');
const {createWorkloadReportPdf}=require('../back/services/reportWorkloadPdf');
const root=path.join(__dirname,'../tmp/pdfs');fs.mkdirSync(root,{recursive:true});
const filters={from:'2026-10-01',to:'2026-10-21',userId:''};
const groups=['Screening_WL','Checkout','LED','HAD','Medication Reconcile','กลุ่มการดูแลทดสอบ','ADR monitoring','Cancer Care','D/C counselling','Drug Reconciliation'];
(async()=>{
  let count=0;const rows=[];
  for(let user=1;user<=3;user++)for(const care of groups)rows.push({Usercreatecode:String(user),Fname:`ผู้ทดสอบ 0${user}`,GroupOfCare:care,CAn:++count});
  rows.push({Usercreatecode:'04',Fname:'ผู้ทดสอบ 04',GroupOfCare:'Checkout',CAn:100});
  rows.push({Usercreatecode:'05',Fname:'ผู้ทดสอบ 01',GroupOfCare:'Checkout',CAn:100});
  const sample=await createWorkloadReportPdf({rows,filters},new Date('2026-10-21T03:00:00Z'));
  fs.writeFileSync(path.join(root,'workload-web-sample.pdf'),sample.buffer);
  const large=[];
  for(let user=1;user<=80;user++)for(let care=0;care<groups.length;care++)large.push({Usercreatecode:String(user),Fname:`SYN-USER-${String(user).padStart(3,'0')}${user%15===0?' ทดสอบชื่อยาวและการตัดบรรทัด '.repeat(4)+'END-NAME':''}`,GroupOfCare:groups[care],CAn:user*100+care});
  const stress=await createWorkloadReportPdf({rows:large,filters},new Date('2026-10-21T03:00:00Z'));
  fs.writeFileSync(path.join(root,'workload-web-stress.pdf'),stress.buffer);
  console.log(JSON.stringify({samplePages:sample.pageCount,stressPages:stress.pageCount,rows:80,columns:10,expectedCells:large.length}));
})().catch(error=>{console.error(error);process.exitCode=1;});
