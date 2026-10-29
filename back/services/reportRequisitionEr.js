const {requisitionKinds,requisitionWindow,nativeInteger,assembleRequisitionRows}=require('./reportRequisitionIpd');
const text=value=>value==null?'':String(value).trim();
const key=value=>text(value).toLocaleLowerCase('en');
// btnER calls ER(), not the unused btnER branch inside IPD(). Category
// filtering happens after changordercode, against the cached drug master.
const rowsSql=`SELECT pt.orderitemcode,pt.orderitemname,SUM(CAST(pt.orderqty AS DEC(10,2))) AS orderqty,
  mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  FROM dbo.prescriptiondetail pt LEFT JOIN dbo.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode
  WHERE pt.departmentcode='004' AND pt.printstatus='1'
    AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  ORDER BY pt.orderitemname ASC OPTION (RECOMPILE);`;
const masterSql=`SELECT orderitemcode,orderitemENname,drugform,orderunitcode,Inventorycode,
  ISNULL(pack,0) AS pack,sendStore,sendF3F4,unused FROM dbo.ms_drug;`;
const mappingSql='SELECT mc_id,Sum_MCID FROM dbo.drugname;';
// Keep the native calendar-date range, inv_type != 9, and GROUP BY code.
// Do not apply the IPD 08:00 window or invent an ordertype/status predicate.
const opdSql=`SELECT t.drugcode AS orderitemcode,t.drugname AS orderitemname,
  IFNULL(SUM(CAST(t.no AS DEC(10,2))),0) AS orderqty,t.unit AS orderunitcode
  FROM (SELECT drugcode,drugname,no,unit FROM view_pharmacy_opd_drug_item
    WHERE location='ER' AND inv_type != '9' AND \`Date\` BETWEEN ? AND ?) AS t GROUP BY t.drugcode;`;
const opdDisabled='ข้อมูลเฉพาะ IPD — ยังไม่เปิดข้อมูล OPD (MySQL) ยอดใบเบิก ER ยังไม่ครบ';
const opdUnavailable='ข้อมูลเฉพาะ IPD — อ่านข้อมูล OPD (MySQL) ไม่ได้ ยอดใบเบิก ER ยังไม่ครบ';
function requisitionDrugLookup(masterRows,mappingRows,kind){
  if(!Object.hasOwn(requisitionKinds,kind))throw Error('Invalid requisition kind');
  const scope=requisitionKinds[kind],mapping=new Map(),master=new Map(),selected=new Map();
  for(const row of mappingRows)if(!mapping.has(key(row.mc_id)))mapping.set(key(row.mc_id),text(row.Sum_MCID));
  for(const row of masterRows){
    const code=key(row.orderitemcode);
    if(!master.has(code))master.set(code,row);
    if(Number(row.sendStore)===scope.sendStore&&(scope.sendF3F4===null||row.sendF3F4!=null&&Number(row.sendF3F4)===scope.sendF3F4)&&!selected.has(code))selected.set(code,row);
  }
  return original=>{
    const code=key(mapping.get(key(original))||original);
    return {code,drug:selected.get(code),missing:!master.has(code)};
  };
}
function assembleRequisitionErRows(rawRows,masterRows,mappingRows,kind,now=new Date()){
  const lookup=requisitionDrugLookup(masterRows,mappingRows,kind);
  const merged=new Map(),missingDrugs=[];
  for(const raw of rawRows){
    const original=text(raw.orderitemcode),{code,drug,missing}=lookup(original);
    if(missing)missingDrugs.push({orderitemcode:original,orderitemname:text(raw.orderitemname)});
    if(!drug)continue;
    const quantity=nativeInteger(raw.orderqty),existing=merged.get(code),pack=text(drug.pack);
    if(existing){
      // Native rounds each source row before adding, then always divides by
      // pack on the duplicate-code branch (including 0 / invalid blanks).
      const total=nativeInteger(nativeInteger(existing.orderqty)+quantity);
      existing.orderqty=String(total);existing.Pack=`${Math.ceil(total/nativeInteger(pack))} x ${pack}`;
    }else{
      merged.set(code,assembleRequisitionRows([{...drug,orderitemname:drug.orderitemENname,orderqty:quantity}],now,{prefix:'ER',room:'ห้องยา ER'})[0]);
    }
  }
  return {rows:[...merged.values()].sort((a,b)=>a.orderitemname.localeCompare(b.orderitemname,'th',{sensitivity:'accent'})),missingDrugs};
}
function createRequisitionErReader({queryMssql,queryOpd,opdEnabled=()=>false}){
  return {async getRequisitionErReport(filters,now=new Date()){
    if(!Object.hasOwn(requisitionKinds,filters.kind))throw Error('Invalid requisition kind');
    const [ipd,master,mapping]=await Promise.all([
      queryMssql(rowsSql,requisitionWindow(filters.from,filters.to,now)),queryMssql(masterSql,{}),queryMssql(mappingSql,{})
    ]);
    let opdRows=[],sourceWarning='';
    if(!opdEnabled())sourceWarning=opdDisabled;
    else{
      try{opdRows=await queryOpd(opdSql,[filters.from,filters.to]);}
      catch{sourceWarning=opdUnavailable;}
    }
    const rawRows=[...ipd.recordset,...opdRows];
    return {...assembleRequisitionErRows(rawRows,master.recordset,mapping.recordset,filters.kind,now),
      filters,sourceWarning,noSourceRows:rawRows.length===0};
  }};
}
module.exports={rowsSql,masterSql,mappingSql,opdSql,opdDisabled,opdUnavailable,requisitionDrugLookup,assembleRequisitionErRows,createRequisitionErReader};
