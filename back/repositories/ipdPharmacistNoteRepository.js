const { sql, pool } = require("../models/db");

async function request(patient) {
  await pool.connect();
  return pool.request().input("hn", sql.VarChar(32), patient.hn);
}

const author = `OUTER APPLY (
  SELECT TOP 1 fullname FROM dbo.ms_users WHERE userID = n.usercreateID ORDER BY userID
) author`;

async function getPatientPharmacistNotes(patient) {
  const query = await request(patient);
  const result = await query.query(`
    SELECT RTRIM(n.id) AS id, RTRIM(n.AN) AS an,
      n.ordercreatedatetime AS createdAt, n.Lastupdatedatetime AS updatedAt,
      n.Problem AS problem, n.[Note] AS note,
      author.fullname AS recorder
    FROM dbo.ms_note n ${author}
    WHERE n.HN = @hn ORDER BY n.Lastupdatedatetime DESC, n.id DESC;
  `);
  return result.recordset;
}

async function getPatientPharmacistNote(patient, noteId) {
  const query = await request(patient);
  query.input("noteId", sql.VarChar(20), noteId);
  const result = await query.query(`
    SELECT RTRIM(n.id) AS id, RTRIM(n.AN) AS an,
      n.ordercreatedatetime AS createdAt, n.Lastupdatedatetime AS updatedAt,
      n.Problem AS problem, n.[Note] AS note, author.fullname AS recorder
    FROM dbo.ms_note n ${author}
    WHERE n.HN = @hn AND n.id = @noteId;
  `);
  return result.recordset[0] || null;
}

module.exports = { getPatientPharmacistNotes, getPatientPharmacistNote };
