// //ส่งข้อมูลผ่าน body ไม่ใช่ URL parameter
// const pool = require("../../models/dbMySQL"); // ใช้ pool ที่สร้างไว้แทน connection เดิม

// async function medicationProfile_database_view(req, res) {
//   const { an } = req.body; // รับค่า an จาก body ของ request
//   console.log("Received AN:", an);
//   const query = `
//     SELECT
//       view_ipd_ipd.hn,
//       view_ipd_ipd.an,
//       view_ipd_ipd.admit,
//       view_ipd_ipd.title,
//       view_ipd_ipd.name,
//       view_ipd_ipd.middlename,
//       view_ipd_ipd.surname,
//       view_ipd_ipd.birth,
//       view_ipd_ipd.sex,
//       view_ipd_ipd.ward_name,
//       view_ipd_ipd.pttype_name,
//       view_ipd_ipd.dr_name
//     FROM view_ipd_ipd
//     WHERE an = ?
//     ORDER BY view_ipd_ipd.admit DESC
//     LIMIT 50;
//   `;

//   try {
//     pool.query(query, [an], (err, results) => {
//       if (err) {
//         console.error("SQL error", err);
//         return res.status(500).send("Internal Server Error");
//       }

//       // เตรียมข้อมูลในรูปแบบที่ต้องการ
//       const finalResults = results.map((record) => ({
//         hn: record.hn,
//         an: record.an,
//         admit: record.admit,
//         title: record.title,
//         name: record.name,
//         middlename: record.middlename,
//         surname: record.surname,
//         birth: record.birth,
//         sex: record.sex,
//         ward_name: record.ward_name,
//         pttype_name: record.pttype_name,
//         dr_name: record.dr_name,
//       }));

//       res.status(200).json(finalResults); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     });
//   } catch (err) {
//     console.error("Error during database query", err);
//     res.status(500).send("Internal Server Error");
//   }
// }

// module.exports = {
//   medicationProfile_database_view,
// };

// const { pool, poolConnect, sql } = require("../../models/db");

// const medicationProfile_patient = async (req, res) => {
//   await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ
//   const { hn } = req.body; // รับค่า an จาก body ของ request

//   try {
//     const request = pool.request(); // สร้างคำขอ SQL
//     request.input("hn", sql.VarChar, hn); // กำหนดค่า an ให้กับพารามิเตอร์ @an

//     const result = await request.query(
//       "SELECT * FROM ms_patient WHERE hn = @hn"
//     );

//     res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
//   } catch (err) {
//     console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
//     res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
//   }
// };

// module.exports = {
//   medicationProfile_patient,
// };
