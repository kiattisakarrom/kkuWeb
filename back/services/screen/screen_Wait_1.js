// 6 ยารอ screen ทั้งหมด

const sql = require("mssql");
const dbConfig = require("../../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function screen_Wait_1(req, res) {
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
    await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูล

    let query = `
 SELECT 
         dbo.prescription.wardcode, 
         '[ '+ dbo.prescription.wardcode +' ]' + dbo.prescription.wardname AS wardname, 
         COUNT(DISTINCT dbo.prescription.prescriptionno) counpres 
         FROM 
         dbo.prescription 
         LEFT JOIN dbo.ms_ward On dbo.prescription.wardcode = dbo.ms_ward.wardcode 
         Left JOIN dbo.ms_drug On dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode 
        
        WHERE 
        dbo.ms_ward.wardstatus = 'Y' 
        And dbo.prescription.ordercreatedate between @startDate AND @endDate
        And dbo.prescription.genorderdatetime Is NULL    

         GROUP BY 
         dbo.prescription.wardcode, 
         dbo.prescription.wardname
         ORDER BY CONVERT(INT, dbo.prescription.wardcode) ASC
    `;
    // WHERE
    // dbo.prescription.genorderdatetime IS NULL
    // And ISNULL(dbo.prescription.frequencycode,'') IN ('S','E','STAT')
    // And ISNULL(dbo.prescription.frequencycode,'') IN ('S','E','STAT')
    // And dbo.prescription.ordertype <> '1'
    // AND dbo.prescription.fromlocationname = 'ห้องยา IPD[001]'
    // AND prescription.ordercreatedate BETWEEN '2025-03-27 08:00' AND '2025-03-28 07:59:00'

    // SELECT
    //     dbo.prescription.wardcode,
    //     '[ '+ dbo.prescription.wardcode +' ]' + dbo.prescription.wardname AS wardname,
    //     COUNT(DISTINCT dbo.prescription.prescriptionno) counpres
    //     FROM
    //     dbo.prescription
    //     LEFT JOIN dbo.ms_ward On dbo.prescription.wardcode = dbo.ms_ward.wardcode
    //     Left JOIN dbo.ms_drug On dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode

    //     WHERE
    //     dbo.ms_ward.wardstatus = 'Y'
    //     And dbo.prescription.ordercreatedate between @startDate AND @endDate
    //     And dbo.prescription.genorderdatetime Is NULL

    //     GROUP BY
    //     dbo.prescription.wardcode,
    //     dbo.prescription.wardname
    //     ORDER BY CONVERT(INT, dbo.prescription.wardcode) ASC

    const request = new sql.Request();
    request.input("select", sql.NVarChar, selectroom);
    request.input("startDate", sql.NVarChar, startDate);
    request.input("endDate", sql.NVarChar, endDate);

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
    await sql.close(); // ปิดการเชื่อมต่อ
  }
}

module.exports = {
  screen_Wait_1,
};
