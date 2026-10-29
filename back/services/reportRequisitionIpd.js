const { dayOffset } = require('./ipdScreening');
const text=value=>value==null?'':String(value).trim();
const requisitionKinds={
  hospital:{label:'รพ.ผลิตเอง',sendStore:1,sendF3F4:0},
  antibiotic:{label:'ยาฆ่าเชื้อ',sendStore:1,sendF3F4:2},
  floor4:{label:'ส่งใบเบิกชั้น 4',sendStore:1,sendF3F4:1},
  narcotic:{label:'ยาเสพติด',sendStore:2,sendF3F4:null},
};
const rowsSql=`SELECT pt.orderitemcode,pt.orderitemname,SUM(CAST(pt.orderqty AS DEC(10,2))) AS orderqty,
  mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  FROM dbo.prescriptiondetail pt LEFT JOIN dbo.ms_drug mdr ON pt.orderitemcode=mdr.orderitemcode
  WHERE pt.departmentcode='001' AND (pt.sendmachine='Y' OR pt.printstatus='1')
    AND pt.ordertype IN ('0','3') AND mdr.sendStore=@sendStore
    AND (@sendF3F4 IS NULL OR mdr.sendF3F4=@sendF3F4)
    AND pt.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  GROUP BY pt.orderitemcode,pt.orderitemname,mdr.drugform,mdr.orderunitcode,mdr.Inventorycode,mdr.pack
  ORDER BY pt.orderitemname ASC OPTION (RECOMPILE);`;

function bangkokParts(now){
  return Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(part=>[part.type,part.value]));
}
function requisitionWindow(from,to,now=new Date()){
  const beforeEight=Number(bangkokParts(now).hour)<8;
  return {start:`${beforeEight?dayOffset(from,-1):from} 08:00:00`,end:`${beforeEight?to:dayOffset(to,1)} 07:59:00`};
}
// VB CInt rounds ties to even, unlike Math.round. Preserve the checked Int32
// conversion before division; do not round the pack count or quantity in SQL.
function nativeInteger(value){
  const raw=text(value).replace(/,/g,'');
  const number=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)?Number(raw):NaN;
  const lower=Math.floor(number),fraction=number-lower;
  const integer=fraction===0.5?(lower%2===0?lower:lower+1):Math.round(number);
  if(!Number.isFinite(integer)||integer < -2147483648||integer > 2147483647)throw Error('Invalid saved requisition quantity or pack');
  return Object.is(integer,-0)?0:integer;
}
function assembleRequisitionRows(rawRows,now=new Date(),{prefix='UD',room='ห้องยา IPD'}={}){
  const {day,month,year}=bangkokParts(now),number=`${prefix}${day}${month}${year}`;
  return rawRows.map(row=>{
    const quantity=nativeInteger(row.orderqty),pack=text(row.pack);
    return {RequisitionNo:number,Room:room,orderitemcode:text(row.orderitemcode),orderitemname:text(row.orderitemname),
      orderqty:String(quantity),Pack:pack?`${Math.ceil(quantity/nativeInteger(pack))} x ${pack}`:String(quantity),
      dosageunitcode:text(row.orderunitcode),INV_Code:text(row.Inventorycode),drugform:text(row.drugform)||'อื่นๆ'};
  });
}
function groupRequisitionRows(rows){
  const ordered=[...rows].sort((a,b)=>a.drugform.localeCompare(b.drugform,'en',{sensitivity:'accent'}));
  const groups=[];
  ordered.forEach((row,index)=>{
    let group=groups.at(-1);
    if(!group||group.drugform.localeCompare(row.drugform,'en',{sensitivity:'accent'})!==0){group={drugform:row.drugform,rows:[]};groups.push(group);}
    group.rows.push({...row,no:index+1});
  });
  return groups;
}
function createRequisitionIpdReader(query){
  return {async getRequisitionIpdReport(filters,now=new Date()){
    const kind=requisitionKinds[filters.kind];if(!kind)throw Error('Invalid requisition kind');
    const params={...requisitionWindow(filters.from,filters.to,now),sendStore:kind.sendStore,sendF3F4:kind.sendF3F4};
    const result=await query(rowsSql,params);
    return {rows:assembleRequisitionRows(result.recordset,now),filters};
  }};
}
module.exports={requisitionKinds,rowsSql,bangkokParts,requisitionWindow,nativeInteger,assembleRequisitionRows,groupRequisitionRows,createRequisitionIpdReader};
