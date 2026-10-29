const {requisitionKinds,requisitionWindow,assembleRequisitionRows}=require('./reportRequisitionIpd');
// ucUD.IPD / StatusBT=btnDC uses both pharmacy departments, printed home
// orders only. sendmachine does not qualify an unprinted D/C detail row.
const rowsSql=`SELECT pt.orderitemcode,pt.orderitemname,SUM(CAST(pt.orderqty AS DEC(10,2))) AS orderqty,
  mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  FROM dbo.prescriptiondetail pt LEFT JOIN dbo.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode
  WHERE (pt.departmentcode='005' OR pt.departmentcode='001') AND pt.printstatus='1'
    AND pt.ordertype='1' AND mdr.sendStore=@sendStore
    AND (@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4)
    AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  ORDER BY pt.orderitemname ASC OPTION (RECOMPILE);`;
function assembleRequisitionDcRows(rows,now=new Date()){
  return assembleRequisitionRows(rows,now,{prefix:'DC',room:'ห้องยา D/C'});
}
function createRequisitionDcReader(query){
  return {async getRequisitionDcReport(filters,now=new Date()){
    if(!Object.hasOwn(requisitionKinds,filters.kind))throw Error('Invalid requisition kind');
    const kind=requisitionKinds[filters.kind];
    const params={...requisitionWindow(filters.from,filters.to,now),sendStore:kind.sendStore,sendF3F4:kind.sendF3F4};
    const result=await query(rowsSql,params);
    return {rows:assembleRequisitionDcRows(result.recordset,now),filters};
  }};
}
module.exports={rowsSql,assembleRequisitionDcRows,createRequisitionDcReader};
