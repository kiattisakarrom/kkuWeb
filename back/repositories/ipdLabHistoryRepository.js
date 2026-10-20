const mysql = require("mysql2/promise");
const { createLabHistoryReader } = require("../services/ipdLabHistory");

let labPool;
function getLabPool() {
  const keys = [
    "SERVER_HOSPITALKKH",
    "USER_HOSPITALKKH",
    "PASSWORD_HOSPITALKKH",
    "DATABASE_HOSPITALKKH",
  ];
  if (keys.some((key) => !process.env[key]))
    throw Object.assign(new Error("LAB is not configured"), {
      code: "LAB_NOT_CONFIGURED",
    });
  labPool ||= mysql.createPool({
    host: process.env.SERVER_HOSPITALKKH,
    user: process.env.USER_HOSPITALKKH,
    password: process.env.PASSWORD_HOSPITALKKH,
    database: process.env.DATABASE_HOSPITALKKH,
    port: 3306,
    connectTimeout: 8000,
    connectionLimit: 3,
    waitForConnections: false,
    dateStrings: true,
    // Keep exact numeric text/identifiers; LAB results are not calculations.
    decimalNumbers: false,
    supportBigNumbers: true,
    bigNumberStrings: true,
    charset: "utf8mb4",
  });
  return labPool;
}

module.exports = createLabHistoryReader((query, values) =>
  getLabPool().execute(query, values),
);
