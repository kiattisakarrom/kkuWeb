const { sql, pool, poolConnect } = require("../models/db");

// Handle startup failure without terminating the viewer. A later request can retry
// the same pool instead of awaiting a permanently rejected startup promise.
poolConnect.catch((error) => {
  console.error("Initial IPD connection failed:", error.code || error.name);
});

async function request() {
  await pool.connect();
  return pool.request();
}

async function getLoginOptions() {
  const query = await request();
  const result = await query.query(`
    SELECT RTRIM(roomcode) AS code, RTRIM(roomname) AS name
    FROM dbo.ms_room WHERE roomcode IN ('001', '010') ORDER BY roomcode;
  `);
  return { rooms: result.recordset };
}

const activeWardCondition =
  "w.wardstatus = 'Y' AND w.wardcode NOT IN ('', '000', '1420')";
const statusConditions = {
  admit: "a.DCdatetime IS NULL",
  discharged:
    "a.DCdatetime BETWEEN CAST(@orderdate + ' 00:00:00' AS datetime) AND CAST(@orderdate + ' 23:59:59' AS datetime)",
  all: "(a.DCdatetime >= CAST(@orderdate AS datetime) OR a.DCdatetime IS NULL)",
};

async function findWard(wardCode) {
  const query = await request();
  query.input("wardCode", sql.VarChar(20), wardCode);
  const result = await query.query(`
    SELECT RTRIM(w.wardcode) AS code, RTRIM(w.warddesc) AS name
    FROM dbo.ms_ward w WHERE ${activeWardCondition} AND w.wardcode = @wardCode;
  `);
  return result.recordset[0];
}

function prescriptionCondition(prescription = "all") {
  if (prescription === "all") return "1 = 1";
  return `${prescription === "without" ? "NOT " : ""}EXISTS (
    SELECT 1 FROM dbo.prescriptionheader ph
    WHERE ph.an = a.an AND ph.hn = a.hn
      AND ph.ordercreatedate = CAST(@orderdate AS datetime)
      AND ph.prescriptionno IS NOT NULL
  )`;
}

async function getWards({ orderdate, ptstatus, search, prescription }) {
  const query = await request();
  query.input("orderdate", sql.VarChar(10), orderdate);
  query.input("search", sql.VarChar(32), search);
  const result = await query.query(`
    SELECT RTRIM(w.wardcode) AS code, RTRIM(w.warddesc) AS name,
           c.patientCount
    FROM dbo.ms_ward w
    INNER JOIN (
      SELECT b.towardcode, COUNT(DISTINCT a.an) AS patientCount
      FROM dbo.ms_patient p
      INNER JOIN dbo.ms_patientadmit a ON p.hn = a.hn
      INNER JOIN dbo.ms_bedmove b ON a.an = b.an
      WHERE b.status = 0 AND ${statusConditions[ptstatus]}
        AND (@search = '' OR a.an = @search)
        AND ${prescriptionCondition(prescription)}
      GROUP BY b.towardcode
    ) c ON c.towardcode = w.wardcode
    WHERE ${activeWardCondition};
  `);
  // This database does not support TRY_CONVERT; sort codes naturally without a newer SQL function.
  return result.recordset.sort((left, right) =>
    left.code.localeCompare(right.code, "en", { numeric: true }),
  );
}

async function findUser(username) {
  const query = await request();
  query.input("username", sql.VarChar(100), username);
  const result = await query.query(`
    SELECT u.userID AS id, u.fullname AS name, u.password,
           u.positioncode AS positionCode, p.positiondesc AS positionName
    FROM dbo.ms_users u LEFT JOIN dbo.ms_position p ON p.positioncode = u.positioncode
    WHERE u.username = @username;
  `);
  return result.recordset[0];
}

async function getPatients(
  context,
  { orderdate, ptstatus, search, prescription },
) {
  const query = await request();
  query.input("wardCode", sql.VarChar(20), context.wardCode);
  query.input("orderdate", sql.VarChar(10), orderdate);
  query.input("search", sql.VarChar(32), search);
  // Native ucDispense reads patients/counts by ward. Room is the pharmacy work context.
  const result = await query.query(`
    SELECT a.admitteddate, d.dischargeddate, a.hn, a.an,
           CASE WHEN p.patientlanguage = 'TH' THEN p.patientnameTH ELSE p.patientnameEN END AS patientname,
           w.wardcode, ('[' + w.wardcode + '] ' + w.warddesc) AS warddesc,
           COUNT(DISTINCT h.prescriptionno) AS SumPresc
    FROM dbo.ms_patient p
    INNER JOIN dbo.ms_patientadmit a ON p.hn = a.hn
    INNER JOIN dbo.ms_bedmove b ON a.an = b.an
    INNER JOIN dbo.ms_ward w ON b.towardcode = w.wardcode
    LEFT JOIN dbo.ms_patientDischarge d ON a.an = d.an AND a.hn = d.hn
    LEFT JOIN dbo.prescriptionheader h ON a.hn = h.hn AND a.an = h.an
         AND h.ordercreatedate = CAST(@orderdate AS datetime)
    WHERE b.status = 0 AND w.wardcode = @wardCode
      AND ${statusConditions[ptstatus]}
      AND (@search = '' OR a.an = @search)
      AND ${prescriptionCondition(prescription)}
    GROUP BY a.admitteddate, d.dischargeddate, a.hn, a.an,
             p.patientlanguage, p.patientnameTH, p.patientnameEN, w.wardcode, w.warddesc
    ORDER BY a.admitteddate ASC, a.an ASC;
  `);
  return result.recordset;
}

module.exports = { getLoginOptions, findUser, findWard, getWards, getPatients };
