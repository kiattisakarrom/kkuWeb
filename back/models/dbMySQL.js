// // models/dbMySQL.js

// const mysql = require("mysql2");
// const config = require("../config/dbConfigMySQL.js");

// const connection = mysql.createConnection(config);

// connection.connect((err) => {
//   if (err) {
//     console.error("MySQL Connection Error:", err);
//   } else {
//     console.log("Connected to MySQL Database");
//   }
// });

// module.exports = connection;

// models/dbMySQL.js
const mysql = require("mysql2");
const config = require("../config/dbConfigMySQL.js");

const pool = mysql.createPool(config); // ใช้ createPool แทน createConnection

// การเชื่อมต่อกับ MySQL
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
  } else {
    console.log("Connected to MySQL Database");
    connection.release(); // ปล่อย connection หลังจากเชื่อมต่อสำเร็จ
  }
});

module.exports = pool;
