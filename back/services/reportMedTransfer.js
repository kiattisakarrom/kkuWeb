const {medTransferWindow}=require('./ipdMedTransfer');
const wardsSql=`SELECT wardcode,('['+wardcode+'] '+warddesc) AS name FROM dbo.ms_ward
  ORDER BY CASE WHEN wardcode NOT LIKE '%[^0-9]%' AND LEN(wardcode) BETWEEN 1 AND 9
    THEN CONVERT(int,wardcode) ELSE 2147483647 END,wardcode;`;
// ucReport.get_Medcomplete: preserve groups from saved package data, including
// differences in cart/user/patient snapshots, and the original INNER JOIN.
const rowsSql=`SELECT pm.prescriptionno,pm.patientname,pm.hn,pm.an,pm.wardname,pm.cartname,
    (u.firstname+' '+u.lastname) AS username
  FROM dbo.packagemaster pm INNER JOIN dbo.ms_users u ON u.userID=pm.medtransferuserid
  WHERE pm.wardcode=@wardCode AND pm.medtransferdatetime IS NOT NULL
    AND pm.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  GROUP BY pm.prescriptionno,pm.patientname,pm.hn,pm.an,pm.wardname,pm.cartname,u.firstname,u.lastname
  ORDER BY pm.prescriptionno ASC;`;
const keys=['prescriptionno','hn','an','patientname','wardname','username','cartname'];
const text=value=>value==null?'':String(value).trim();
function assembleMedTransferRows(rows){
  return rows.map((row,index)=>({no:index+1,...Object.fromEntries(keys.map(key=>[key,text(row[key])]))}));
}
function reportMedTransferWindow(date,now=new Date()) {
  return medTransferWindow(date,undefined,now);
}
function createMedTransferReportReader(query){
  return {
    async getMedTransferReportWards(){
      return (await query(wardsSql,{})).recordset.map(row=>({code:text(row.wardcode),name:text(row.name)}));
    },
    async getMedTransferReport({date,wardCode},now=new Date()){
      const window=reportMedTransferWindow(date,now);
      const rows=(await query(rowsSql,{wardCode,start:window.start,end:window.end})).recordset;
      return {rows:assembleMedTransferRows(rows)};
    },
  };
}
module.exports={wardsSql,rowsSql,assembleMedTransferRows,reportMedTransferWindow,createMedTransferReportReader};
