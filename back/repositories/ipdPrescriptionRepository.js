const { sql, pool } = require("../models/db");
const { medicationWindow } = require("../services/ipdMedicationWindow");
const {
  prescriptionStatusWindow,
} = require("../services/ipdPrescriptionDisplay");

async function request(patient) {
  await pool.connect();
  return pool
    .request()
    .input("an", sql.VarChar(32), patient.an)
    .input("hn", sql.VarChar(32), patient.hn);
}

async function getPrescriptionDates(patient) {
  const query = await request(patient);
  const result = await query.query(`
    WITH rounds AS (
      SELECT prescriptionno, ordercreatedate,
        DATEADD(day, DATEDIFF(day, 0, DATEADD(hour, -8, ordercreatedate)), 0) AS roundDay
      FROM dbo.prescriptionheader WHERE an = @an AND hn = @hn AND ordercreatedate IS NOT NULL
    )
    SELECT CONVERT(char(10), roundDay, 23) AS workdate, COUNT(DISTINCT prescriptionno) AS prescriptionCount
    FROM rounds
    WHERE ordercreatedate <= DATEADD(minute, 479, DATEADD(day, 1, roundDay))
    GROUP BY roundDay ORDER BY roundDay DESC;
  `);
  return result.recordset;
}

function bindWindow(query, workdate) {
  const window = medicationWindow(workdate);
  query
    .input("start", sql.VarChar(19), window.start)
    .input("end", sql.VarChar(19), window.end);
  return window;
}

const headerSelect = `
  SELECT h.prescriptionno, h.ordercreatedate, h.ordertype, h.prioritycode,
    h.entrybyusercode, users.fullname AS recorder, h.doctorcode,
    doctor.DoctorTH AS doctorname, h.wardcode,
    COALESCE(NULLIF(ward.warddescfull, ''), ward.warddesc) AS wardname,
    h.roomcode, h.bedcode, h.sumprice, h.readdatetime, h.voiddatetime,
    h.diagnosiscode, h.protocolcode,
    counts.itemCount, counts.generatedCount, counts.screenedCount,
    CASE WHEN EXISTS (SELECT 1 FROM dbo.prescription pr
      INNER JOIN dbo.ms_ward activeWard ON activeWard.wardcode = pr.wardcode AND activeWard.wardstatus = 'Y'
      WHERE pr.prescriptionno = h.prescriptionno AND pr.an = @an AND pr.hn = @hn
        AND pr.genorderdatetime IS NOT NULL) THEN 'จัดยาแล้ว' ELSE 'รอจัดยา' END AS dispenseStatus
  FROM dbo.prescriptionheader h
  LEFT JOIN dbo.ms_users users ON users.userID = h.entrybyusercode
  LEFT JOIN dbo.ms_doctor doctor ON doctor.DoctorCd = h.doctorcode
  LEFT JOIN dbo.ms_ward ward ON ward.wardcode = h.wardcode
  OUTER APPLY (
    SELECT COUNT(*) AS itemCount,
      COUNT(d.genorderdatetime) AS generatedCount, COUNT(d.screendatetime) AS screenedCount
    FROM dbo.prescriptiondetail d
    WHERE d.prescriptionno = h.prescriptionno AND d.an = @an AND d.hn = @hn
  ) counts
  WHERE h.an = @an AND h.hn = @hn
    AND h.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
`;

async function getPatientPrescriptions(patient, workdate) {
  const query = await request(patient);
  const window = bindWindow(query, workdate);
  const result = await query.query(
    `${headerSelect} ORDER BY h.ordercreatedate DESC, h.prescriptionno DESC;`,
  );
  return { prescriptions: result.recordset, window, workdate };
}

async function getPatientPrescription(patient, prescriptionno, workdate) {
  const query = await request(patient);
  const window = bindWindow(query, workdate);
  query.input("prescriptionno", sql.VarChar(20), prescriptionno);
  const result = await query.query(
    `${headerSelect} AND h.prescriptionno = @prescriptionno;`,
  );
  const header = result.recordset[0];
  if (!header) return null;
  const detailQuery = await request(patient);
  detailQuery.input("prescriptionno", sql.VarChar(20), prescriptionno);
  const statusWindow = prescriptionStatusWindow();
  detailQuery
    .input("statusStart", sql.VarChar(19), statusWindow.start)
    .input("statusEnd", sql.VarChar(19), statusWindow.end);
  const details = await detailQuery.query(`
    SELECT d.prescriptionno, d.itemindex, d.meditemindex, d.seq, d.groupdrug,
      d.prioritycode, priority.prioritydesc, d.orderitemcode, d.orderitemname,
      d.dosage, dosage.DispensedUnitTH AS dosageunit, instruction.InstructionNameTH AS instruction,
      d.frequencycode, frequency.frequency_nameTH AS frequency, time.timeTH AS doseTime,
      d.orderqty, orderunit.DispensedTotalUnitTH AS orderunit,
      d.firstdose, d.startdate, d.enddate, ISNULL(d.dayend, 0) AS dayend, d.price, d.totalprice,
      d.freetext1, d.freetext2, d.freetext3, d.doctorname, users.fullname AS recorder,
      d.voiddatetime, d.holddatetime, d.offstatus, d.genorderdatetime, d.screendatetime,
      d.printstatus, d.sendmachine, d.sendmix, d.sendchemo, d.sendtpn,
      d.ordercreatedate, d.takedate, d.ordertype, d.highalert,
      d.instructioncode, d.timecode, d.statuscal, ISNULL(d.dosecal, 0) AS dosecal,
      d.varymeal, d.varymealtime, d.language, d.shelfzone, d.shelfname, d.tmtcode,
      d.calprice, d.sendmixcode, d.diluentseq, drug.displaycolour,
      ISNULL(d.varymealstatus, 'N') AS varymealstatus, d.diluentadd, d.odddatetime, d.oddday,
      d.paytype, d.firsttimecount, d.DIDcode, ISNULL(d.continuestatus, 'N') AS continuestatus,
      d.doctorcode, ISNULL(d.statustimeend, 'N') AS statustimeend, d.timestart, d.timeend,
      approval.AllowStatus AS approvalStatus, approval.StartDate AS approvalStart, approval.EndDate AS approvalEnd,
      screened.screenPrescriptionNo
    FROM dbo.prescriptiondetail d
    LEFT JOIN dbo.ms_dosageunit dosage ON dosage.DispensedUnitCd = d.dosageunitcode
    LEFT JOIN dbo.ms_orderunit orderunit ON orderunit.DispensedTotalUnitCd = d.orderunitcode
    LEFT JOIN dbo.ms_frequency_code frequency ON frequency.frequency_code = d.frequencycode
    LEFT JOIN dbo.ms_time time ON time.timecode = d.timecode
    LEFT JOIN dbo.ms_Instruction instruction ON instruction.InstructionCd = d.instructioncode
    LEFT JOIN dbo.ms_priority priority ON priority.prioritycode = d.prioritycode
    LEFT JOIN dbo.ms_users users ON users.userID = d.usercreatecode
    OUTER APPLY (SELECT TOP 1 displaycolour FROM dbo.ms_drug WHERE orderitemcode = d.orderitemcode ORDER BY displaycolour) drug
    OUTER APPLY (SELECT TOP 1 AllowStatus, StartDate, EndDate FROM dbo.ms_Allow
      WHERE meditemindex = d.meditemindex ORDER BY AllowCd DESC, StartDate DESC, EndDate DESC) approval
    OUTER APPLY (SELECT MIN(pr.prescriptionno) AS screenPrescriptionNo FROM dbo.prescription pr
      INNER JOIN dbo.ms_ward activeWard ON activeWard.wardcode = pr.wardcode AND activeWard.wardstatus = 'Y'
      WHERE pr.meditemindex = d.meditemindex AND pr.an = @an AND pr.hn = @hn
        AND pr.ordercreatedate BETWEEN CAST(@statusStart AS datetime) AND CAST(@statusEnd AS datetime)) screened
    WHERE d.an = @an AND d.hn = @hn AND d.prescriptionno = @prescriptionno
      AND EXISTS (SELECT 1 FROM dbo.prescriptionheader h WHERE h.prescriptionno = d.prescriptionno AND h.an = @an AND h.hn = @hn)
    ORDER BY d.voiddatetime ASC, d.prioritycode ASC, d.ordercreatedate ASC, d.seq ASC, d.itemindex;
  `);
  return { header, items: details.recordset, window, workdate, statusWindow };
}

async function getPatientInteractions(patient) {
  const query = await request(patient);
  const result = await query.query(`
    SELECT history.DDIhiscode, history.username, history.screenusername,
      ISNULL(master.drugnameindex1, '') + N' กับ ' + ISNULL(master.drugnameindex2, '') AS drugname
    FROM dbo.ms_drugintereactionhistory history
    OUTER APPLY (SELECT TOP 1 drugnameindex1, drugnameindex2 FROM dbo.ms_druginteraction
      WHERE DDIcode = history.DDIcode ORDER BY drugnameindex1, drugnameindex2) master
    WHERE history.an = @an AND history.hn = @hn AND history.prescriptionno IS NULL
    ORDER BY history.DDIhiscode;
  `);
  return result.recordset;
}

module.exports = {
  getPrescriptionDates,
  getPatientPrescriptions,
  getPatientPrescription,
  getPatientInteractions,
};
