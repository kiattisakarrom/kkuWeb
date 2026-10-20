const { sql, pool } = require("../models/db");

async function request(patient, orderNo) {
  await pool.connect();
  const query = pool.request().input("hn", sql.VarChar(32), patient.hn);
  if (orderNo !== undefined) query.input("orderNo", sql.VarChar(32), orderNo);
  return query;
}

// All identifiers below are source-controlled constants. One match per master
// prevents duplicate codes in legacy master tables from multiplying patient rows.
const lookup = (alias, table, code, value, field, order = code) =>
  `OUTER APPLY (SELECT TOP 1 ${/^[A-Za-z_][A-Za-z0-9_]*$/.test(field) ? `[${field}]` : field} AS label FROM dbo.[${table}]
    WHERE [${code}] = ${value} ORDER BY [${order}]) ${alias}`;

const eventSelect = `SELECT RTRIM(h.OrderNo) AS OrderNo, RTRIM(h.AN) AS AN, h.Sex, h.AdmitDate, h.TypeOfPt, h.NewCase,
  h.Wardcode, ward.label AS wardName, h.CriteriaOfCareCd, criteria.label AS criteriaOfCare,
  h.GroupOfCareCd, care.label AS groupOfCare, h.GroupOfPtCd, patientGroup.label AS groupOfPt,
  h.DRP, h.Encashment, h.LOS, h.[DateD/C] AS dischargeDate, h.[DateF/U] AS followUpDate,
  h.ClinicalOutcomeCd, clinical.label AS clinicalOutcome, h.Usercreatecode,
  recorder.label AS pharmacist, h.Departmentcode, department.label AS department, h.Lastmodified
  FROM dbo.ms_drpheader h
  ${lookup("ward", "ms_ward", "wardcode", "h.Wardcode", "warddesc")}
  ${lookup("criteria", "TblOfCriteriaOfCare", "Code", "h.CriteriaOfCareCd", "CriteriaOfCare")}
  ${lookup("care", "TblOfGrOfCare", "CODE", "h.GroupOfCareCd", "GroupOfCare")}
  ${lookup("patientGroup", "TblOfGrOfPt", "CODE", "h.GroupOfPtCd", "GroupOfPt")}
  ${lookup("clinical", "TblOfClinicalOutcome", "O_no", "h.ClinicalOutcomeCd", "ClinicalOutcome")}
  ${lookup("recorder", "ms_users", "userID", "h.Usercreatecode", "COALESCE(fullname,username)")}
  ${lookup("department", "ms_department", "departmentcode", "h.Departmentcode", "departmentname")}
  WHERE h.HN = @hn`;

// Both frmDRP and the patient-side Note DRP grid resolve EN drug names and
// fall back to username only for NULL full names, as in the Windows source.
const drpSelect = (
  native = false,
) => `SELECT d.DRPItemNo, d.OrderNo, d.OrderCreatedate, d.[Time], d.AN, d.[No],
  d.ProcessCd, process.label AS processName, d.DRP_ProblemCd, problem.label AS problem,
  d.OrderItemCaseCode, causeDrug.label AS causeDrug, d.OrderItemDispenCode,
  dispensed.label AS dispensedDrug, d.ProblemOccurCd, occur.label AS problemOccur,
  d.Severity, d.Preventable,
  CASE d.Preventable WHEN '0' THEN N'ป้องกันได้' WHEN '1' THEN N'ป้องกันไม่ได้' END AS preventableName,
  d.CauseOfDRPCd, cause.label AS cause, d.InterventionCd, intervention.label AS intervention,
  d.InterAcceptCd, acceptance.label AS acceptance, d.StatusOfproblemCd, outcome.label AS problemStatus,
  d.ReporterCd, reporter.label AS reporter, d.UserCreateCode, recorder.label AS recorder,
  d.PharmacistNote, d.PlanNote, d.Lastmodified
  FROM dbo.ms_drpdetail d
  ${lookup("process", "TblOfProcess", "ProcessCode", "d.ProcessCd", "ProC")}
  ${lookup("problem", "tbl_problem", "P_code", "d.DRP_ProblemCd", "P_detail", "P_no")}
  ${lookup("causeDrug", "ms_drug", "orderitemcode", "d.OrderItemCaseCode", native ? "orderitemENname" : "COALESCE(NULLIF(orderitemENname,''),orderitemTHname)")}
  ${lookup("dispensed", "ms_drug", "orderitemcode", "d.OrderItemDispenCode", native ? "orderitemENname" : "COALESCE(NULLIF(orderitemENname,''),orderitemTHname)")}
  ${lookup("occur", "tbl_problemOccur", "PMN_no", "d.ProblemOccurCd", "problem_thai")}
  ${lookup("cause", "tbl_causeofDRP", "CodeV9", "d.CauseOfDRPCd", "cause_thai", "ID")}
  ${lookup("intervention", "tbl_Intervention", "code_intervention", "d.InterventionCd", "Intervention_thai", "I_No")}
  ${lookup("acceptance", "tbl_InterAccept", "A_code", "d.InterAcceptCd", "accept_thai", "A_no")}
  ${lookup("outcome", "tbl_StatusOfproblem", "PS_code", "d.StatusOfproblemCd", "status_thai", "S_no")}
  ${lookup("reporter", "ms_users", "userID", "d.ReporterCd", native ? "COALESCE(fullname,username)" : "COALESCE(NULLIF(fullname,''),username)")}
  ${lookup("recorder", "ms_users", "userID", "d.UserCreateCode", native ? "COALESCE(fullname,username)" : "COALESCE(NULLIF(fullname,''),username)")}
  WHERE d.HN = @hn`;

async function getPatientPharmcareEvents(patient) {
  const query = await request(patient);
  return (await query.query(`${eventSelect} ORDER BY h.OrderNo DESC;`))
    .recordset;
}

async function getPatientDrpNotes(patient) {
  const query = await request(patient);
  return (
    await query.query(
      `${drpSelect(true)} ORDER BY d.OrderCreatedate DESC, d.[No], d.DRPItemNo;`,
    )
  ).recordset;
}

async function getPatientPharmcareRecords(patient, orderNo, resource) {
  const headerQuery = await request(patient, orderNo);
  const event = (
    await headerQuery.query(`${eventSelect} AND h.OrderNo = @orderNo;`)
  ).recordset[0];
  if (!event) return null;
  const query = await request(patient, orderNo);
  const owner = `EXISTS (SELECT 1 FROM dbo.ms_drpheader owned WHERE owned.OrderNo = @orderNo AND owned.HN = @hn)`;
  let statement;
  if (resource === "drp")
    statement = `${drpSelect(true)} AND d.OrderNo = @orderNo AND ${owner}
    ORDER BY d.OrderCreatedate DESC, d.[No], d.DRPItemNo;`;
  else if (resource === "due")
    statement = `SELECT d.Orderitemcode, d.Orderitemname,
    d.Doctorcode, d.Doctorname, d.Indication, d.Empiric, d.Document, d.Start, d.Combine,
    d.InterventionL, d.Dosage, d.InterventionD, d.DurationUse, d.ADR, d.NScor, d.Outcome,
    d.DrugAmount, d.[Value], d.Usercreatecode, d.Usercreatename, d.DueForm, d.Lastmodified
    FROM dbo.ms_due d WHERE d.OrderNo = @orderNo AND ${owner}
    ORDER BY d.Orderitemcode, d.Doctorcode, d.Lastmodified;`;
  else if (resource === "side-effects")
    statement = `SELECT d.sideeffectdetailcode,
    d.sideeffectcode, d.sideeffectname, d.grade, d.admindate, d.sideeffectdate,
    d.detail, d.lastupdate FROM dbo.ms_sideeffecterror d
    WHERE d.OrderNo = @orderNo AND d.hn = @hn AND ${owner}
    ORDER BY d.sideeffectdate DESC, d.sideeffectdetailcode;`;
  else if (resource === "me")
    statement = `SELECT d.meerrorcode, d.meusererrorcode,
    involved.label AS involvedUser, d.meerrordatetime, d.meeventcode, eventName.label AS eventName,
    d.mecorrect, d.mewrong, d.metypeerrorcode, errorType.label AS errorType,
    d.metypedetailcode, errorDetail.label AS errorDetail, d.melevelcode, levelName.label AS levelName,
    d.meusercreatecode, recorder.label AS recorder, d.lastupdate
    FROM dbo.ms_meerror d
    ${lookup("involved", "ms_users", "userID", "d.meusererrorcode", "fullname")}
    ${lookup("eventName", "ms_medetail", "medetailcode", "d.meeventcode", "medetail")}
    ${lookup("errorType", "ms_me", "mecode", "d.metypeerrorcode", "medetail")}
    OUTER APPLY (SELECT TOP 1 medetail AS label FROM dbo.ms_medetail
      WHERE medetailcode = d.metypedetailcode AND mecode = d.metypeerrorcode ORDER BY medetailcode) errorDetail
    ${lookup("levelName", "ms_medetail", "medetailcode", "d.melevelcode", "medetail")}
    ${lookup("recorder", "ms_users", "userID", "d.meusercreatecode", "fullname")}
    WHERE d.OrderNo = @orderNo AND ${owner} ORDER BY d.meerrordatetime DESC, d.meerrorcode;`;
  else throw new TypeError("Unknown Pharmcare resource");
  return { event, items: (await query.query(statement)).recordset };
}

module.exports = {
  getPatientPharmcareEvents,
  getPatientPharmcareRecords,
  getPatientDrpNotes,
};
