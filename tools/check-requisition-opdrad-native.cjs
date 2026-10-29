// Offline native SQL/dispatch/metadata parity. No DB libraries or connections.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {opdSql}=require('../back/services/reportRequisitionOpdRad');
const root=process.argv[2],read=file=>fs.readFileSync(path.join(root,file),'utf8');
const block=read('ctx/class/clsRequisition.vb').split('Public Function getDrugOPD(')[1].split('End Function')[0];
const condition="WHERE location='OPD42' AND inv_type != '9' AND Date BETWEEN ? AND ?";
const original=[...block.matchAll(/^\s*sb.Append\((.*?)\)\s*$/gm)].map(match=>[...match[1].matchAll(/"((?:[^"]|"")*)"|\bcondition\b|vbCrLf/g)].map(token=>token[1]!==undefined?token[1].replace(/""/g,'"'):token[0]==='condition'?condition:'\n').join('')).join('');
const normalize=text=>text.replace(/[`;\s]/g,'').toLowerCase();assert.equal(normalize(opdSql),normalize(original));
const form=read('ctx/Requisition/ucUD.vb'),opd=form.split('Private Sub OPD()')[1].split('Private Sub ER()')[0];
assert.match(form,/Case "btnER_OPD", "btnOPDRAD"[^\r\n]*\r?\n\s*OPD\(\)/);
assert.match(opd,/Case "btnOPDRAD"\s+condition &= "location = 'OPD42'"/);
assert.match(opd,/r\("RequisitionNo"\) = "OPDRAD" & Date.Now.ToString\("ddMMyyyy"/);
assert.match(opd,/r\("Room"\) = "ห้องยา OPD อาคารรังสี"/);
assert.match(read('frmMain.Designer.vb'),/Me.tsOPDRAD.Text = "ห้องยา OPD อาคารรังสี"/);
assert.match(read('frmMain.vb'),/Private Sub tsOPDRAD_Click[\s\S]*?StatusBT = "btnOPDRAD"/);
console.log(JSON.stringify({source:'tsOPDRAD / ucUD.OPD / getDrugOPD',sqlMatched:true,metadataMatched:true,databasesContacted:0}));
