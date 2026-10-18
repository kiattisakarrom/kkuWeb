// models/db.js
const sql = require("mssql");
const config = require("../config/dbConfig"); // นำเข้าการตั้งค่า dbConfig

const pool = new sql.ConnectionPool(config); // สร้าง pool สำหรับการเชื่อมต่อ
const poolConnect = pool.connect(); // เริ่มการเชื่อมต่อ

pool.on("error", (err) => {
  console.error("SQL Pool Error:", err); // หากมีข้อผิดพลาดจะ log ออกมา
});

module.exports = {
  sql,
  pool,
  poolConnect,
};
