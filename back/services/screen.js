//old
// const sql = require("mssql");
// const dbConfig = require("../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
// const moment = require("moment");

// // ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
// async function screen(req, res) {
//   const { selectroom } = req.body; // ยังไม่ได้

//   // Get current time
//   const now = moment();

//   // Define start and end dates
//   let startDate;
//   let endDate;

//   if (now.hour() > 8 || (now.hour() === 8 && now.minute() > 0)) {
//     // Current time is after 08:00:00
//     startDate = now
//       .startOf("day")
//       .add(8, "hours")
//       .format("YYYY-MM-DD HH:mm:ss");
//     endDate = now
//       .startOf("day")
//       .add(1, "days")
//       .add(7, "hours")
//       .add(59, "minutes")
//       .format("YYYY-MM-DD HH:mm:ss");
//   } else {
//     // Current time is before or equal to 08:00:00
//     startDate = now
//       .startOf("day")
//       .subtract(1, "days")
//       .add(8, "hours")
//       .format("YYYY-MM-DD HH:mm:ss");
//     endDate = now
//       .startOf("day")
//       .add(7, "hours")
//       .add(59, "minutes")
//       .format("YYYY-MM-DD HH:mm:ss");
//   }

//   try {
//     await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

//     let query = `
//         SELECT
//             dbo.prescription.wardcode,
//             dbo.prescription.wardname,
//             COUNT(*) AS counpres
//         FROM
//             dbo.prescription
//         WHERE
//             dbo.prescription.genorderdatetime Is NULL
//             AND dbo.prescription.ordercreatedate BETWEEN '${startDate}' AND '${endDate}'
//             AND ISNULL(dbo.prescription.frequencycode,'') NOT In ('S','E','STAT')
//             AND dbo.prescription.ordertype <> '1'
//             AND dbo.prescription.fromlocationname = 'ห้องยา IPD[001]'
//             AND CONVERT(DATE, ordercreatedate) = CONVERT(DATE, GETDATE())
//         GROUP BY
//             dbo.prescription.wardcode,
//             dbo.prescription.wardname
//         ORDER BY
//             CAST(dbo.prescription.wardcode AS INT) ASC;
//         `;

//     const result = await sql.query(query);

//     const finalResults = result.recordset.map((record) => ({
//       wardcode: record.wardcode,
//       wardname: `[ ${record.wardcode} ] ${record.wardname}`,
//       // wardname: record.wardname,
//       counpres: record.counpres,
//     }));
//     res.status(200).json(finalResults);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Internal Server Error");
//   } finally {
//     await sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
//   }
// }

// module.exports = {
//   screen,
// };

// new
const sql = require("mssql");
const dbConfig = require("../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function screen(req, res) {
  const { selectroom } = req.body; // รับค่า selectroom จาก body ของ request

  // Get current time
  const now = moment();

  // Define start and end dates
  let startDate;
  let endDate;

  if (now.hour() > 8 || (now.hour() === 8 && now.minute() > 0)) {
    // Current time is after 08:00:00
    startDate = now
      .startOf("day")
      .add(8, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = now
      .startOf("day")
      .add(1, "days")
      .add(7, "hours")
      .add(59, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
  } else {
    // Current time is before or equal to 08:00:00
    startDate = now
      .startOf("day")
      .subtract(1, "days")
      .add(8, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = now
      .startOf("day")
      .add(7, "hours")
      .add(59, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
  }

  try {
    await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

    let query = `
      SELECT
    dbo.prescription.wardcode,
    dbo.prescription.wardname,
    COUNT(DISTINCT dbo.prescription.prescriptionno) AS counpres
FROM
    dbo.prescription
WHERE
    dbo.prescription.genorderdatetime IS NULL
    AND dbo.prescription.ordercreatedate BETWEEN '${startDate}' AND '${endDate}'
    AND ISNULL(dbo.prescription.frequencycode, '') NOT IN ('S', 'E', 'STAT')
    AND dbo.prescription.ordertype <> '1'
    AND dbo.prescription.fromlocationname = 'ห้องยา IPD[001]'
    AND CONVERT(DATE, ordercreatedate) = CONVERT(DATE, GETDATE())
GROUP BY
    dbo.prescription.wardcode,
    dbo.prescription.wardname
ORDER BY
    CAST(dbo.prescription.wardcode AS INT) ASC;


    `;

    const request = new sql.Request();
    request.input("select", sql.NVarChar, selectroom); // ส่งค่า selectroom ให้กับ SQL Query

    const result = await request.query(query);

    const finalResults = result.recordset.map((record) => ({
      wardcode: record.wardcode,
      wardname: ` ${record.wardcode}  ${record.wardname}`,
      counpres: record.counpres,
    }));
    res.status(200).json(finalResults);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Internal Server Error");
  } finally {
    await sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
  }
}

module.exports = {
  screen,
};

// const sql = require('mssql');
// const dbConfig = require('../config/dbConfig'); // นำเข้าค่าการกำหนดค่าฐานข้อมูล

// // ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
// async function screen(req, res) {
//     const { wardcode } = req.body;

//     try {
//         await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

//         let query = `
//         SELECT
//             wardcode,
//             wardname,
//             COUNT(*) AS counpres
//         FROM
//             dbo.prescription
//         WHERE
//             genorderdatetime IS NULL
//             AND ISNULL(frequencycode, '') NOT IN ('S', 'E', 'STAT')
//             AND dbo.prescription.ordertype <> '1'
//             AND dbo.prescription.fromlocationname = 'ห้องยา IPD[001]'
//             AND CONVERT(DATE, ordercreatedate) = CONVERT(DATE, GETDATE())
//         GROUP BY
//             wardcode,
//             wardname
//         ORDER BY
//             CAST(wardcode AS INT) ASC;
//         `;

//         const result = await sql.query(query);

//         const finalResults = result.recordset.map(record => ({
//             wardcode: record.wardcode,
//             wardname: record.wardname,
//             counpres: record.counpres
//         }));

//         res.status(200).json(finalResults);
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     } finally {
//         await sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
//     }
// }
// module.exports = {
//     screen
// };

// SELECT
//      wardcode,
//      wardname,
//      COUNT(*) AS counpres
// FROM
//      dbo.prescription
//      WHERE
//      genorderdatetime IS NULL
//      AND ISNULL(frequencycode, '') NOT IN ('S', 'E', 'STAT')
//      AND dbo.prescription.ordertype <> '1'
//      AND dbo.prescription.fromlocationname = 'ห้องยา IPD[001]'
//      AND CONVERT(DATE, ordercreatedate) = CONVERT(DATE, GETDATE())
// GROUP BY
//      wardcode,
//      wardname
// ORDER BY
//      CAST(wardcode AS INT) ASC;
