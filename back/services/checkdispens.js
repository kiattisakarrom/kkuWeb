// เช็คสถานะยาว่าจัดยาแล้วรึยังที่หน้าโปรไฟล์คนไข้

const sql = require("mssql");
const dbConfig = require("../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function checkdispens(req, res) {
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
    
Select 
         convert(VARCHAR(10),dbo.prescription.ordercreatedate,103) As takedate,  
         dbo.prescription.prescriptionno, 
         dbo.prescription.hn, 
         dbo.prescription.an, 
         dbo.prescription.patientname, 
         dbo.prescription.wardcode, 
         dbo.prescription.wardname, 
         dbo.prescription.bedcode, 
         dbo.prescription.ordertype, 
         '' as prioritycode, 
         Format(dbo.prescription.genorderdatetime,'yyyyMMdd') As genorderdatetime,
         dbo.prescription.fromlocationname
         FROM 
         dbo.prescription 
         Left JOIN dbo.ms_ward On dbo.prescription.wardcode = dbo.ms_ward.wardcode 
         Left JOIN dbo.ms_drug On dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode 
         
         WHERE  dbo.ms_ward.wardstatus = 'Y' And dbo.prescription.meditemindex = '20250606303385' 
         And dbo.prescription.ordercreatedate between '${startDate}' AND '${endDate}'

         GROUP BY 
         convert(VARCHAR(10),dbo.prescription.ordercreatedate,103), 
         dbo.prescription.prescriptionno, 
         dbo.prescription.hn, 
         dbo.prescription.an, 
         dbo.prescription.patientname, 
         dbo.prescription.wardcode, 
         dbo.prescription.wardname, 
         dbo.prescription.bedcode, 
         dbo.prescription.ordertype, 
         Format(dbo.prescription.genorderdatetime,'yyyyMMdd'),
         dbo.prescription.fromlocationname
         ORDER BY 
         dbo.prescription.prescriptionno 


    `;

    const request = new sql.Request();
    request.input("select", sql.NVarChar, selectroom); // ส่งค่า selectroom ให้กับ SQL Query

    const result = await request.query(query);

    const finalResults = result.recordset.map((record) => ({
      wardcode: record.wardcode,
      wardname: ` ${record.wardcode}  ${record.wardname}`,
      counpres: record.counpres,
      pre: record.prescriptionno,
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
  checkdispens,
};
