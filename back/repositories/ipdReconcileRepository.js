const { sql, pool } = require("../models/db");
const mysql = require("mysql2/promise");
const { mrcHistory } = require("../services/ipdReconcileHistory");
const { reconcileUnits } = require("../services/ipdReconcileUnits");

let opdPool;
function getOpdPool() {
  const keys = [
    "SERVER_HOSPITALKKH",
    "USER_HOSPITALKKH",
    "PASSWORD_HOSPITALKKH",
    "DATABASE_HOSPITALKKH",
  ];
  if (keys.some((key) => !process.env[key])) {
    const error = new Error("OPD connection is not configured");
    error.code = "OPD_UNAVAILABLE";
    throw error;
  }
  opdPool ||= mysql.createPool({
    host: process.env.SERVER_HOSPITALKKH,
    user: process.env.USER_HOSPITALKKH,
    password: process.env.PASSWORD_HOSPITALKKH,
    database: process.env.DATABASE_HOSPITALKKH,
    port: 3306,
    connectTimeout: 8000,
    connectionLimit: 3,
    waitForConnections: false,
    dateStrings: true,
    decimalNumbers: true,
  });
  return opdPool;
}

async function request(patient, selection) {
  await pool.connect();
  const query = pool
    .request()
    .input("hn", sql.VarChar(32), patient.hn)
    .input("an", sql.VarChar(32), patient.an);
  if (selection)
    query
      .input("historyId", sql.VarChar(32), selection.historyId)
      .input("historyDate", sql.VarChar(10), selection.historyDate);
  return query;
}

// Calendar dates here follow ucMedReconcile, independently of the 08:00 IPD round.
const unitdoseFrom = `FROM dbo.prescriptionheader h
  INNER JOIN dbo.prescriptiondetail d ON d.prescriptionno = h.prescriptionno
    AND d.hn = h.hn AND d.an = h.an`;
const unitdoseWhere = `h.hn = @hn AND h.ordertype = '1' AND d.orderitemcode <> 'DC'`;
const mrcWhere = `d.hn = @hn AND d.an <> @an`;
const dayRange = `h.ordercreatedate >= CAST(@historyDate AS datetime)
  AND h.ordercreatedate < DATEADD(day, 1, CAST(@historyDate AS datetime))`;

async function getReconcileHistory(patient, source) {
  if (source === "OPD") {
    const [rows] = await getOpdPool().execute(
      {
        sql: `
      SELECT CAST(vn AS CHAR) AS historyId, DATE_FORMAT(\`Date\`, '%Y-%m-%d') AS historyDate,
        MAX(dr_visit) AS doctorCode, MAX(dr_visit_name) AS doctorname, MAX(clinic) AS clinic, COUNT(*) AS itemCount
      FROM view_pharmacy_opd_drug_item WHERE hn = ? AND vn IS NOT NULL AND \`Date\` IS NOT NULL
      GROUP BY vn, DATE_FORMAT(\`Date\`, '%Y-%m-%d') ORDER BY historyDate DESC, historyId DESC`,
        timeout: 10000,
      },
      [patient.hn],
    );
    const totals = new Map();
    for (const row of rows)
      totals.set(
        row.historyId,
        (totals.get(row.historyId) || 0) + Number(row.itemCount),
      );
    return rows.map((row) => ({
      ...row,
      itemCount: totals.get(row.historyId),
    }));
  }
  const query = await request(patient);
  const result =
    source === "IPD"
      ? await query.query(`
    SELECT h.an AS historyId, CONVERT(char(10), h.ordercreatedate, 23) AS historyDate,
      COUNT(*) AS itemCount
    ${unitdoseFrom} WHERE ${unitdoseWhere} AND h.ordercreatedate IS NOT NULL
    GROUP BY h.an, CONVERT(char(10), h.ordercreatedate, 23)
    ORDER BY historyDate DESC, historyId DESC;`)
      : await query.query(`
    SELECT d.an AS historyId, CONVERT(char(10), d.ordercreatedate, 23) AS historyDate
    FROM dbo.ms_medicationrecconcile d WHERE ${mrcWhere}
    ORDER BY d.voiddatetime, d.prioritycode, d.ordercreatedate;`);
  return source === "MRC" ? mrcHistory(result.recordset) : result.recordset;
}

const fields = `d.prescriptionno, d.prioritycode, priority.prioritydesc,
  d.orderitemcode, d.orderitemname, drug.orderitemENname,
  d.dosage, dosage.DispensedUnitTH AS dosageunit,
  instruction.InstructionNameTH AS instruction, frequency.frequency_nameTH AS frequency,
  doseTime.timeTH AS doseTime, d.orderqty, orderunit.DispensedTotalUnitTH AS orderunit,
  d.freetext1, d.freetext2, d.freetext3, d.startdate, d.enddate, d.takedate,
  d.offstatus, d.voiddatetime, d.holddatetime, d.doctorname,
  d.varymealstatus, users.fullname AS recorder,
  d.price, d.totalprice, d.orderfrom, d.ordercreatedate`;
const joins = `LEFT JOIN dbo.ms_dosageunit dosage ON dosage.DispensedUnitCd = d.dosageunitcode
  LEFT JOIN dbo.ms_orderunit orderunit ON orderunit.DispensedTotalUnitCd = d.orderunitcode
  LEFT JOIN dbo.ms_instruction instruction ON instruction.InstructionCd = d.instructioncode
  LEFT JOIN dbo.ms_frequency_code frequency ON frequency.frequency_code = d.frequencycode
  LEFT JOIN dbo.ms_time doseTime ON doseTime.timecode = d.timecode
  LEFT JOIN dbo.ms_priority priority ON priority.prioritycode = d.prioritycode
  LEFT JOIN dbo.ms_drug drug ON drug.orderitemcode = d.orderitemcode`;

async function getNativeUnits(patient, items) {
  return reconcileUnits(items, async (codes) => {
    const query = await request(patient);
    codes.forEach((code, index) =>
      query.input(`unitCode${index}`, sql.VarChar(50), code),
    );
    return (
      await query.query(`
      SELECT wanted.code, unit.DispensedTotalUnitTH AS orderunit
      FROM (VALUES ${codes.map((_, index) => `(@unitCode${index})`).join(",")}) wanted(code)
      OUTER APPLY (SELECT TOP 1 Sum_MCID FROM dbo.drugname WHERE mc_id = wanted.code ORDER BY Sum_MCID) map
      OUTER APPLY (SELECT TOP 1 orderitemcode FROM dbo.ms_drug
        WHERE orderitemcode = map.Sum_MCID AND unused = 'Y' AND medicalsupplies <> 'Y'
        ORDER BY orderitemcode) mapped
      CROSS APPLY (SELECT TOP 1 orderunitcode FROM dbo.ms_drug
        WHERE orderitemcode = COALESCE(mapped.orderitemcode, wanted.code) ORDER BY orderunitcode) drug
      OUTER APPLY (SELECT TOP 1 DispensedTotalUnitTH FROM dbo.ms_orderunit
        WHERE DispensedTotalUnitCd = drug.orderunitcode ORDER BY DispensedTotalUnitTH) unit;
    `)
    ).recordset;
  });
}

async function getReconcileItems(patient, source, selection) {
  const { historyId, historyDate } = selection;
  if (source === "OPD") {
    // The desktop app shows the whole VN, even when a visit spans multiple dates.
    const [items] = await getOpdPool().execute(
      {
        sql: `
      SELECT d.ref AS prescriptionno, 'H' AS prioritycode, 'Take Home' AS prioritydesc,
        d.drugcode AS orderitemcode, d.drugname AS orderitemname,
        d.no_use AS dosage, d.unit_use AS dosageunit, d.methodname AS instruction,
        d.freqname AS frequency, d.timesname AS doseTime, d.no AS orderqty, NULL AS orderunit,
        CONCAT_WS(' ', d.methodname, d.no_use, d.unit_use, d.freqname, d.timesname) AS freetext2,
        d.caution AS freetext3, d.dr_visit_name AS doctorname, d.clinic,
        'N' AS offstatus, 'N' AS varymealstatus,
        d.\`Date\` AS ordercreatedate, d.\`Date\` AS takedate, 'OPD' AS orderfrom
      FROM view_pharmacy_opd_drug_item d
      WHERE d.hn = ? AND d.vn = ? AND EXISTS (
        SELECT 1 FROM view_pharmacy_opd_drug_item chosen WHERE chosen.hn = d.hn AND chosen.vn = d.vn
          AND DATE(chosen.\`Date\`) = ?)
      ORDER BY d.\`Date\`, d.ref, d.drugcode`,
        timeout: 10000,
      },
      [patient.hn, historyId, historyDate],
    );
    return items.length
      ? { items: await getNativeUnits(patient, items) }
      : null;
  }
  if (source === "MRC") {
    const history = await getReconcileHistory(patient, source);
    if (
      !history.some(
        (row) => row.historyId === historyId && row.historyDate === historyDate,
      )
    )
      return null;
  }
  const query = await request(patient, selection);
  const result =
    source === "IPD"
      ? await query.query(`
    SELECT d.itemindex, ${fields}, h.ordercreatedate AS historyOrderDate
    ${unitdoseFrom} ${joins}
    OUTER APPLY (SELECT TOP 1 fullname FROM dbo.ms_users WHERE userID = d.usercreatecode ORDER BY fullname) users
    WHERE ${unitdoseWhere} AND h.an = @historyId AND ${dayRange}
    ORDER BY h.ordercreatedate, d.seq, d.itemindex;`)
      : await query.query(`
    SELECT d.meditemindex AS itemindex, ${fields}
    FROM dbo.ms_medicationrecconcile d ${joins}
    OUTER APPLY (SELECT TOP 1 fullname FROM dbo.ms_users WHERE userID = d.usercreatecode ORDER BY fullname) users
    WHERE ${mrcWhere} AND d.an = @historyId
    ORDER BY d.voiddatetime, d.prioritycode, d.ordercreatedate, d.seq, d.meditemindex;`);
  if (!result.recordset.length) return null;
  const items = result.recordset.map((row) => ({
    ...row,
    varymealstatus:
      source === "MRC" ? (row.varymealstatus ?? "N") : row.varymealstatus,
  }));
  return {
    items: source === "MRC" ? await getNativeUnits(patient, items) : items,
  };
}

module.exports = { getReconcileHistory, getReconcileItems };
