const { sql, pool } = require("../models/db");
const { medicationWindow } = require("../services/ipdMedicationWindow");
const { clinicalSummary } = require("../services/ipdPatientClinical");

async function request() {
  await pool.connect();
  return pool.request();
}

async function getPatientSummary(
  context,
  an,
  orderdate,
  { includeClinical = true } = {},
) {
  const query = await request();
  query.input("an", sql.VarChar(32), an);
  query.input("wardCode", sql.VarChar(20), context.wardCode);
  query.input("orderdate", sql.VarChar(10), orderdate);
  query.input("includeClinical", sql.Bit, includeClinical);
  const result = await query.query(`
    SELECT TOP 1 a.hn, a.an, a.admitteddate, a.dischargeddate, a.DCdatetime,
      CASE WHEN p.patientlanguage = 'TH' THEN p.patientnameTH ELSE p.patientnameEN END AS patientname,
      p.patientdob, p.sex, p.id_card, p.address, p.moo, p.tambol, p.amp, province.provname,
      w.wardcode, w.warddesc, b.toroom AS room, b.tobed AS bed,
      rights.rightid,
      CASE WHEN p.patientlanguage = 'TH' THEN rights.rightnameTH ELSE rights.rightnameEN END AS rightname,
      COALESCE(NULLIF(lab.DoctorTH, ''), doctor.DoctorTH) AS doctorname,
      COALESCE(NULLIF(lab.DoctorCd, ''), a.DoctorCd) AS doctorcode,
      a.dx1, a.dx2, a.dx3, lab.icd10,
      lab.weight, lab.height, lab.bsa, lab.eGFR, lab.Crcl, lab.scr, lab.wbc,
      lab.Neutrophil, lab.BandformNeutrophil, lab.lastmodified AS clinicalUpdatedAt,
      recent.scrLabValue, recent.scrLabDate, recent.eGFRLabValue, recent.eGFRLabDate,
      recent.wbcLabValue, recent.wbcLabDate, recent.NeutrophilLabValue, recent.NeutrophilLabDate,
      recent.BandformNeutrophilLabValue, recent.BandformNeutrophilLabDate,
      counts.prescriptionCount, counts.totalPrescriptionCount
    FROM dbo.ms_patientadmit a
    INNER JOIN dbo.ms_patient p ON p.hn = a.hn
    INNER JOIN dbo.ms_bedmove b ON b.an = a.an AND b.status = 0
    INNER JOIN dbo.ms_ward w ON w.wardcode = b.towardcode
    LEFT JOIN dbo.ms_right rights ON rights.rightid = p.rightid
    LEFT JOIN dbo.ms_province province ON province.provcode = p.provcode
    LEFT JOIN dbo.ms_doctor doctor ON doctor.DoctorCd = a.DoctorCd
    OUTER APPLY (
      SELECT TOP 1 l.weight, l.height, l.bsa, l.eGFR, l.Crcl, l.scr, l.wbc,
        l.Neutrophil, l.BandformNeutrophil, l.lastmodified, l.icd10, l.DoctorTH, l.DoctorCd
      FROM dbo.ms_patientlabresult l WHERE l.an = a.an AND l.hn = a.hn
      ORDER BY l.lastmodified DESC, l.patientlabcode DESC
    ) lab
    OUTER APPLY (
      SELECT
        MAX(CASE WHEN lab_name = 'Creatinine*' THEN result END) AS scrLabValue,
        MAX(CASE WHEN lab_name = 'Creatinine*' THEN date_result END) AS scrLabDate,
        MAX(CASE WHEN lab_name = 'eGFR (CKD-EPI)' THEN result END) AS eGFRLabValue,
        MAX(CASE WHEN lab_name = 'eGFR (CKD-EPI)' THEN date_result END) AS eGFRLabDate,
        MAX(CASE WHEN lab_name = 'WBC' THEN result END) AS wbcLabValue,
        MAX(CASE WHEN lab_name = 'WBC' THEN date_result END) AS wbcLabDate,
        MAX(CASE WHEN lab_name = 'Neutrophil %' THEN result END) AS NeutrophilLabValue,
        MAX(CASE WHEN lab_name = 'Neutrophil %' THEN date_result END) AS NeutrophilLabDate,
        MAX(CASE WHEN lab_name = 'Band form Neutrophil %' THEN result END) AS BandformNeutrophilLabValue,
        MAX(CASE WHEN lab_name = 'Band form Neutrophil %' THEN date_result END) AS BandformNeutrophilLabDate
      FROM (
        SELECT lab_name, CONVERT(varchar(4000), result) AS result, date_result,
          ROW_NUMBER() OVER (PARTITION BY lab_name ORDER BY date_result DESC, lab_no DESC, lab_code DESC) AS rn
        FROM dbo.ms_labresult
        WHERE @includeClinical = 1 AND hn = a.hn AND DATEDIFF(Day, date_result, GETDATE()) < 7
          AND lab_name IN ('Creatinine*', 'eGFR (CKD-EPI)', 'WBC', 'Neutrophil %', 'Band form Neutrophil %')
          AND (lab_name <> 'WBC' OR result NOT LIKE '%-%')
      ) latest WHERE rn = 1
    ) recent
    OUTER APPLY (
      SELECT COUNT(DISTINCT CASE WHEN h.ordercreatedate = CAST(@orderdate AS datetime) THEN h.prescriptionno END) AS prescriptionCount,
        COUNT(DISTINCT h.prescriptionno) AS totalPrescriptionCount
      FROM dbo.prescriptionheader h WHERE h.an = a.an AND h.hn = a.hn
    ) counts
    WHERE a.an = @an AND w.wardcode = @wardCode AND w.wardstatus = 'Y'
      AND w.wardcode NOT IN ('', '000', '1420')
    ORDER BY b.lastmodified DESC;
  `);
  return includeClinical
    ? clinicalSummary(result.recordset[0])
    : result.recordset[0];
}

async function getPatientMedications(
  patient,
  { workdate, category, includeOff },
) {
  const window = medicationWindow(workdate);
  const query = await request();
  query.input("an", sql.VarChar(32), patient.an);
  query.input("hn", sql.VarChar(32), patient.hn);
  query.input("start", sql.VarChar(19), window.start);
  query.input("end", sql.VarChar(19), window.end);
  query.input("cutoff", sql.VarChar(10), window.endDateCutoff);
  const categories = {
    IPD: "1 = 1",
    IV: "med.sendmix = 'Y'",
    Chemo: "med.sendchemo = 'Y'",
    TPN: "med.sendtpn = 'Y'",
  };
  // Native show-off mode loads all rows for this admission, across rooms/dates.
  const condition = includeOff
    ? "1 = 1"
    : `
    (med.voiddatetime IS NULL OR med.voiddatetime BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime))
    AND (med.enddate >= CAST(@cutoff AS datetime) OR med.enddate IS NULL)
    AND (med.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime) OR med.prioritycode IN ('C', 'CS', 'H'))
    AND ${categories[category]}`;
  const result = await query.query(`
    SELECT med.meditemindex, med.seq, med.prioritycode, priority.prioritydesc,
      med.orderitemcode, med.orderitemname, med.ordercreatedate,
      med.dosage, dosage.DispensedUnitTH AS dosageunit, instruction.InstructionNameTH AS instruction,
      med.instructioncode, med.dosageunitcode, med.orderunitcode, med.timecode,
      med.frequencycode, frequency.frequency_nameTH AS frequency, time.timeTH AS doseTime,
      med.orderqty, orderunit.DispensedTotalUnitTH AS orderunit,
      med.firstdose, med.startdate, med.enddate, med.dayend, med.price, med.totalprice,
      med.freetext1, med.freetext2, med.freetext3, med.doctorcode, med.doctorname,
      med.voiddatetime, med.holddatetime, med.offstatus,
      med.sendmachine, med.sendmix, med.sendchemo, med.sendtpn, med.highalert,
      med.groupdrug, med.printstatus, med.firstdosestatus, med.protocolcode,
      protocol.protocolname, drug.orderitemENname, drug.displaycolour,
      med.statuscal, med.dosecal, med.varymeal, med.varymealtime,
      med.timecount, med.usercreatecode, users.fullname AS recorder,
      med.takedate, med.tmtcode, med.pricetype, med.sendmixcode, med.seq AS diluentstatus,
      med.varymealstatus, med.diluentadd, med.odddatetime, med.oddday, med.paytype,
      med.firsttimecount, med.DIDcode, med.continuestatus, med.statustimeend,
      med.timestart, med.timeend, med.seqmax,
      approval.AllowCd AS approvalCode, approval.AllowStatus AS approvalStatus,
      approval.StartDate AS approvalStart, approval.EndDate AS approvalEnd,
      approval.Reason AS approvalReason,
      CASE WHEN EXISTS (SELECT 1 FROM dbo.ms_medicationrecconcile mr WHERE mr.meditemindex = med.meditemindex) THEN 'MRC' ELSE '' END AS MRC,
      ISNULL(prescriptionCounts.prescriptionCount, 0) AS prescriptionCount,
      prescriptionCounts.screenPrescriptionNo
    FROM dbo.ms_medicationprofile med
    LEFT JOIN dbo.ms_dosageunit dosage ON dosage.DispensedUnitCd = med.dosageunitcode
    LEFT JOIN dbo.ms_orderunit orderunit ON orderunit.DispensedTotalUnitCd = med.orderunitcode
    LEFT JOIN dbo.ms_frequency_code frequency ON frequency.frequency_code = med.frequencycode
    LEFT JOIN dbo.ms_time time ON time.timecode = med.timecode
    LEFT JOIN dbo.ms_Instruction instruction ON instruction.InstructionCd = med.instructioncode
    LEFT JOIN dbo.ms_priority priority ON priority.prioritycode = med.prioritycode
    OUTER APPLY (SELECT TOP 1 orderitemENname, displaycolour FROM dbo.ms_drug
      WHERE orderitemcode = med.orderitemcode ORDER BY orderitemENname, displaycolour) drug
    OUTER APPLY (SELECT TOP 1 protocolname FROM dbo.ms_protocol
      WHERE protocolcode = med.protocolcode ORDER BY protocolname) protocol
    OUTER APPLY (SELECT TOP 1 fullname FROM dbo.ms_users
      WHERE userID = med.usercreatecode ORDER BY fullname) users
    OUTER APPLY (SELECT TOP 1 AllowCd, AllowStatus, StartDate, EndDate, Reason
      FROM dbo.ms_Allow WHERE meditemindex = med.meditemindex
      ORDER BY AllowCd DESC, StartDate DESC, EndDate DESC) approval
    LEFT JOIN (
      SELECT pr.meditemindex, COUNT(DISTINCT pr.prescriptionno) AS prescriptionCount,
        MIN(CASE WHEN activeWard.wardstatus = 'Y' THEN pr.prescriptionno END) AS screenPrescriptionNo
      FROM dbo.prescription pr
      LEFT JOIN dbo.ms_ward activeWard ON activeWard.wardcode = pr.wardcode
      WHERE pr.an = @an AND pr.hn = @hn
        AND pr.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
      GROUP BY pr.meditemindex
    ) prescriptionCounts ON prescriptionCounts.meditemindex = med.meditemindex
    WHERE med.an = @an AND med.hn = @hn AND ${condition}
    ORDER BY med.voiddatetime ASC, med.prioritycode ASC, med.ordercreatedate ASC, med.groupdrug ASC, med.seq ASC;
  `);
  return {
    medications: result.recordset,
    window,
    filters: { workdate, category, includeOff },
  };
}

async function getPatientLabs(patient) {
  const query = await request();
  query.input("hn", sql.VarChar(32), patient.hn);
  const result = await query.query(`
    SELECT lab_no, rax_no, lab_code, lab_name, result, type_result, unit,
      minresult, maxresult, remark, date_result
    FROM dbo.ms_labresult
    WHERE hn = @hn AND DATEDIFF(Day, date_result, GETDATE()) < 7
    ORDER BY date_result DESC, lab_no, lab_code;
  `);
  return result.recordset;
}

const { getPatientAllergies } = require("./ipdAllergyRepository");

async function getPatientNotes(patient) {
  return require("./ipdPharmcareRepository").getPatientDrpNotes(patient);
}

// Read-only equivalent of CheckOrderOR/get__Check_OR_GenOrder. Preserve the
// native 10..13-character key and itemindex join; never run AddOrderOR/import.
async function getPatientOperatingRoomAlert(patient) {
  const query = await request();
  query.input("an", sql.VarChar(32), patient.an);
  query.input("hn", sql.VarChar(32), patient.hn);
  return (
    await query.query(`
    SELECT COUNT(m.meditemindex) AS medicationCount, COUNT(p.itemindex) AS prescriptionCount
    FROM dbo.ms_medicationprofile m
    LEFT JOIN dbo.prescription p ON m.meditemindex = p.itemindex
      AND p.an = @an AND p.hn = @hn
    WHERE LEN(m.meditemindex) BETWEEN 10 AND 13 AND m.an = @an AND m.hn = @hn;
  `)
  ).recordset;
}

module.exports = {
  getPatientSummary,
  getPatientMedications,
  getPatientLabs,
  getPatientAllergies,
  getPatientNotes,
  getPatientOperatingRoomAlert,
};
