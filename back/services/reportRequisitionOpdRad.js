const {assembleOpdRequisitionRows,createOpdRequisitionReader}=require('./reportRequisitionOpd');
// tsOPDRAD -> btnOPDRAD -> ucUD.OPD() -> getDrugOPD(). Calendar dates,
// OPD42 only; never combine IPD details or merge distinct source aliases.
const opdSql=`SELECT t.drugcode AS orderitemcode,t.drugname AS orderitemname,
  IFNULL(SUM(CAST(t.no AS DEC(10,2))),0) AS orderqty,t.unit AS orderunitcode
  FROM (SELECT drugcode,drugname,no,unit FROM view_pharmacy_opd_drug_item
    WHERE location='OPD42' AND inv_type != '9' AND \`Date\` BETWEEN ? AND ?) AS t GROUP BY t.drugcode;`;
const sourceDisabled='ยังไม่เปิดข้อมูลห้องยา OPD อาคารรังสีจาก MySQL จึงยังแสดงยอดใบเบิกไม่ได้';
const sourceUnavailable='อ่านข้อมูลห้องยา OPD อาคารรังสีจาก MySQL ไม่ได้ จึงยังแสดงยอดใบเบิกไม่ได้';
const report={prefix:'OPDRAD',room:'ห้องยา OPD อาคารรังสี',opdSql,sourceDisabled,sourceUnavailable};
function assembleRequisitionOpdRadRows(rows,master,mapping,kind,now=new Date()){
  return assembleOpdRequisitionRows(rows,master,mapping,kind,now,report);
}
function createRequisitionOpdRadReader(dependencies){
  const reader=createOpdRequisitionReader({...dependencies,report});
  return {getRequisitionOpdRadReport:reader.getReport};
}
module.exports={opdSql,sourceDisabled,sourceUnavailable,assembleRequisitionOpdRadRows,createRequisitionOpdRadReader};
