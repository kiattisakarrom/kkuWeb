const { pool, poolConnect, sql } = require("../../models/db");

const labResult = async (req, res) => {
  await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ
  const { hn } = req.body; // รับค่า an จาก body ของ request

  try {
    const request = pool.request(); // สร้างคำขอ SQL
    request.input("hn", sql.VarChar, hn); // กำหนดค่า an ให้กับพารามิเตอร์ @an

    const result = await request.query(
      `
      Select
        dbo.ms_labresult.lab_no, 
        dbo.ms_labresult.rax_no, 
        dbo.ms_labresult.type, 
        dbo.ms_labresult.hn, 
        dbo.ms_labresult.lab_code, 
        dbo.ms_labresult.lab_name, 
        ISNULL(dbo.ms_labresult.result, 0) As result,
        dbo.ms_labresult.type_result,
        dbo.ms_labresult.unit,
        ISNULL(dbo.ms_labresult.minresult,'') as minresult ,
        ISNULL(dbo.ms_labresult.maxresult,'') as maxresult,
        dbo.ms_labresult.remark,
        dbo.ms_labresult.date_result,
        dbo.ms_labresult.ref
        FROM
        dbo.ms_labresult
        Left Join ms_druglabtype ON ms_druglabtype.labname = dbo.ms_labresult.lab_name
        WHERE dbo.ms_labresult.hn = @hn 
         And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7
         Order by dbo.ms_labresult.date_result DESC
      `
    );

    res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
  } catch (err) {
    console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
    res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
  }
};

const noteDrp = async (req, res) => {
  await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ
  const { hn } = req.body; // รับค่า an จาก body ของ request

  try {
    const request = pool.request(); // สร้างคำขอ SQL
    request.input("hn", sql.VarChar, hn); // กำหนดค่า an ให้กับพารามิเตอร์ @an

    const result = await request.query(
      `
      SELECT
        dd.DRPItemNo, 
        dd.Ordercreatedate, 
        dd.[Time], 
        dd.ProcessCd, 
        dd.[No], 
        dd.DRP_ProblemCd, 
        dd.OrderItemCaseCode, 
        dd.OrderItemDispenCode, 
        dd.ProblemOccurCd, 
        dd.Severity, 
        dd.Preventable, 
        dd.CauseOfDRPCd, 
        dd.InterventionCd, 
        dd.InterAcceptCd, 
        dd.StatusOfproblemCd, 
        dd.ReporterCd, 
        dd.UserCreateCode, 
        dd.PharmacistNote, 
        dd.PlanNote 
        FROM ms_drpdetail dd 
        WHERE dd.Hn = @hn
        ORDER BY dd.Ordercreatedate DESC, dd.[No] ASC
      `
    );

    res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
  } catch (err) {
    console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
    res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
  }
};

module.exports = {
  labResult,
  noteDrp,
};
