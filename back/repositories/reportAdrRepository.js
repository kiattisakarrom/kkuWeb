const { sql, pool } = require("../models/db");
const { createAdrReportReader } = require("../services/reportAdr");

module.exports = createAdrReportReader(async (text, params) => {
  await pool.connect();
  const request = pool.request();
  for (const [key, value] of Object.entries(params))
    request.input(key, key === "useDate" ? sql.Bit : sql.VarChar(32), value);
  return request.query(text);
});
