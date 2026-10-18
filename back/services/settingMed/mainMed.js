// // show_SearchDruglist

// const { pool, poolConnect, sql } = require("../../models/db");

// const mainMed = async (req, res) => {
//   await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ

//   try {
//     const request = pool.request(); // สร้างคำขอ SQL

//     // รับค่าจากฟรอนต์เอนด์ (ค่าที่ส่งมาเป็น 6 ปุ่ม)
//     const { checkboxGroup1, checkboxGroup2, text } = req.body;

//     // ตรวจสอบค่าที่ส่งมาแล้วแปลงเป็น SQL WHERE
//     let whereCondition = ""; // ค่าเริ่มต้น

//     if (checkboxGroup1 === 1 && checkboxGroup2 === 1) {
//       whereCondition = ""; // ไม่มีเงื่อนไข
//     } else if (checkboxGroup1 === 1 && checkboxGroup2 === 2) {
//       whereCondition = "WHERE dbo.ms_drug.medicalsupplies = 'Y'";
//     } else if (checkboxGroup1 === 1 && checkboxGroup2 === 3) {
//       whereCondition = "WHERE dbo.ms_drug.unused = 'N'";
//     } else if (checkboxGroup1 === 2 && checkboxGroup2 === 1) {
//       whereCondition = "WHERE dbo.ms_drug.unused = 'Y'";
//     } else if (checkboxGroup1 === 2 && checkboxGroup2 === 2) {
//       whereCondition =
//         "WHERE dbo.ms_drug.medicalsupplies = 'Y' AND dbo.ms_drug.unused = 'Y'";
//     } else if (checkboxGroup1 === 2 && checkboxGroup2 === 3)
//       {
//       whereCondition =
//         "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'Y'";
//     } if (text) {
//       if (checkboxGroup1 === 2 && checkboxGroup2 === 3) {
//         textCondition = `
//           AND (
//             dbo.ms_drugindex.drugindexname LIKE '${text}%'
//             OR dbo.ms_drug.orderitemcode LIKE '${text}%'
//             OR dbo.ms_drug.orderitemTHname LIKE '${text}%'
//             OR dbo.ms_drug.orderitemENname LIKE '${text}%'
//           )
//         `;
//       }
//     }

//     else if (checkboxGroup1 === 3 && checkboxGroup2 === 1) {
//       whereCondition = "WHERE dbo.ms_drug.unused = 'N'";
//     } else if (checkboxGroup1 === 3 && checkboxGroup2 === 2) {
//       whereCondition =
//         "WHERE dbo.ms_drug.medicalsupplies = 'Y' AND dbo.ms_drug.unused = 'N'";
//     } else if (checkboxGroup1 === 3 && checkboxGroup2 === 3) {
//       whereCondition =
//         "WHERE ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' AND dbo.ms_drug.unused = 'N'";
//     }

//     // ใช้ WHERE ที่กำหนดไว้ใน SQL
//     const result = await request.query(
//       `
//       SELECT
//           dbo.ms_drug.orderitemcode,
//           dbo.ms_drug.orderitemTHname,
//           dbo.ms_drug.orderitemENname,
//           dbo.ms_drug.genericname,
//           ISNULL(dbo.ms_drug.unused,'N') As unused,
//           ISNULL(dbo.ms_drug.sendmachine,'N') As sendmachine,
//           ISNULL(dbo.ms_drug.sendmix,'N') As sendmix,
//           dbo.ms_drug.instructioncode_ipd,
//           ISNULL(dbo.ms_drug.dispensedose_ipd,0) As dispensedose_ipd,
//           dbo.ms_drug.dosageunitcode_ipd,
//           dbo.ms_drug.frequencycode_ipd,
//           dbo.ms_drug.timecode_ipd,
//           dbo.ms_drug.instructioncode_opd,
//           ISNULL(dbo.ms_drug.dispensedose_opd,0) As dispensedose_opd,
//           dbo.ms_drug.dosageunitcode_opd,
//           dbo.ms_drug.frequencycode_opd,
//           dbo.ms_drug.timecode_opd,
//           ISNULL(dbo.ms_drug.cost,0) As cost,
//           ISNULL(dbo.ms_drug.IPDprice,0) As IPDprice,
//           ISNULL(dbo.ms_drug.OPDprice,0) As OPDprice,
//           ISNULL(dbo.ms_drug.medicalsupplies,'N') As medicalsupplies,
//           dbo.ms_drug.capacity,
//           dbo.ms_drug.capacity_unit,
//           dbo.ms_drug.Inventorycode,
//           dbo.ms_drug.drugform,
//           'เลือก' as selectdrug
//       FROM
//           dbo.ms_drug
//       LEFT JOIN dbo.ms_drugindex ON
//           dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
//       ${whereCondition} -- เพิ่มเงื่อนไขที่นี่
//       GROUP BY
//           dbo.ms_drug.orderitemcode,
//           dbo.ms_drug.orderitemTHname,
//           dbo.ms_drug.orderitemENname,
//           dbo.ms_drug.genericname,
//           dbo.ms_drug.unused,
//           dbo.ms_drug.sendmachine,
//           dbo.ms_drug.sendmix,
//           dbo.ms_drug.instructioncode_ipd,
//           dbo.ms_drug.dispensedose_ipd,
//           dbo.ms_drug.dosageunitcode_ipd,
//           dbo.ms_drug.frequencycode_ipd,
//           dbo.ms_drug.timecode_ipd,
//           dbo.ms_drug.instructioncode_opd,
//           dbo.ms_drug.dispensedose_opd,
//           dbo.ms_drug.dosageunitcode_opd,
//           dbo.ms_drug.frequencycode_opd,
//           dbo.ms_drug.timecode_opd,
//           dbo.ms_drug.cost,
//           dbo.ms_drug.IPDprice,
//           dbo.ms_drug.OPDprice,
//           dbo.ms_drug.medicalsupplies,
//           dbo.ms_drug.capacity,
//           dbo.ms_drug.capacity_unit,
//           dbo.ms_drug.Inventorycode,
//           dbo.ms_drug.drugform
//       `
//     );

//     res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้ในรูปแบบ JSON
//   } catch (err) {
//     console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
//     res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
//   }
// };

// module.exports = {
//   mainMed,
// };
///////////////////////////////////////////////////////////////////////////////////////
// const { pool, poolConnect, sql } = require("../../models/db");

// const mainMed = async (req, res) => {
//   await poolConnect;

//   try {
//     const request = pool.request();
//     const { checkboxGroup1, checkboxGroup2, text } = req.body;

//     // ตรวจสอบค่าจากฟรอนต์เอนด์
//     if (
//       ![1, 2, 3].includes(checkboxGroup1) ||
//       ![1, 2, 3].includes(checkboxGroup2)
//     ) {
//       return res.status(400).send("Invalid checkboxGroup value");
//     }

//     // กำหนดเงื่อนไข WHERE
//     let whereCondition = "";
//     let textCondition = "";

//     if (checkboxGroup1 === 1 && checkboxGroup2 === 1) {
//       whereCondition = "";
//     } else if (checkboxGroup1 === 1 && checkboxGroup2 === 2) {
//       whereCondition = "WHERE dbo.ms_drug.medicalsupplies = 'Y'";
//     } else if (checkboxGroup1 === 1 && checkboxGroup2 === 3) {
//       whereCondition = "WHERE dbo.ms_drug.unused = 'N'";
//     } else if (checkboxGroup1 === 2 && checkboxGroup2 === 1) {
//       whereCondition = "WHERE dbo.ms_drug.unused = 'Y'";
//     } else if (checkboxGroup1 === 2 && checkboxGroup2 === 2) {
//       whereCondition =
//         "WHERE dbo.ms_drug.medicalsupplies = 'Y' AND dbo.ms_drug.unused = 'Y'";
//     } else if (checkboxGroup1 === 2 && checkboxGroup2 === 3) {
//       whereCondition =
//         "WHERE ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' AND dbo.ms_drug.unused = 'Y'";
//     } else if (checkboxGroup1 === 3 && checkboxGroup2 === 1) {
//       whereCondition = "WHERE dbo.ms_drug.unused = 'N'";
//     } else if (checkboxGroup1 === 3 && checkboxGroup2 === 2) {
//       whereCondition =
//         "WHERE dbo.ms_drug.medicalsupplies = 'Y' AND dbo.ms_drug.unused = 'N'";
//     } else if (checkboxGroup1 === 3 && checkboxGroup2 === 3) {
//       whereCondition =
//         "WHERE ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' AND dbo.ms_drug.unused = 'N'";
//     }

//     if (text) {
//       textCondition = `
//         AND (
//           dbo.ms_drugindex.drugindexname LIKE @text
//           OR dbo.ms_drug.orderitemcode LIKE @text
//           OR dbo.ms_drug.orderitemTHname LIKE @text
//           OR dbo.ms_drug.orderitemENname LIKE @text
//         )
//       `;
//       request.input("text", sql.VarChar, `${text}%`);
//     }

//     const fullCondition = whereCondition + (textCondition || "");

//     const result = await request.query(
//       `
//       SELECT
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         ISNULL(dbo.ms_drug.unused,'N') As unused,
//         ISNULL(dbo.ms_drug.sendmachine,'N') As sendmachine,
//         ISNULL(dbo.ms_drug.sendmix,'N') As sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         ISNULL(dbo.ms_drug.dispensedose_ipd,0) As dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         ISNULL(dbo.ms_drug.dispensedose_opd,0) As dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         ISNULL(dbo.ms_drug.cost,0) As cost,
//         ISNULL(dbo.ms_drug.IPDprice,0) As IPDprice,
//         ISNULL(dbo.ms_drug.OPDprice,0) As OPDprice,
//         ISNULL(dbo.ms_drug.medicalsupplies,'N') As medicalsupplies,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.Inventorycode,
//         dbo.ms_drug.drugform,
//         'เลือก' as selectdrug
//       FROM
//         dbo.ms_drug
//       LEFT JOIN dbo.ms_drugindex
//         ON dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
//       ${fullCondition}
//       GROUP BY
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         dbo.ms_drug.unused,
//         dbo.ms_drug.sendmachine,
//         dbo.ms_drug.sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         dbo.ms_drug.dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         dbo.ms_drug.dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         dbo.ms_drug.cost,
//         dbo.ms_drug.IPDprice,
//         dbo.ms_drug.OPDprice,
//         dbo.ms_drug.medicalsupplies,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.Inventorycode,
//         dbo.ms_drug.drugform
//       `
//     );

//     res.status(200).json(result.recordset);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Server error");
//   }
// };

// module.exports = { mainMed };
///////////////////////////////////////////////////////////////////////////////////////
const { pool, poolConnect, sql } = require("../../models/db");

const mainMed = async (req, res) => {
  await poolConnect;

  try {
    const request = pool.request();
    const { checkboxGroup1, checkboxGroup2, text } = req.body;

    // สร้าง Mapping Table สำหรับเงื่อนไข WHERE
    const whereConditionsMap = {
      "1-1": "", // ไม่มีเงื่อนไข
      "1-2": "WHERE dbo.ms_drug.medicalsupplies = 'Y'",
      "1-3": "WHERE dbo.ms_drug.unused = 'N'",
      "2-1": "WHERE dbo.ms_drug.unused = 'Y'",
      "2-2":
        "WHERE dbo.ms_drug.medicalsupplies = 'Y' AND dbo.ms_drug.unused = 'Y'",
      "2-3":
        "WHERE ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' AND dbo.ms_drug.unused = 'Y'",
      "3-1": "WHERE dbo.ms_drug.unused = 'N'",
      "3-2":
        "WHERE dbo.ms_drug.medicalsupplies = 'Y' AND dbo.ms_drug.unused = 'N'",
      "3-3":
        "WHERE ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' AND dbo.ms_drug.unused = 'N'",
    };

    // สร้าง key และดึงเงื่อนไข WHERE
    const key = `${checkboxGroup1}-${checkboxGroup2}`;
    let whereCondition = whereConditionsMap[key] || ""; // กรณี key ไม่ตรง ให้คืนค่าว่าง

    // เพิ่มเงื่อนไขจาก text (ถ้ามี)
    if (text) {
      whereCondition += whereCondition
        ? ` AND (dbo.ms_drugindex.drugindexname LIKE '%${text}%' OR dbo.ms_drug.orderitemcode LIKE '%${text}%' OR dbo.ms_drug.orderitemTHname LIKE '%${text}%' OR dbo.ms_drug.orderitemENname LIKE '${text}%')`
        : `WHERE (dbo.ms_drugindex.drugindexname LIKE '%${text}%' OR dbo.ms_drug.orderitemcode LIKE '%${text}%' OR dbo.ms_drug.orderitemTHname LIKE '%${text}%' OR dbo.ms_drug.orderitemENname LIKE '${text}%')`;
    }

    const result = await request.query(`
      SELECT
          dbo.ms_drug.orderitemcode,
          dbo.ms_drug.orderitemTHname,
          dbo.ms_drug.orderitemENname,
          dbo.ms_drug.genericname,
          ISNULL(dbo.ms_drug.unused, 'N') AS unused,
          ISNULL(dbo.ms_drug.sendmachine, 'N') AS sendmachine,
          ISNULL(dbo.ms_drug.sendmix, 'N') AS sendmix,
          dbo.ms_drug.instructioncode_ipd,
          ISNULL(dbo.ms_drug.dispensedose_ipd, 0) AS dispensedose_ipd,
          dbo.ms_drug.dosageunitcode_ipd,
          dbo.ms_drug.frequencycode_ipd,
          dbo.ms_drug.timecode_ipd,
          dbo.ms_drug.instructioncode_opd,
          ISNULL(dbo.ms_drug.dispensedose_opd, 0) AS dispensedose_opd,
          dbo.ms_drug.dosageunitcode_opd,
          dbo.ms_drug.frequencycode_opd,
          dbo.ms_drug.timecode_opd,
          ISNULL(dbo.ms_drug.cost, 0) AS cost,
          ISNULL(dbo.ms_drug.IPDprice, 0) AS IPDprice,
          ISNULL(dbo.ms_drug.OPDprice, 0) AS OPDprice,
          ISNULL(dbo.ms_drug.medicalsupplies, 'N') AS medicalsupplies,
          dbo.ms_drug.capacity,
          dbo.ms_drug.capacity_unit,
          dbo.ms_drug.Inventorycode,
          dbo.ms_drug.drugform,
          'เลือก' AS selectdrug
      FROM
          dbo.ms_drug
      LEFT JOIN dbo.ms_drugindex ON
          dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
      ${whereCondition}
      GROUP BY
          dbo.ms_drug.orderitemcode,
          dbo.ms_drug.orderitemTHname,
          dbo.ms_drug.orderitemENname,
          dbo.ms_drug.genericname,
          dbo.ms_drug.unused,
          dbo.ms_drug.sendmachine,
          dbo.ms_drug.sendmix,
          dbo.ms_drug.instructioncode_ipd,
          dbo.ms_drug.dispensedose_ipd,
          dbo.ms_drug.dosageunitcode_ipd,
          dbo.ms_drug.frequencycode_ipd,
          dbo.ms_drug.timecode_ipd,
          dbo.ms_drug.instructioncode_opd,
          dbo.ms_drug.dispensedose_opd,
          dbo.ms_drug.dosageunitcode_opd,
          dbo.ms_drug.frequencycode_opd,
          dbo.ms_drug.timecode_opd,
          dbo.ms_drug.cost,
          dbo.ms_drug.IPDprice,
          dbo.ms_drug.OPDprice,
          dbo.ms_drug.medicalsupplies,
          dbo.ms_drug.capacity,
          dbo.ms_drug.capacity_unit,
          dbo.ms_drug.Inventorycode,
          dbo.ms_drug.drugform
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  mainMed,
};

// sb.Append(" SELECT " & vbCrLf)
//         sb.Append(" null as dispensstatus, " & vbCrLf)
//         sb.Append(" med.meditemindex, " & vbCrLf)
//         sb.Append(" med.seq, " & vbCrLf)
//         sb.Append(" med.seqmax, " & vbCrLf)
//         sb.Append(" med.hn, " & vbCrLf)
//         sb.Append(" med.an, " & vbCrLf)
//         sb.Append(" med.prioritycode, " & vbCrLf)
//         sb.Append(" pr.prioritydesc, " & vbCrLf)
//         sb.Append(" med.takedate, " & vbCrLf)
//         sb.Append(" med.ordercreatedate, " & vbCrLf)
//         sb.Append(" med.orderitemcode, " & vbCrLf)
//         sb.Append(" med.orderitemname, " & vbCrLf)
//         sb.Append(" dg.orderitemENname, " & vbCrLf)
//         sb.Append(" dg.displaycolour, " & vbCrLf)
//         sb.Append(" convert(float, ISNULL(med.orderqty, 0)) As orderqty, " & vbCrLf)
//         sb.Append(" med.orderunitcode, " & vbCrLf)
//         sb.Append(" dou.DispensedTotalUnitTH, " & vbCrLf)
//         sb.Append(" med.instructioncode, " & vbCrLf)
//         sb.Append(" Ins.InstructionNameTH, " & vbCrLf)
//         sb.Append(" convert(float,ISNULL(med.dosage,0)) As dosage, " & vbCrLf)
//         sb.Append(" med.dosageunitcode, " & vbCrLf)
//         sb.Append(" dos.DispensedUnitTH, " & vbCrLf)
//         sb.Append(" med.frequencycode, " & vbCrLf)
//         sb.Append(" fc.frequency_nameTH, " & vbCrLf)
//         sb.Append(" ISNULL(fc.qty_per_day,0) As qty_per_day, " & vbCrLf)
//         sb.Append(" fc.frequency_onlydays, " & vbCrLf)
//         sb.Append(" fc.oddday, " & vbCrLf)
//         sb.Append(" med.timecode, " & vbCrLf)
//         sb.Append(" ft.timeTH, " & vbCrLf)
//         sb.Append(" med.timecount, " & vbCrLf)
//         sb.Append(" ISNULL(med.durationcode,'0') As durationcode, " & vbCrLf)
//         sb.Append(" med.usercreatecode, " & vbCrLf)
//         sb.Append(" us.fullname, " & vbCrLf)
//         sb.Append(" med.orderacceptfromip, " & vbCrLf)
//         sb.Append(" med.computername, " & vbCrLf)
//         sb.Append(" med.departmentcode, " & vbCrLf)
//         sb.Append(" med.itemlotcode, " & vbCrLf)
//         sb.Append(" med.itemlotexpire, " & vbCrLf)
//         sb.Append(" med.doctorcode, " & vbCrLf)
//         sb.Append(" med.doctorname, " & vbCrLf)
//         sb.Append(" med.freetext1, " & vbCrLf)
//         sb.Append(" med.freetext2, " & vbCrLf)
//         sb.Append(" med.lastmodified, " & vbCrLf)
//         sb.Append(" med.[language], " & vbCrLf)
//         sb.Append(" med.ordertype, " & vbCrLf)
//         sb.Append(" med.highalert, " & vbCrLf)
//         sb.Append(" med.shelfzone, " & vbCrLf)
//         sb.Append(" med.shelfname, " & vbCrLf)
//         sb.Append(" med.varymeal, " & vbCrLf)
//         sb.Append(" med.varymealtime, " & vbCrLf)
//         sb.Append(" med.voiddatetime, " & vbCrLf)
//         sb.Append(" convert(float,ISNULL(med.price,0)) As price, " & vbCrLf)
//         sb.Append(" convert(float,ISNULL(med.totalprice,0)) As totalprice, " & vbCrLf)
//         sb.Append(" med.sendmachine, " & vbCrLf)
//         sb.Append(" med.sendmix, " & vbCrLf)
//         sb.Append(" ISNULL(med.sendchemo,'N') As sendchemo, " & vbCrLf)
//         sb.Append(" ISNULL(med.sendtpn,'N') As sendtpn, " & vbCrLf)
//         sb.Append(" med.drugusagecode, " & vbCrLf)
//         sb.Append(" med.tmtcode, " & vbCrLf)
//         sb.Append(" med.startdate, " & vbCrLf)
//         sb.Append(" med.enddate, " & vbCrLf)
//         sb.Append(" med.offstatus, " & vbCrLf)
//         sb.Append(" med.groupdrug, " & vbCrLf)
//         sb.Append(" med.sendmixcode, " & vbCrLf)
//         sb.Append(" med.sendmixname, " & vbCrLf)
//         sb.Append(" convert(float,med.vol) as vol, " & vbCrLf)
//         sb.Append(" med.dosageunitforVol, " & vbCrLf)
//         sb.Append(" med.pricetype, " & vbCrLf)
//         sb.Append(" med.printstatus, " & vbCrLf)
//         sb.Append(" med.itemidentify, " & vbCrLf)
//         sb.Append(" med.printdrp, " & vbCrLf)
//         sb.Append(" convert(float,ISNULL(med.firstdose,0)) As firstdose, " & vbCrLf)
//         sb.Append(" med.diluentadd," & vbCrLf)
//         sb.Append(" med.orderfrom," & vbCrLf)
//         sb.Append(" med.holddatetime," & vbCrLf)
//         sb.Append(" ISNULL(med.varymealstatus,'N') As varymealstatus, " & vbCrLf)
//         sb.Append(" med.freetext3, " & vbCrLf)
//         sb.Append(" med.odddatetime, " & vbCrLf)
//         sb.Append(" med.oddday as odd, " & vbCrLf)
//         sb.Append(" med.paytype, " & vbCrLf)
//         sb.Append(" ISNULL(med.firstdosestatus,'0') As firstdosestatus, " & vbCrLf)
//         sb.Append(" ISNULL(med.firsttimecount,1) As firsttimecount, " & vbCrLf)
//         sb.Append(" med.DIDcode, " & vbCrLf)
//         sb.Append(" ISNULL(med.continuestatus,'N') as continuestatus, " & vbCrLf)
//         sb.Append(" mer.meditemindex, " & vbCrLf)
//         sb.Append(" Case WHEN mer.meditemindex Is Not NULL THEN " & vbCrLf)
//         sb.Append(" 'MRC'" & vbCrLf)
//         sb.Append(" Else '' END as MRC," & vbCrLf)
//         sb.Append(" ISNULL(med.statustimeend,'N') As statustimeend, " & vbCrLf)
//         sb.Append(" med.timestart, " & vbCrLf)
//         sb.Append(" med.timeend, " & vbCrLf)
//         sb.Append(" med.odddatetime, " & vbCrLf)
//         sb.Append(" isnull(med.dosecal,0) as dosecal, " & vbCrLf)
//         sb.Append(" med.statuscal," & vbCrLf)
//         sb.Append(" isnull(med.dayend,0) As dayend," & vbCrLf)
//         sb.Append(" med.protocolcode" & vbCrLf)
//         sb.Append(" From " & vbCrLf)
//         sb.Append(" dbo.ms_medicationprofile med " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_medicationrecconcile mer On mer.meditemindex = med.meditemindex " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_time ft On med.timecode = ft.timecode " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_users us On us.userID = med.usercreatecode " & vbCrLf)
//         sb.Append(" Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode  " & vbCrLf)
//         sb.Append(" " & condition)
//         sb.Append(" ORDER BY med.voiddatetime ASC, " & vbCrLf)
//         sb.Append(" med.prioritycode ASC, " & vbCrLf)
//         sb.Append(" med.ordercreatedate ASC, " & vbCrLf)
//         sb.Append(" med.groupdrug Asc," & vbCrLf)
//         sb.Append(" med.seq ASC " & vbCrLf)
