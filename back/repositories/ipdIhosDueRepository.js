const { sql, pool } = require("../models/db");
const { createIhosDueReader } = require("../services/ipdIhosDue");

async function lookupDrugNames(codes) {
  await pool.connect();
  const names = new Map();
  // One lookup for normal responses, chunked below SQL Server's parameter limit.
  for (let offset = 0; offset < codes.length; offset += 500) {
    const request = pool.request();
    const parameters = codes.slice(offset, offset + 500).map((code, index) => {
      request.input(`drug${index}`, sql.VarChar(100), code);
      return `(@drug${index})`;
    });
    const result = await request.query(`
      SELECT requested.code, drug.orderitemENname AS name
      FROM (VALUES ${parameters.join(",")}) requested(code)
      OUTER APPLY (
        SELECT TOP 1 orderitemENname FROM dbo.ms_drug
        WHERE orderitemcode = requested.code ORDER BY orderitemENname
      ) drug;
    `);
    for (const row of result.recordset) {
      if (!names.has(row.code)) names.set(row.code, row.name);
    }
  }
  return names;
}

const getPatientIhosDue = createIhosDueReader({ lookupDrugNames });
module.exports = { getPatientIhosDue };
