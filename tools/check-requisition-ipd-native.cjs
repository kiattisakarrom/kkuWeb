// Manual, read-only SQL comparison. Run from back/ with the supplied native
// Interface directory. No DB rows, drug names or credentials are printed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {sql,pool}=require('../back/models/db');
const scopes={
  ipd:{module:'Ipd',where:"pt.departmentcode='001' AND (pt.sendmachine='Y' OR pt.printstatus='1') AND pt.ordertype IN ('0','3')"},
  dc:{module:'Dc',where:"(pt.departmentcode='005' OR pt.departmentcode='001') AND pt.printstatus='1' AND pt.ordertype='1'"},
  iv:{module:'Iv',where:'pt.IVStatus IS NOT NULL'},
  'fixed-stock':{module:'FixedStock',where:"pt.departmentcode='018' AND (pt.sendmachine='Y' OR pt.printstatus='1') AND pt.ordertype IN ('0','3')"},
  ivrad:{module:'IvRad',where:"pt.departmentcode='006'"},
};
const scope=Object.hasOwn(scopes,process.argv[3])?process.argv[3]:'ipd',spec=scopes[scope];
const {requisitionWindow,requisitionKinds}=require('../back/services/reportRequisitionIpd');
const {rowsSql}=require(`../back/services/reportRequisition${spec.module}`);
const source=fs.readFileSync(path.join(process.argv[2],'ctx/class/clsRequisition.vb'),'utf8');
const block=source.split(`Public Function ${scope==='iv'?'getUsageDrugIV':'getUsageDrug'}(`)[1].split('End Function')[0];
const query=async(text,params)=>{
  await pool.connect();const request=pool.request();
  for(const [key,value] of Object.entries(params))request.input(key,key.startsWith('send')?sql.Int:sql.VarChar(32),value);
  return (await request.query(text)).recordset;
};
function nativeSql(condition){
  return [...block.matchAll(/^\s*sb.Append\((.*?)\)\s*$/gm)].map(match=>[...match[1].matchAll(/"((?:[^"]|"")*)"|\bcondition\b|vbCrLf/g)].map(token=>token[1]!==undefined?token[1].replace(/""/g,'"'):token[0]==='condition'?condition:'\n').join('')).join('');
}
const canonical=rows=>rows.map(row=>JSON.stringify(row)).sort();
(async()=>{
  const targetDate=process.argv[4]||'2026-10-21';
  const clock=process.argv[5]==='now'?new Date():new Date(process.argv[5]||'2026-10-22T02:00:00Z');
  const window=requisitionWindow(targetDate,targetDate,clock);
  for(const [kind,values] of Object.entries(requisitionKinds)){
    const params={...window,sendStore:values.sendStore,sendF3F4:values.sendF3F4};
    const department=spec.where;
    const where=`WHERE ${department} AND mdr.sendStore=@sendStore ${values.sendF3F4===null?'':'AND mdr.sendF3F4=@sendF3F4'} AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)`;
    const original=await query(nativeSql(where),params),updated=await query(rowsSql,params);
    assert.equal(original.length,updated.length);
    // Normalize case of projected property names, not their stored values.
    const normalize=rows=>rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key.toLowerCase(),value])));
    assert.deepEqual(canonical(normalize(updated)),canonical(normalize(original)));
    console.log(JSON.stringify({scope,date:targetDate,kind,matched:true,rows:updated.length}));
  }
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>pool.close());
