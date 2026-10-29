const {requisitionKinds,requisitionWindow,assembleRequisitionRows}=require('./reportRequisitionIpd');
// tsRAddict -> btnAddict -> ucUD.IPD(): pharmacy 018, sent OR printed,
// order types 0/3. All four category choices remain available as in Windows.
const rowsSql=`SELECT pt.orderitemcode,pt.orderitemname,SUM(CAST(pt.orderqty AS DEC(10,2))) AS orderqty,
  mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  FROM dbo.prescriptiondetail pt LEFT JOIN dbo.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode
  WHERE pt.departmentcode='018' AND (pt.sendmachine='Y' OR pt.printstatus='1')
    AND pt.ordertype IN ('0','3') AND mdr.sendStore=@sendStore
    AND (@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4)
    AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  ORDER BY pt.orderitemname ASC OPTION (RECOMPILE);`;
function assembleRequisitionFixedStockRows(rows,now=new Date()){
  return assembleRequisitionRows(rows,now,{prefix:'AD',room:'ห้องจ่ายยาเสพติด และ Fixed Stock'});
}
function createRequisitionFixedStockReader(query){
  return {async getRequisitionFixedStockReport(filters,now=new Date()){
    if(!Object.hasOwn(requisitionKinds,filters.kind))throw Error('Invalid requisition kind');
    const kind=requisitionKinds[filters.kind];
    const params={...requisitionWindow(filters.from,filters.to,now),sendStore:kind.sendStore,sendF3F4:kind.sendF3F4};
    const result=await query(rowsSql,params);
    return {rows:assembleRequisitionFixedStockRows(result.recordset,now),filters};
  }};
}
module.exports={rowsSql,assembleRequisitionFixedStockRows,createRequisitionFixedStockReader};
