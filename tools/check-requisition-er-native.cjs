// Read-only comparison with the native getUsageDrug SQL; never contacts MySQL.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {sql,pool}=require('../back/models/db');
const {requisitionKinds,requisitionWindow}=require('../back/services/reportRequisitionIpd');
const {rowsSql,masterSql,mappingSql,assembleRequisitionErRows}=require('../back/services/reportRequisitionEr');
const source=fs.readFileSync(path.join(process.argv[2],'ctx/class/clsRequisition.vb'),'utf8');
const block=source.split('Public Function getUsageDrug(')[1].split('End Function')[0];
const now=new Date('2026-10-22T02:00:00Z'),params=requisitionWindow('2026-10-21','2026-10-21',now);
const condition="WHERE pt.departmentcode='004' AND pt.printstatus='1' AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)";
const nativeSql=[...block.matchAll(/^\s*sb.Append\((.*?)\)\s*$/gm)].map(match=>[...match[1].matchAll(/"((?:[^"]|"")*)"|\bcondition\b|vbCrLf/g)].map(token=>token[1]!==undefined?token[1].replace(/""/g,'"'):token[0]==='condition'?condition:'\n').join('')).join('');
async function query(text,bindings={}){await pool.connect();const request=pool.request();for(const [key,value] of Object.entries(bindings))request.input(key,sql.VarChar(32),value);return (await request.query(text)).recordset;}
const canonical=rows=>rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).map(([key,value])=>[key.toLowerCase(),value])))).sort();
(async()=>{
  const [native,updated,master,mapping]=await Promise.all([query(nativeSql,params),query(rowsSql,params),query(masterSql),query(mappingSql)]);
  assert.deepEqual(canonical(updated),canonical(native));console.log(JSON.stringify({source:'ER IPD only',matched:true,rawRows:updated.length}));
  for(const kind of Object.keys(requisitionKinds)){
    const result=assembleRequisitionErRows(updated,master,mapping,kind,now);
    console.log(JSON.stringify({kind,rows:result.rows.length,missing:result.missingDrugs.length,zeroPack:result.rows.filter(row=>/Infinity|NaN/.test(row.Pack)).length}));
  }
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>pool.close());
