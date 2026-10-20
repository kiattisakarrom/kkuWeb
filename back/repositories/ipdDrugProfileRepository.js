const { sql, pool } = require("../models/db");

async function getPatientDrugProfile(patient, { from, to }) {
  await pool.connect();
  const result = await pool
    .request()
    .input("an", sql.VarChar(32), patient.an)
    .input("hn", sql.VarChar(32), patient.hn)
    .input("from", sql.VarChar(10), from)
    .input("to", sql.VarChar(10), to).query(`
      SELECT p.orderitemcode, p.orderitemname,
        p.frequencyTime, p.frequencyTimedesc
      FROM dbo.packagemasterctx p
      WHERE p.an = @an AND p.hn = @hn
        AND p.takedate BETWEEN CAST(@from AS date) AND CAST(@to AS date);
    `);
  // Same four fields and no additional sorting/grouping/status filters as
  // Showprofileorderitem. Keep HN as an extra admission ownership check.
  return { from, to, items: result.recordset };
}

module.exports = { getPatientDrugProfile };
