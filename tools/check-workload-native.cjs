// Read-only comparison against the SQL StringBuilder in the Windows source.
// Run manually from back/; never import this from the application or unit tests.
const fs = require('node:fs');
const path = require('node:path');
const nativeRoot = process.argv[2];
if (!nativeRoot) throw Error('Pass the native Interface directory');
const { sql, pool } = require('../back/models/db');
const { createWorkloadReportReader, workloadWindow, mergeWorkloadRows } = require('../back/services/reportWorkload');
const source = fs.readFileSync(path.join(nativeRoot, 'ctx/class/cls_Worklaod.vb'), 'utf8');
const query = async (text, params) => {
  await pool.connect(); const request = pool.request();
  for (const [key,value] of Object.entries(params)) request.input(key,sql.VarChar(32),value);
  return request.query(text);
};
function nativeSql(name, condition, condition2) {
  const block=source.split(`Public Function ${name}(`)[1].split('End Function')[0];
  return [...block.matchAll(/sb.Append\((.*?)\)\s*$/gm)].map(match=>{
    const expression=match[1].trim();
    if(expression.startsWith('"'))return expression.match(/^"(.*?)"/)[1]+'\n';
    return (expression.startsWith('condition2')?condition2:condition)+'\n';
  }).join('');
}
const canonical=rows=>rows.map(row=>JSON.stringify(row)).sort();
(async()=>{
  const filters={from:'2026-10-21',to:'2026-10-21',userId:''};
  const now=new Date('2026-10-21T03:00:00Z'),window=workloadWindow(filters.from,filters.to,now);
  const params={...filters,...window};
  const condition='AND p.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)';
  const activityWhere='WHERE NOT (ISNULL(t1.Screen,0)=0 AND ISNULL(t2.Checkout,0)=0 AND ISNULL(t3.LED,0)=0 AND ISNULL(t4.HAD,0)=0)';
  const careWhere="WHERE dh.GroupOfCareCd IS NOT NULL AND dh.Usercreatecode IS NOT NULL AND dh.TypeOfPt='IPD' AND dh.[DateD/C] BETWEEN CAST(@from AS datetime) AND CAST(@to AS datetime)";
  const nativeBatch=nativeSql('Get_WPGrOfCare',careWhere,'')+nativeSql('getworkload',condition,activityWhere)+nativeSql('getworkload_bak',condition,activityWhere);
  const start=Date.now();
  const original=mergeWorkloadRows((await query(nativeBatch,params)).recordsets);
  const updated=(await createWorkloadReportReader(query).getWorkloadReport(filters,now)).rows;
  require('node:assert/strict').deepEqual(canonical(updated),canonical(original));
  // Selected-user mode includes zero-valued workload categories even without
  // activity. Keep the same native source conditions for the comparison.
  const selected={...filters,userId:updated[0].Usercreatecode};
  const selectedBatch=nativeSql('Get_WPGrOfCare',careWhere+' AND u.userID=@userId','')
    +nativeSql('getworkload',condition,'WHERE u.userID=@userId')
    +nativeSql('getworkload_bak',condition,'WHERE u.userID=@userId');
  const originalSelected=mergeWorkloadRows((await query(selectedBatch,{...params,userId:selected.userId})).recordsets);
  const updatedSelected=(await createWorkloadReportReader(query).getWorkloadReport(selected,now)).rows;
  require('node:assert/strict').deepEqual(canonical(updatedSelected),canonical(originalSelected));
  console.log(JSON.stringify({matched:true,rows:updated.length,selectedRows:updatedSelected.length,total:updated.reduce((sum,row)=>sum+row.CAn,0),elapsedMs:Date.now()-start}));
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>pool.close());
