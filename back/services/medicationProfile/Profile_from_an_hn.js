// controllers/patientLabController.js
// const { pool, poolConnect, sql } = require("../../models/db");

// const Profile_database_144 = async (req, res) => {
//   await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ

//   try {
//     const request = pool.request(); // สร้างคำขอ SQL
//     const result = await request.query(
//       "SELECT * FROM ms_patientlabresult WHERE an = '6727582'"
//     ); // Query ข้อมูล

//     res.status(200).json(result.recordset); // ส่งข้อมูลกลับในรูปแบบ JSON
//   } catch (err) {
//     console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
//     res.status(500).send("Server error"); // ส่ง error กลับไปให้ client
//   }
// };

// module.exports = {
//   Profile_database_144,
// };

const { pool, poolConnect, sql } = require("../../models/db");

const Profile_private_an = async (req, res) => {
  await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ
  const { an } = req.body; // รับค่า an จาก body ของ request

  try {
    const request = pool.request(); // สร้างคำขอ SQL
    request.input("an", sql.VarChar, an); // กำหนดค่า an ให้กับพารามิเตอร์ @an

    const result = await request.query(
      "SELECT * FROM ms_patientlabresult WHERE an = @an"
    );

    res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
  } catch (err) {
    console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
    res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
  }
};

const Profile_private_hn = async (req, res) => {
  await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ
  const { hn } = req.body; // รับค่า an จาก body ของ request

  try {
    const request = pool.request(); // สร้างคำขอ SQL
    request.input("hn", sql.VarChar, hn); // กำหนดค่า an ให้กับพารามิเตอร์ @an

    const result = await request.query(
      "SELECT * FROM ms_patient WHERE hn = @hn"
    );

    res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
  } catch (err) {
    console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
    res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
  }
};

module.exports = {
  Profile_private_an,
  Profile_private_hn,
};
