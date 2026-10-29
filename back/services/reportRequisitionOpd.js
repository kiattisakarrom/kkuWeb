const {assembleRequisitionRows,requisitionKinds}=require('./reportRequisitionIpd');
const {masterSql,mappingSql,requisitionDrugLookup}=require('./reportRequisitionEr');
const text=value=>value==null?'':String(value).trim();
function assembleOpdRequisitionRows(rawRows,masterRows,mappingRows,kind,now,report){
  const lookup=requisitionDrugLookup(masterRows,mappingRows,kind),selectedRows=[],missingDrugs=[];
  for(const raw of rawRows){
    const original=text(raw.orderitemcode),{drug,missing}=lookup(original);
    if(missing)missingDrugs.push({orderitemcode:original,orderitemname:text(raw.orderitemname)});
    // ucUD.OPD() adds a new row for EACH source code. Unlike ER(), aliases
    // that resolve to one master code are not merged or repacked together.
    if(drug)selectedRows.push({...drug,orderitemname:drug.orderitemENname,orderqty:raw.orderqty});
  }
  // Format the print-day number once per report, not once per medicine.
  // Preserve one output row and one CInt/pack calculation per source code.
  const rows=assembleRequisitionRows(selectedRows,now,report);
  return {rows:rows.sort((a,b)=>a.orderitemname.localeCompare(b.orderitemname,'th',{sensitivity:'accent'})),missingDrugs};
}
function createOpdRequisitionReader({queryMssql,queryOpd,opdEnabled=()=>false,report}){
  return {async getReport(filters,now=new Date()){
    if(!Object.hasOwn(requisitionKinds,filters.kind))throw Error('Invalid requisition kind');
    const unavailable=sourceWarning=>({rows:[],missingDrugs:[],filters,sourceReady:false,sourceWarning});
    // Prepared only by default: no MySQL probe and no unnecessary master read.
    if(!opdEnabled())return unavailable(report.sourceDisabled);
    let rawRows;
    try{rawRows=await queryOpd(report.opdSql,[filters.from,filters.to]);}
    catch{return unavailable(report.sourceUnavailable);}
    if(!rawRows.length)return {rows:[],missingDrugs:[],filters,sourceReady:true,sourceWarning:'',message:'ไม่พบข้อมูล'};
    const [master,mapping]=await Promise.all([queryMssql(masterSql,{}),queryMssql(mappingSql,{})]);
    return {...assembleOpdRequisitionRows(rawRows,master.recordset,mapping.recordset,filters.kind,now,report),filters,sourceReady:true,sourceWarning:''};
  }};
}
module.exports={assembleOpdRequisitionRows,createOpdRequisitionReader};
