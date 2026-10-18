// 2 ยา stat จัดแล้ว

const sql = require("mssql");
const dbConfig = require("../../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function screenstatFinish3(req, res) {
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
         And dbo.prescription.prescriptionno = '25031000606' 
         And ISNULL(dbo.prescription.frequencycode,'') In ('S','E','STAT')  
         AND prescription.ordercreatedate BETWEEN '2025-03-10 08:00' AND '2025-03-11 07:59:59'

         ORDER BY  dbo.prescription.printstatus DESC,dbo.ms_drug.sendmachine 
    `;

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
  screenstatFinish3,
};
