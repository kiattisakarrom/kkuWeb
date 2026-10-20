const { sql, pool } = require("../models/db");
const { createAllergyHistoryReader } = require("../services/ipdAllergyHistory");

const getPatientAllergies = createAllergyHistoryReader(async (text, hn) => {
  await pool.connect();
  return pool.request().input("hn", sql.VarChar(32), hn).query(text);
});

module.exports = { getPatientAllergies };
