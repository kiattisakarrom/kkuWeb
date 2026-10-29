const {createHash}=require('node:crypto');

const ivModes={
  'ward-wait':{label:'แยกหอผู้ป่วย',total:false,sent:false},
  'total-wait':{label:'รวมหอผู้ป่วย',total:true,sent:false},
  'ward-sent':{label:'ส่งหอผู้ป่วยแล้ว',total:false,sent:true},
  'total-sent':{label:'ส่งรวมหอผู้ป่วยแล้ว',total:true,sent:true},
};
const text=(value)=>value==null?'':String(value).trim();
const approvalCodesSql=`SELECT ISNULL(RTRIM(orderitemcode),'') FROM dbo.ms_drug_approvetype WHERE approvetypecode='7'
 UNION ALL SELECT '' WHERE NOT EXISTS(SELECT 1 FROM dbo.ms_drug_approvetype WHERE approvetypecode='7')`;
function kindWhere(kind) {
  if(!['iv','individual'].includes(kind)) throw Error('Invalid IV report kind');
  return `pc.orderitemcode ${kind==='iv'?'NOT IN':'IN'} (${approvalCodesSql})`;
}
function scopeWhere(filters,{date=true,status=true,ward=false}={}) {
  const mode=ivModes[filters.mode];
  if(!mode) throw Error('Invalid IV report mode');
  return `pc.sendmix='Y' AND ${kindWhere(filters.kind)}
    ${status?`AND pc.IVStatus IS ${mode.sent?'NOT ':''}NULL`:''}
    ${date?'AND pc.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)':''}
    ${ward?'AND pc.wardcode=@wardCode':''}`;
}
function wardsSql(filters) {
  return `SELECT pc.wardcode, pc.wardname, COUNT(DISTINCT pc.prescriptionno) AS count
    FROM dbo.prescription pc WHERE ${scopeWhere(filters)} GROUP BY pc.wardcode,pc.wardname;`;
}
function headersSql(filters) {
  return `SELECT pc.prescriptionno,pc.hn,pc.an,pc.patientname,pc.wardcode,pc.wardname,
    pc.bedcode,pc.ordertype,pd.dischargeddate,pa.DCdatetime
    FROM dbo.prescription pc
    LEFT JOIN dbo.ms_patientDischarge pd ON pc.hn=pd.hn AND pc.an=pd.an
    LEFT JOIN dbo.ms_patientadmit pa ON pc.hn=pa.hn AND pc.an=pa.an
    WHERE ${scopeWhere(filters,{ward:!ivModes[filters.mode].total})}
    GROUP BY pc.prescriptionno,pc.hn,pc.an,pc.patientname,pc.wardcode,pc.wardname,
      pc.bedcode,pc.ordertype,pd.dischargeddate,pa.DCdatetime
    ORDER BY pc.prescriptionno;`;
}
function itemsSql(filters) {
  return `SELECT pc.orderitemcode,pc.orderitemname,pc.voiddatetime,pc.holddatetime,
    CONVERT(float,pc.dosage) AS dosage,CONVERT(float,pc.orderqty) AS orderqty,pc.timecode,pc.freetext2
    FROM dbo.prescription pc WHERE ${scopeWhere(filters,{date:false})}
      AND pc.prescriptionno=@prescriptionno AND pc.hn=@hn AND pc.an=@an AND pc.wardcode=@selectedWard
    ORDER BY pc.voiddatetime ASC;`;
}
function pdfRowsSql(filters,selectionSize=1) {
  if(!Number.isInteger(selectionSize)||selectionSize<1||selectionSize>200) throw Error('Invalid IV PDF selection size');
  // Bind each number separately so SQL Server can seek the prescription index.
  return `SELECT pc.prescriptionno,pc.seq,pc.patientname,pc.hn,pc.an,pc.wardcode,
    ('['+pc.wardcode+'] '+pc.wardname) AS wardname,pc.prioritycode,pc.orderitemcode,
    pc.orderitemname,pc.pharmacyitemdesc,dr.genericname,pc.groupdrug,pc.diluentadd,
    pc.voiddatetime,pc.holddatetime,CONVERT(float,pc.orderqty) AS orderqty,pc.orderunitcode,
    CONVERT(float,pc.dosage) AS dosage,pc.dosageunitcode,pc.instructiondesc,
    pc.frequencydesc,pc.timedesc,pc.freetext3,pc.meditemindex,pa.DCdatetime,
    dil.withoutVolname,CONVERT(varchar(10),held.EndDate,23) AS holdEndDate
    FROM dbo.prescription pc
    LEFT JOIN dbo.ms_patientDischarge pd ON pc.hn=pd.hn AND pc.an=pd.an
    LEFT JOIN dbo.ms_patientadmit pa ON pc.hn=pa.hn AND pc.an=pa.an
    LEFT JOIN dbo.ms_drug dr ON pc.orderitemcode=dr.orderitemcode
    OUTER APPLY(SELECT TOP 1 d.withoutVolname FROM dbo.ms_diluentname d
      WHERE d.orderitemcode=pc.orderitemcode) dil
    OUTER APPLY(SELECT TOP 1 al.EndDate FROM dbo.ms_Allow al
      WHERE al.meditemindex=pc.meditemindex AND al.AllowStatus='Hold') held
    WHERE ${scopeWhere(filters,{date:false,status:false})}
      AND pc.prescriptionno IN (${Array.from({length:selectionSize},(_,i)=>`@rx${i}`).join(',')})
    ORDER BY pc.prioritycode ASC,pc.prescriptionno ASC,pc.groupdrug ASC;`;
}
function headerKey(row) {
  return createHash('sha256').update(JSON.stringify([
    row.prescriptionno,row.hn,row.an,row.patientname,row.wardcode,row.wardname,
    row.bedcode,row.ordertype,row.dischargeddate,row.DCdatetime,
  ])).digest('base64url');
}
function assembleHeaders(rows,total) {
  return rows.map((row)=>({
    id:headerKey(row),...Object.fromEntries(['prescriptionno','hn','an','patientname','wardcode','ordertype'].map((key)=>[key,text(row[key])])),
    wardname:total?`[${text(row.wardcode)}] ${text(row.wardname)}`:text(row.wardname),
    status:row.DCdatetime?'ผู้ป่วยจำหน่าย':'Admit',
  }));
}
function assembleItems(rows) {
  return rows.map((row)=>({
    ...Object.fromEntries(['orderitemcode','dosage','orderqty','timecode','freetext2'].map((key)=>[key,text(row[key])])),
    orderitemname:(row.voiddatetime?'[OFF] ':row.holddatetime?'[HOLD] ':'')+text(row.orderitemname),
  }));
}
function bangkokClock(now=new Date()) {
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(({type,value})=>[type,value]));
  return {day:`${p.year}-${p.month}-${p.day}`,after08:Number(p.hour+p.minute)>800};
}
function assemblePdfRows(rows,kind,now=new Date()) {
  const clock=bangkokClock(now);
  const result=[];
  const groups=new Map();
  const name=(row)=>{
    const base=kind==='iv'&&text(row.genericname)?text(row.genericname):text(row.withoutVolname)||text(row.orderitemname);
    const prefix=row.voiddatetime?'[OFF] ':row.holddatetime?'[HOLD] ':'';
    const extra=row.holdEndDate&&text(row.holdEndDate)<=clock.day&&clock.after08?'[HOLD] ':'';
    return extra+prefix+base;
  };
  const dose=(row)=>`${text(row.dosage)} ${text(row.dosageunitcode)}`;
  const usage=(row)=>`${text(row.instructiondesc)} ${text(row.frequencydesc)} ${text(row.timedesc)}  (${text(row.orderqty)} ${text(row.orderunitcode)})`;
  for(const row of rows) {
    const group=kind==='iv'?text(row.groupdrug):'';
    const key=JSON.stringify([row.prescriptionno,row.hn,row.an,row.wardcode,group]);
    if(group&&groups.has(key)) {groups.get(key).push(row);continue;}
    const components=[row];result.push(components);
    if(group) groups.set(key,components);
  }
  return result.map((components)=>{
    const first=components[0],last=components.at(-1);
    return {
      prescriptionno:text(first.prescriptionno),an:text(first.an),patientname:text(first.patientname),wardname:text(first.wardname),
      status:first.DCdatetime?'***ผู้ป่วยจำหน่าย***':'Admit',username:text(last.pharmacyitemdesc),freetext3:text(last.freetext3),
      orderitemname:components.map((row,i)=>`${name(row)}   ${i?text(row.diluentadd)+' ':''}${dose(row)}`).join(' + '),
      dosage:usage(first),
    };
  });
}
const error=(code)=>Object.assign(new Error(code),{code});
function createIvReportReader(query) {
  const params=(filters,wardCode)=>({start:filters.start,end:filters.end,...(!ivModes[filters.mode].total?{wardCode}:{})});
  async function getHeaders(filters,wardCode) {
    return assembleHeaders((await query(headersSql(filters),params(filters,wardCode))).recordset,ivModes[filters.mode].total);
  }
  return {
    async getIvReportWards(filters) {
      return (await query(wardsSql(filters),{start:filters.start,end:filters.end})).recordset
        .map((row)=>({code:text(row.wardcode),name:`[${text(row.wardcode)}] ${text(row.wardname)}`,count:row.count}))
        .sort((a,b)=>a.code.localeCompare(b.code,'en',{numeric:true}));
    },
    getIvReportHeaders:getHeaders,
    async getIvReportItems(filters,wardCode,headerId) {
      const header=(await getHeaders(filters,wardCode)).find((row)=>row.id===headerId);
      if(!header) throw error('IV_REPORT_SELECTION_CHANGED');
      const items=assembleItems((await query(itemsSql(filters),{
        prescriptionno:header.prescriptionno,hn:header.hn,an:header.an,selectedWard:header.wardcode,
      })).recordset);
      return {header,items};
    },
    async getIvReportPdfData(filters,wardCode,ids) {
      const headers=await getHeaders(filters,wardCode);
      const selected=ids.map((id)=>headers.find((row)=>row.id===id));
      if(selected.some((row)=>!row)) throw error('IV_REPORT_SELECTION_CHANGED');
      const rx=[...new Set(selected.map((row)=>row.prescriptionno))];
      const rows=(await query(pdfRowsSql(filters,rx.length),Object.fromEntries(rx.map((value,i)=>[`rx${i}`,value])))).recordset;
      if(rx.some((prescriptionno)=>!rows.some((row)=>text(row.prescriptionno)===prescriptionno))) throw error('IV_REPORT_SELECTION_CHANGED');
      for(const row of rows) {
        const matches=selected.filter((header)=>header.prescriptionno===text(row.prescriptionno));
        if(!matches.length||matches.some((h)=>h.hn!==text(row.hn)||h.an!==text(row.an)||h.wardcode!==text(row.wardcode)))
          throw error('IV_REPORT_AMBIGUOUS_PATIENT');
      }
      return {mode:filters.mode,kind:filters.kind,rows:assemblePdfRows(rows,filters.kind)};
    },
  };
}
module.exports={ivModes,approvalCodesSql,scopeWhere,wardsSql,headersSql,itemsSql,pdfRowsSql,headerKey,assembleHeaders,assembleItems,assemblePdfRows,createIvReportReader};
