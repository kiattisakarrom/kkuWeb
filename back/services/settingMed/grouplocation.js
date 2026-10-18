const { pool, poolConnect, sql } = require("../../models/db");

const grouplocation = async (req, res) => {
  await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ

  try {
    const request = pool.request(); // สร้างคำขอ SQL

    const result = await request.query(
      `
      Select
        ROW_NUMBER() OVER(ORDER BY ms_grouplocation.grouplocationcode ASC) As Row# ,
        ms_grouplocation.grouplocationcode,
        ms_grouplocation.roomcode,
        ms_room.roomname,
        ms_grouplocation.wardcode,
        ms_ward.warddescfull,
        ms_grouplocation.locationcode,
        ms_location.locationname,
        ms_grouplocation.cabinet,
        ms_grouplocation.location
        FROM
        ms_grouplocation
        Left JOIN ms_room ON ms_room.roomcode = ms_grouplocation.roomcode
        Left JOIN ms_location ON ms_location.locationcode = ms_grouplocation.locationcode
        Left JOIN ms_ward ON ms_ward.wardcode = ms_grouplocation.wardcode
        Where ms_grouplocation.orderitemcode = 'MRPNI3'
      `
    );

    res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
  } catch (err) {
    console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
    res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
  }
};

module.exports = {
  grouplocation,
};
