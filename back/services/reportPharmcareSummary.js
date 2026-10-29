const {createHash}=require('node:crypto');
const columns=require('../assets/reports/pharmcare-summary/columns.json');
// Match the first row in each native master DataTable, without multiplying
// clinical detail rows if a legacy master contains duplicate codes.
const lookup=(alias,table,code,field,value,extra='')=>`OUTER APPLY (SELECT TOP 1 x.[${field}] AS label FROM dbo.[${table}] x
  WHERE x.[${code}]=LTRIM(RTRIM(${value})) ${extra} ORDER BY x.[${code}]) ${alias}`;
const lookups=[
  ['ward','ms_ward','wardcode','warddesc','dh.Wardcode'],
  ['criteria','TblOfCriteriaOfCare','Code','CriteriaOfCare','dh.CriteriaOfCareCd'],
  ['care','TblOfGrOfCare','CODE','GroupOfCare','dh.GroupOfCareCd'],
  ['ptgroup','TblOfGrOfPt','CODE','GroupOfPt','dh.GroupOfPtCd'],
  ['clinical','TblOfClinicalOutcome','O_no','ClinicalOutcome','dh.ClinicalOutcomeCd'],
  ['pharma','ms_users','userID','fullname','dh.Usercreatecode',"AND x.userID<>'0201'"],
  ['department','ms_department','departmentcode','departmentname','dh.Departmentcode',"AND x.departmentcode<>'000'"],
  ['problem','tbl_problem','P_code','P_detail','dt.DRP_ProblemCd'],
  ['causeDrug','ms_drug','orderitemcode','orderitemENname','dt.OrderItemCaseCode',"AND ISNULL(x.GeneralChemo,'N')='N'"],
  ['dispenseDrug','ms_drug','orderitemcode','orderitemENname','dt.OrderItemDispenCode',"AND ISNULL(x.GeneralChemo,'N')='N'"],
  ['occur','tbl_problemOccur','PMN_no','Problem_thai','dt.ProblemOccurCd'],
  ['cause','tbl_causeofDRP','CodeV9','cause_thai','dt.CauseOfDRPCd'],
  ['action','tbl_Intervention','code_intervention','intervention_thai','dt.InterventionCd'],
  ['acceptance','tbl_InterAccept','A_code','accept_thai','dt.InterAcceptCd'],
  ['outcome','tbl_StatusOfproblem','PS_code','status_thai','dt.StatusOfproblemCd'],
  ['related','ms_users','userID','fullname','dt.UserCreateCode',"AND x.userID<>'0201'"],
  ['reporter','ms_users','userID','fullname','dt.ReporterCd',"AND x.userID<>'0201'"],
];
const summarySql=`SELECT CONVERT(char(10),dt.OrderCreatedate,23) AS [date],dh.HN AS hn,dh.AN AS an,
  pt.patientnameTH AS patientname,dh.Sex AS sex,CONVERT(char(10),dh.AdmitDate,23) AS admitDate,
  dh.Wardcode AS wardCode,ward.label AS wardName,dh.NewCase AS newCase,
  criteria.label AS criteriaOfCare,care.label AS groupOfCare,ptgroup.label AS groupOfPt,
  dh.DRP AS drp,dh.Encashment AS encashment,dh.LOS AS los,
  CONVERT(char(10),dh.[DateD/C],23) AS dischargeDate,CONVERT(char(10),dh.[DateF/U],23) AS followUpDate,
  clinical.label AS clinicalOutcome,pharma.label AS pharmacist,department.label AS department,
  CONVERT(varchar(100),dt.[Time]) AS [time],dt.ProcessCd AS process,dt.[No] AS [no],problem.label AS problem,
  dt.OrderItemCaseCode AS causeDrugCode,causeDrug.label AS causeDrug,
  dt.OrderItemDispenCode AS dispenseDrugCode,dispenseDrug.label AS dispenseDrug,
  dt.Severity AS severity,occur.label AS problemOccur,dt.Preventable AS preventable,
  dt.CauseOfDRPCd AS causeCode,cause.label AS cause,dt.InterventionCd AS actionCode,action.label AS action,
  dt.InterAcceptCd AS acceptanceCode,acceptance.label AS acceptance,
  dt.StatusOfproblemCd AS outcomeCode,outcome.label AS outcome,related.label AS userRelated,
  reporter.label AS reporter,dt.PharmacistNote AS pharmacistNote,dt.PlanNote AS [plan]
  FROM dbo.ms_drpdetail dt INNER JOIN dbo.ms_drpheader dh ON dt.OrderNo=dh.OrderNo
  LEFT JOIN dbo.ms_patient pt ON dh.HN=pt.hn
  ${lookups.map(args=>lookup(...args)).join('\n')}
  WHERE dh.TypeOfPt=@type AND dt.OrderCreatedate BETWEEN CAST(@from AS date) AND CAST(@to AS date)
  ORDER BY dt.OrderCreatedate ASC;`;
const text=value=>value==null?'':typeof value==='boolean'?(value?'True':'False'):String(value).trim();
function assembleSummaryRows(rows){return rows.map(row=>Object.fromEntries(columns.map(([key])=>[key,text(row[key])])));}
function summarySnapshot(rows){
  // Compare the multiset, preserving duplicates. SQL does not define the order
  // of records with identical creation dates in the original application.
  return createHash('sha256').update(JSON.stringify(rows.map(row=>JSON.stringify(columns.map(([key])=>row[key]))).sort())).digest('base64url');
}
function sortSummaryRows(rows,key,direction){
  if(!key)return rows;
  if(!columns.some(([name])=>name===key)||!['asc','desc'].includes(direction))throw Error('Invalid report sort');
  return [...rows].sort((a,b)=>a[key].localeCompare(b[key],'th')*(direction==='asc'?1:-1));
}
function createPharmcareSummaryReader(query){
  return {async getPharmcareSummary(filters){
    const rows=assembleSummaryRows((await query(summarySql,filters)).recordset);
    return {rows,snapshot:summarySnapshot(rows)};
  }};
}
module.exports={columns,lookups,summarySql,assembleSummaryRows,summarySnapshot,sortSummaryRows,createPharmcareSummaryReader};
