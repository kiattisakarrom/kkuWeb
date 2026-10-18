// config/dbConfig.js
require("dotenv").config();
// slqserver
module.exports = {
  user: process.env.USER_SUPREAM, // ชื่อผู้ใช้
  password: process.env.PASSWORD_SUPREAM, // รหัสผ่าน
  server: process.env.SERVER_SUPREAM, // ที่อยู่ของเซิร์ฟเวอร์ SQL Server
  database: process.env.DATABASE_SUPREAM, // ชื่อฐานข้อมูล
  port: 1433,
  options: {
    encrypt: true, // ต้องการเข้ารหัสข้อมูล
    trustServerCertificate: true, // ยอมรับใบรับรองจากเซิร์ฟเวอร์
  },
};

// mysql
// module.exports = {
//   user: "staff@pharmacy",
//   password: "pharmacyKkh2018",
//   server: "192.168.0.218",
//   database: "app_pharmacy",
// }

// const sql = require("mssql");
// const mysql = require("mysql");

// // SQL Server config
// const sqlServerConfig = {
//   user: "sa",
//   password: "p@ssw0rd",
//   server: "192.168.0.144",
//   database: "Unitdose",
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };

// // MySQL config
// const mySqlConfig = {
//   user: "staff@pharmacy",
//   password: "pharmacyKkh2018",
//   server: "192.168.0.218",
//   database: "app_pharmacy",
// };

// // SQL Server connection
// const sqlServerPool = new sql.ConnectionPool(sqlServerConfig);
// const sqlServerPoolConnect = sqlServerPool.connect();

// // MySQL connection
// const mySqlConnection = mysql.createConnection(mySqlConfig);

// module.exports = { sqlServerPool, sqlServerPoolConnect, mySqlConnection };
