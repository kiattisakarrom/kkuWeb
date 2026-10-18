// 4 ยา screen และยาส่งจัดยาแล้ว

const sql = require("mssql");
const dbConfig = require("../../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function screenStat_Finish_3(req, res) {
  const { wardcode, prescriptionno } = req.body; // รับค่า wardcode และ  จาก request body

  // ตรวจสอบค่าที่รับมาจาก Frontend
  console.log("Received wardcode:", wardcode);
  console.log("Received :", prescriptionno);

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

  console.log("Calculated startDate:", startDate);
  console.log("Calculated endDate:", endDate);

  try {
    await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

    let query = `
      SELECT 
        dbo.prescription.prescriptionno, 
        dbo.prescription.seq, 
        dbo.prescription.seqmax, 
        dbo.prescription.orderitembarcode, 
        dbo.prescription.patientname, 
        dbo.prescription.sex, 
        convert(varchar(20),dbo.prescription.patientdob,120) As patientdob , 
        dbo.prescription.hn, 
        dbo.prescription.an, 
        dbo.prescription.wardcode, 
        dbo.prescription.wardname, 
        dbo.prescription.bedcode, 
        dbo.prescription.prioritycode, 
        dbo.prescription.prioritydesc, 
        dbo.prescription.takedate, 
        ISNULL(dbo.prescription.enddate,null) as enddate, 
        dbo.prescription.ordercreatedate, 
        dbo.prescription.orderitemcode, 
        dbo.prescription.orderitemname, 
        convert(float,dbo.prescription.orderqty) As orderqty, 
        dbo.prescription.orderunitcode, 
        dbo.prescription.orderunitdesc, 
        dbo.prescription.instructioncode, 
        dbo.prescription.instructiondesc, 
        convert(float,dbo.prescription.dosage) As dosage, 
        dbo.prescription.dosageunitcode, 
        dbo.prescription.dosageunitdesc, 
        dbo.prescription.frequencycode, 
        dbo.prescription.frequencydesc, 
        dbo.prescription.timecode, 
        dbo.prescription.timedesc, 
        dbo.prescription.fromlocationname, 
        dbo.prescription.usercreatecode, 
        dbo.prescription.usercreatename, 
        dbo.prescription.orderacceptfromip, 
        dbo.prescription.computername, 
        dbo.prescription.itemlotcode, 
        dbo.prescription.itemlotexpire, 
        dbo.prescription.doctorcode, 
        dbo.prescription.doctorname, 
        dbo.prescription.pharmacyitemcode, 
        dbo.prescription.pharmacyitemdesc, 
        dbo.prescription.freetext1, 
        dbo.prescription.freetext2, 
        dbo.prescription.freetext3, 
        dbo.prescription.itemidentify, 
        dbo.prescription.lastmodified, 
        dbo.prescription.[language], 
        dbo.prescription.statuscode, 
        dbo.prescription.ordertype, 
        dbo.prescription.varymeal, 
        dbo.prescription.varymealtime, 
        dbo.prescription.voiddatetime, 
        dbo.prescription.genorderdatetime, 
        dbo.prescription.forcash, 
        '' As timedetailcode, 
        '' As timedetailTH, 
        '' As timedetailEN, 
        dbo.prescription.timecount, 
        dbo.prescription.itemindex,
        dbo.prescription.tmtcode,
        dbo.prescription.sendmachine,
        dbo.prescription.sendmix,
        dbo.prescription.sendchemo,
        dbo.prescription.printstatus,
        dbo.prescription.rowpatient,
        dbo.prescription.holddatetime,
        dbo.prescription.startdate,
        dbo.prescription.printauto,
        dbo.prescription.statustimeend,
        dbo.prescription.timestart,
        dbo.prescription.timeend,
        dbo.ms_drug.drugform
        FROM 
        dbo.prescription 
        Left Join ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode  
        
        WHERE 
        dbo.prescription.genorderdatetime Is Not NULL 
        And dbo.prescription.prescriptionno = @prescriptionno
        And ISNULL(dbo.prescription.frequencycode,'') In ('S','E','STAT')  
        AND prescription.ordercreatedate BETWEEN @startDate AND @endDate
        
        ORDER BY  dbo.prescription.printstatus DESC,dbo.ms_drug.sendmachine
    
    `;

    // WHERE dbo.prescription.genorderdatetime Is Not NULL And dbo.prescription.prescriptionno = '25031400591' And ISNULL(dbo.prescription.frequencycode,'') In ('S','E','STAT')  AND prescription.ordercreatedate BETWEEN '2025-03-14 08:00' AND '2025-03-15 07:59:59'

    const request = new sql.Request();
    request.input("wardcode", sql.VarChar, wardcode);
    request.input("", sql.VarChar);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    console.log("Executing Query:", query);

    const result = await request.query(query);

    console.log("Query Result:", result.recordset);

    const finalResults = result.recordset.map((record) => {
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
  screenStat_Finish_3,
};
