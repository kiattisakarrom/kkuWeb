const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {createApp}=require('../app');
test('removed standalone ER (OPD) report cannot read either database or generate a PDF',async(t)=>{
  let reads=0;
  const repository={getRequisitionErOpdReport:async()=>{reads++;throw Error('Removed report must never run');}};
  const server=createApp({repository,jwtSecret:'removed-report-test'}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const token=jwt.sign({user:{id:'test'},context:{roomCode:'001'},access:'ipd-readonly',version:2},'removed-report-test');
  for(const path of ['preview','pdf','save']){
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/reports/requisition-er-opd/${path}`,{
      method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:'2026-09-01',to:'2026-09-30',kind:'floor4'})
    });assert.equal(response.status,403);assert.equal(reads,0);
  }
});
