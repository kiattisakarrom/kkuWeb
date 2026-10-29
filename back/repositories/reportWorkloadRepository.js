const { sql, pool } = require('../models/db');
const { createWorkloadReportReader } = require('../services/reportWorkload');
module.exports = createWorkloadReportReader(async (text, params) => {
  await pool.connect();
  const request = pool.request();
  for (const [key, value] of Object.entries(params)) request.input(key, sql.VarChar(32), value);
  return request.query(text);
});
