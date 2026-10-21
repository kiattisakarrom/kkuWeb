// Deployment preflight: SELECT 1 only. Never print credentials or clinical rows.
require("dotenv").config();
const sql = require("mssql");
const mysql = require("mysql2/promise");

async function main() {
  let failed = false;
  const checks = [
    ["MSSQL", async () => {
      const pool = new sql.ConnectionPool({
        ...require("../config/dbConfig"),
        connectionTimeout: 8000,
        requestTimeout: 8000,
      });
      try {
        await pool.connect();
        await pool.request().query("SELECT 1 AS connection_check");
      } finally {
        await pool.close();
      }
    }],
    ["MySQL", async () => {
      if (!process.env.SERVER_HOSPITALKKH) {
        console.log("MySQL: not configured (OPD/LAB unavailable)");
        return false;
      }
      const connection = await mysql.createConnection({
        host: process.env.SERVER_HOSPITALKKH,
        user: process.env.USER_HOSPITALKKH,
        password: process.env.PASSWORD_HOSPITALKKH,
        database: process.env.DATABASE_HOSPITALKKH,
        port: 3306,
        connectTimeout: 8000,
      });
      try {
        await connection.query("SELECT 1 AS connection_check");
      } finally {
        await connection.end();
      }
    }],
  ];
  await Promise.all(checks.map(async ([name, check]) => {
    try {
      if (await check() !== false) console.log(`${name}: OK`);
    } catch (error) {
      console.error(`${name}: FAILED (${error.code || error.name})`);
      failed = true;
    }
  }));
  process.exitCode = failed ? 1 : 0;
}

main().catch(() => {
  console.error("Connection preflight failed");
  process.exitCode = 1;
});
