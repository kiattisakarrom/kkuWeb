const {requisitionKinds,requisitionWindow,assembleRequisitionRows}=require('./reportRequisitionIpd');
// tsIV -> btnIV -> ucUD.IV() -> getUsageDrugIV(). This native query uses
// prescription, not prescriptiondetail, and includes any non-null IVStatus.
const rowsSql=`SELECT pt.orderitemcode,pt.orderitemname,SUM(CAST(pt.orderqty AS DEC(10,2))) AS orderqty,
  mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  FROM dbo.prescription pt LEFT JOIN dbo.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode
  WHERE pt.IVStatus IS NOT NULL AND mdr.sendStore=@sendStore
    AND (@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4)
    AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  ORDER BY pt.orderitemname ASC OPTION (RECOMPILE);`;
function assembleRequisitionIvRows(rows,now=new Date()){
  return assembleRequisitionRows(rows,now,{prefix:'IV',room:'ห้องเตรียมยาอาคารเภสัชกรรม'});
}
function createRequisitionIvReader(query){
  return {async getRequisitionIvReport(filters,now=new Date()){
    if(!Object.hasOwn(requisitionKinds,filters.kind))throw Error('Invalid requisition kind');
    const kind=requisitionKinds[filters.kind];
    const params={...requisitionWindow(filters.from,filters.to,now),sendStore:kind.sendStore,sendF3F4:kind.sendF3F4};
    const result=await query(rowsSql,params);
    return {rows:assembleRequisitionIvRows(result.recordset,now),filters};
  }};
}
module.exports={rowsSql,assembleRequisitionIvRows,createRequisitionIvReader};
