const { sql, pool } = require("../models/db");
const { createMedTransferReader } = require("../services/ipdMedTransfer");

module.exports = createMedTransferReader(async (text, params) => {
  await pool.connect();
  const request = pool.request();
  for (const [key, value] of Object.entries(params))
    request.input(key, sql.NVarChar(key === "cartName" ? 100 : 32), value);
  return request.query(text);
});
