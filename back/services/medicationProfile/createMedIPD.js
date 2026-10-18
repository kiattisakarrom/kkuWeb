// const { pool, poolConnect, sql } = require("../../models/db");

// const createMedIPD = async (req, res) => {
//   await poolConnect;

//   const {
//     an,
//     hn,
//     orderitemcode,
//     orderitemname,
//     orderqty,
//     dosage,
//     dosageunitcode,
//     frequencycode,
//     takedate,
//     doctorcode,
//     doctorname,
//     usercreatecode,
//     // เพิ่ม fields ตามต้องการ
//   } = req.body;

//   try {
//     const request = pool.request();

//     request.input("an", sql.VarChar, an);
//     request.input("hn", sql.VarChar, hn);
//     request.input("orderitemcode", sql.VarChar, orderitemcode);
//     request.input("orderitemname", sql.NVarChar, orderitemname);
//     request.input("orderqty", sql.Float, orderqty);
//     request.input("dosage", sql.Float, dosage);
//     request.input("dosageunitcode", sql.VarChar, dosageunitcode);
//     request.input("frequencycode", sql.VarChar, frequencycode);
//     request.input("takedate", sql.DateTime, takedate);
//     request.input("doctorcode", sql.VarChar, doctorcode);
//     request.input("doctorname", sql.NVarChar, doctorname);
//     request.input("usercreatecode", sql.VarChar, usercreatecode);
//     request.input("ordercreatedate", sql.DateTime, new Date());

//     const insertQuery = `
//       INSERT INTO dbo.ms_medicationprofile (
//         an,
//         hn,
//         orderitemcode,
//         orderitemname,
//         orderqty,
//         dosage,
//         dosageunitcode,
//         frequencycode,
//         takedate,
//         doctorcode,
//         doctorname,
//         usercreatecode,
//         ordercreatedate
//       ) VALUES (
//         @an,
//         @hn,
//         @orderitemcode,
//         @orderitemname,
//         @orderqty,
//         @dosage,
//         @dosageunitcode,
//         @frequencycode,
//         @takedate,
//         @doctorcode,
//         @doctorname,
//         @usercreatecode,
//         @ordercreatedate
//       )
//     `;

//     await request.query(insertQuery);
//     res.status(201).json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
//   } catch (err) {
//     console.error("SQL Insert Error:", err);
//     res.status(500).json({ message: "เกิดข้อผิดพลาดระหว่างการบันทึกข้อมูล" });
//   }
// };

// module.exports = { createMedIPD };

// SELECT
//   null as dispensstatus,
//   med.meditemindex,
//   med.seq,
//   med.seqmax,
//   med.hn,
//   med.an,
//   med.prioritycode,
//   pr.prioritydesc,
//   med.takedate,
//   med.ordercreatedate,
//   med.orderitemcode,
//   med.orderitemname,
//   dg.orderitemENname,
//   dg.displaycolour,
//   convert(float, ISNULL(med.orderqty, 0)) As orderqty,
//   med.orderunitcode,
//   dou.DispensedTotalUnitTH,
//   med.instructioncode,
//   Ins.InstructionNameTH,
//   convert(float,ISNULL(med.dosage,0)) As dosage,
//   med.dosageunitcode,
//   dos.DispensedUnitTH,
//   med.frequencycode,
//   fc.frequency_nameTH,
//   ISNULL(fc.qty_per_day,0) As qty_per_day,
//   fc.frequency_onlydays,
//   fc.oddday,
//   med.timecode,
//   ft.timeTH,
//   med.timecount,
//   ISNULL(med.durationcode,'0') As durationcode,
//   med.usercreatecode,
//   us.fullname,
//   med.orderacceptfromip,
//   med.computername,
//   med.departmentcode,
//   med.itemlotcode,
//   med.itemlotexpire,
//   med.doctorcode,
//   med.doctorname,
//   med.freetext1,
//   med.freetext2,
//   med.lastmodified,
//   med.[language],
//   med.ordertype,
//   med.highalert,
//   med.shelfzone,
//   med.shelfname,
//   med.varymeal,
//   med.varymealtime,
//   med.voiddatetime,
//   convert(float,ISNULL(med.price,0)) As price,
//   convert(float,ISNULL(med.totalprice,0)) As totalprice,
//   med.sendmachine,
//   med.sendmix,
//   ISNULL(med.sendchemo,'N') As sendchemo,
//   ISNULL(med.sendtpn,'N') As sendtpn,
//   med.drugusagecode,
//   med.tmtcode,
//   med.startdate,
//   med.enddate,
//   med.offstatus,
//   med.groupdrug,
//   med.sendmixcode,
//   med.sendmixname,
//   convert(float,med.vol) as vol,
//   med.dosageunitforVol,
//   med.pricetype,
//   med.printstatus,
//   med.itemidentify,
//   med.printdrp,
//   convert(float,ISNULL(med.firstdose,0)) As firstdose,
//   med.diluentadd,
//   med.orderfrom,
//   med.holddatetime,
//   ISNULL(med.varymealstatus,'N') As varymealstatus,
//   med.freetext3,
//   med.odddatetime,
//   med.oddday as odd,
//   med.paytype,
//   ISNULL(med.firstdosestatus,'0') As firstdosestatus,
//   ISNULL(med.firsttimecount,1) As firsttimecount,
//   med.DIDcode,
//   ISNULL(med.continuestatus,'N') as continuestatus,
//   mer.meditemindex,
//   Case WHEN mer.meditemindex Is Not NULL THEN 'MRC' Else '' END as MRC,
//   ISNULL(med.statustimeend,'N') As statustimeend,
//   med.timestart,
//   med.timeend,
//   med.odddatetime,
//   isnull(med.dosecal,0) as dosecal,
//   med.statuscal,
//   isnull(med.dayend,0) As dayend,
//   med.protocolcode
// FROM dbo.ms_medicationprofile med
// LEFT JOIN dbo.ms_medicationrecconcile mer ON mer.meditemindex = med.meditemindex
// LEFT JOIN dbo.ms_dosageunit dos ON med.dosageunitcode = dos.DispensedUnitCd
// LEFT JOIN dbo.ms_orderunit dou ON med.orderunitcode = dou.DispensedTotalUnitCd
// LEFT JOIN dbo.ms_frequency_code fc ON med.frequencycode = fc.frequency_code
// LEFT JOIN dbo.ms_time ft ON med.timecode = ft.timecode
// LEFT JOIN dbo.ms_Instruction Ins ON med.instructioncode = Ins.InstructionCd
// LEFT JOIN dbo.ms_priority pr ON med.prioritycode = pr.prioritycode
// LEFT JOIN dbo.ms_users us ON us.userID = med.usercreatecode
// LEFT JOIN dbo.ms_drug dg ON dg.orderitemcode = med.orderitemcode
// WHERE
//   (med.voiddatetime IS NULL OR med.voiddatetime BETWEEN '2025-08-07 08:00:00' AND '2025-08-08 07:59:00')
//   AND (med.enddate >= '2025-08-06' OR med.enddate IS NULL)
//   AND (
//     med.ordercreatedate BETWEEN '2025-08-07 08:00:00' AND '2025-08-08 07:59:00'
//     OR med.prioritycode IN ('C', 'CS', 'H')
//   )
//  -- เงื่อนไขตาม roomType = 'IV'
//   AND med.an = 'P1234'
// ORDER BY
//   med.voiddatetime ASC,
//   med.prioritycode ASC,
//   med.ordercreatedate ASC
