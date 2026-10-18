// 4 ยา screen และยาส่งจัดยาแล้ว

const sql = require("mssql");
const dbConfig = require("../../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function screenStat_Finish_2(req, res) {
  const { wardcode, selectroom } = req.body; // รับค่า wardcode และ selectroom จาก request body

  // ตรวจสอบค่าที่รับมาจาก Frontend
  console.log("Received wardcode:", wardcode);
  console.log("Received selectroom:", selectroom);

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
            CONVERT(VARCHAR(10), dbo.prescription.ordercreatedate, 103) AS takedate,
            dbo.prescription.prescriptionno,
            dbo.prescription.hn,
            dbo.prescription.an,
            dbo.prescription.patientname,
            dbo.prescription.wardcode,
            dbo.prescription.wardname,
            dbo.prescription.bedcode,
            dbo.prescription.ordertype,
            '' AS prioritycode,
            FORMAT(dbo.prescription.genorderdatetime, 'yyyyMMdd') AS genorderdatetime,
            dbo.prescription.fromlocationname
        FROM
            dbo.prescription
        LEFT JOIN dbo.ms_ward ON dbo.prescription.wardcode = dbo.ms_ward.wardcode
        LEFT JOIN dbo.ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
        
        WHERE  
        dbo.ms_ward.wardstatus = 'Y' 
        AND dbo.prescription.genorderdatetime IS NOT NULL 
        And dbo.prescription.wardcode = @wardcode 
        And ISNULL(dbo.prescription.frequencycode,'') NOT In ('S','E','STAT')  
        And dbo.prescription.ordertype <> '1' AND dbo.prescription.fromlocationname = 'ห้องยา IPD[001]'
        AND prescription.ordercreatedate BETWEEN '${startDate}' AND '${endDate}'

        GROUP BY
            CONVERT(VARCHAR(10), dbo.prescription.ordercreatedate, 103),
            dbo.prescription.prescriptionno,
            dbo.prescription.hn,
            dbo.prescription.an,
            dbo.prescription.patientname,
            dbo.prescription.wardcode,
            dbo.prescription.wardname,
            dbo.prescription.bedcode,
            dbo.prescription.ordertype,
            FORMAT(dbo.prescription.genorderdatetime, 'yyyyMMdd'),
            dbo.prescription.fromlocationname
        ORDER BY
            dbo.prescription.prescriptionno;
        `;

    const request = new sql.Request();
    if (wardcode) {
      request.input("wardcode", sql.VarChar, wardcode); // เพิ่มค่า wardcode เข้าไปใน request
    }
    if (selectroom) {
      request.input("selectroom", sql.VarChar, selectroom); // เพิ่มค่า selectroom เข้าไปใน request
    }

    const result = await request.query(query);

    const finalResults = result.recordset
      .filter((record) => record.genorderdatetime) // แสดงเฉพาะที่มีค่า genorderdatetime
      .map((record) => {
        const status = record.genorderdatetime ? "Screen แล้ว" : "รอ Screen"; // กำหนดสถานะตามค่า genorderdatetime

        return {
          takedate: record.takedate,
          ordertype: record.ordertype,
          prescriptionno: record.prescriptionno,
          hn: record.hn,
          an: record.an,
          patientname: record.patientname,
          wardcode: record.wardcode,
          wardname: record.wardname,
          bedcode: record.bedcode,
          prioritycode: record.prioritycode,
          genorderdatetime: record.genorderdatetime,
          fromlocationname: record.fromlocationname,
          status: status, // เพิ่มค่า gen ที่ตรวจสอบจาก genorderdatetime
          orderitemcode: record.orderitemcode, // เพื่อให้แสดงค่า orderitemcode
        };
      });

    res.status(200).json(finalResults);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Internal Server Error");
  } finally {
    await sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
  }
}

module.exports = {
  screenStat_Finish_2,
};
