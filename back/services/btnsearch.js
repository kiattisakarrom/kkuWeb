// ต้นแบบ
// const mysql = require("mysql2/promise");
// const dbConfig = require("../config/dbConfigMySQL.js"); // นำเข้า config ของ MySQL

// const btnsearch = async (req, res) => {
//   try {
//     const { an } = req.body; // รับค่า AN จาก frontend
//     console.log("✅ [Backend] ได้รับค่า AN:", an); // Log ค่าที่ได้รับ

//     if (!an) {
//       console.log("❌ [Backend] ไม่ได้รับค่า AN");
//       return res.status(400).json({ message: "กรุณาใส่ค่า AN" });
//     }

//     // สร้าง Connection ไปที่ MySQL
//     const connection = await mysql.createConnection(dbConfig);

//     // คำสั่ง SQL
//     const query = `
// SELECT
//         view_ipd_ipd.hn, view_ipd_ipd.an, view_ipd_ipd.vn,
//         view_ipd_ipd.admit, view_ipd_ipd.admite, view_ipd_ipd.time,
//         DATE_FORMAT(view_ipd_ipd.disc, '%Y%m%d') as disc,
//         DATE_FORMAT(view_ipd_ipd.disc, '%Y-%m-%d') as disct,
//         view_ipd_ipd.timedisc, view_ipd_ipd.los, view_ipd_ipd.pday,
//         view_ipd_ipd.dep, view_ipd_ipd.dr, view_ipd_ipd.dr_disc,
//         view_ipd_ipd.staff, view_ipd_ipd.ward, view_ipd_ipd.dx1,
//         view_ipd_ipd.dx2, view_ipd_ipd.dx3, view_ipd_ipd.causedead,
//         view_ipd_ipd.refer, view_ipd_ipd.move, view_ipd_ipd.fu,
//         view_ipd_ipd.fu_dep, view_ipd_ipd.stat_dsc, view_ipd_ipd.inp_id,
//         view_ipd_ipd.edit_id, view_ipd_ipd.dateinp, view_ipd_ipd.chartward,
//         view_ipd_ipd.chartaud, view_ipd_ipd.typeadmit, view_ipd_ipd.dead,
//         view_ipd_ipd.sentdrg, view_ipd_ipd.drg, view_ipd_ipd.rw,
//         view_ipd_ipd.adjrw, view_ipd_ipd.rw_dr, view_ipd_ipd.rw_coder,
//         view_ipd_ipd.rw_audit, view_ipd_ipd.isaudit, view_ipd_ipd.mdc,
//         view_ipd_ipd.dc, view_ipd_ipd.rep505, view_ipd_ipd.clinic,
//         view_ipd_ipd.scaned, view_ipd_ipd.room, view_ipd_ipd.visitstat,
//         view_ipd_ipd.admwt, view_ipd_ipd.lastupdate, view_ipd_ipd.title,
//         view_ipd_ipd.name, view_ipd_ipd.middlename, view_ipd_ipd.surname,
//         view_ipd_ipd.birth, view_ipd_ipd.address, view_ipd_ipd.moo,
//         view_ipd_ipd.soi, view_ipd_ipd.road, view_ipd_ipd.zip,
//         view_ipd_ipd.tel, view_ipd_ipd.sex, view_ipd_ipd.marry,
//         view_ipd_ipd.nation, view_ipd_ipd.race, view_ipd_ipd.occupa,
//         view_ipd_ipd.no_card, view_ipd_ipd.father, view_ipd_ipd.mother,
//         view_ipd_ipd.ethnic, view_ipd_ipd.blood, view_ipd_ipd.pttype,
//         view_ipd_ipd.ptt_no, view_ipd_ipd.ward_name, view_ipd_ipd.ward_abbr,
//         view_ipd_ipd.pttype_name, view_ipd_ipd.hospmain_name,
//         view_ipd_ipd.hospmain, view_ipd_ipd.drdisc_name, view_ipd_ipd.staff_name,
//         view_ipd_ipd.opd_date, view_ipd_ipd.opd_dep, view_ipd_ipd.opd_dx1,
//         view_ipd_ipd.opd_referin, view_ipd_ipd.opd_dr, view_ipd_ipd.age,
//         view_ipd_ipd.age_type, view_ipd_ipd.opd_clinic, view_ipd_ipd.opd_emg,
//         view_ipd_ipd.opd_cost, view_ipd_ipd.price, view_ipd_ipd.ptt_paid,
//         view_ipd_ipd.free, view_ipd_ipd.paid, view_ipd_ipd.assur,
//         view_ipd_ipd.hospsub, view_ipd_ipd.leaveday, view_ipd_ipd.actlos,
//         view_ipd_ipd.wtlos, view_ipd_ipd.drg_error, view_ipd_ipd.drg_warning,
//         view_ipd_ipd.grouper_version, view_ipd_ipd.pttype_std, view_ipd_ipd.dr_name,
//         view_ipd_ipd.add, view_ipd_ipd.ward_std, view_ipd_ipd.pttype_class,
//         view_ipd_ipd.pttype_std1, view_ipd_ipd.pttype_std2,
//         view_ipd_ipd.pttype_insclass, view_ipd_ipd.tambol, view_ipd_ipd.amp,
//         view_ipd_ipd.prov
//       FROM view_ipd_ipd
//       WHERE an = ?
//       ORDER BY view_ipd_ipd.admite DESC
//       LIMIT 50
//     `;

//     // Execute คำสั่ง SQL
//     const [rows] = await connection.execute(query, [an.trim()]);
//     await connection.end(); // ปิด Connection

//     console.log("📊 [Backend] ข้อมูลจาก SQL:", rows); // Log ข้อมูลที่ดึงมา

//     if (rows.length === 0) {
//       console.log("⚠️ [Backend] ไม่พบข้อมูล AN:", an);
//       return res.status(404).json({ message: "ไม่พบข้อมูล AN นี้" });
//     }

//     res.status(200).json({ an, results: rows });
//   } catch (err) {
//     console.error("🚨 [Backend] SQL Error:", err.message);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// module.exports = { btnsearch };

//ใช้ได้
// const mysql = require("mysql2/promise"); // ใช้ MySQL2 แบบ Promise
// const dbConfig = require("../config/dbConfigMySQL.js"); // Import dbConfig

// const btnsearch = async (req, res) => {
//   try {
//     const { type, text } = req.body; // รับค่าจาก frontend
//     console.log("✅ [Backend] ได้รับค่า:", { type, text });

//     if (!text) {
//       return res.status(400).json({ message: "กรุณาใส่ค่าค้นหา" });
//     }

//     // เงื่อนไข WHERE ตามประเภทข้อมูล
//     let whereCondition = "";
//     switch (type) {
//       case "AN":
//         whereCondition = `WHERE an = ?`;
//         break;
//       case "HN":
//         whereCondition = `WHERE hn = ?`;
//         break;
//       case "เลขบัตรประชาชน":
//         whereCondition = `WHERE no_card = ?`;
//         break;
//       case "ชื่อ":
//         whereCondition = `WHERE name = ?`;
//         break;
//       case "นามสกุล":
//         whereCondition = `WHERE surname = ?`;
//         break;
//       default:
//         return res.status(400).json({ message: "ประเภทข้อมูลไม่ถูกต้อง" });
//     }

//     // เชื่อมต่อฐานข้อมูล MySQL
//     const connection = await mysql.createConnection(dbConfig);

//     // คำสั่ง SQL
//     const query = `
// SELECT
//         view_ipd_ipd.hn, view_ipd_ipd.an, view_ipd_ipd.vn,
//         view_ipd_ipd.admit, view_ipd_ipd.admite, view_ipd_ipd.time,
//         DATE_FORMAT(view_ipd_ipd.disc, '%Y%m%d') as disc,
//         DATE_FORMAT(view_ipd_ipd.disc, '%Y-%m-%d') as disct,
//         view_ipd_ipd.timedisc, view_ipd_ipd.los, view_ipd_ipd.pday,
//         view_ipd_ipd.dep, view_ipd_ipd.dr, view_ipd_ipd.dr_disc,
//         view_ipd_ipd.staff, view_ipd_ipd.ward, view_ipd_ipd.dx1,
//         view_ipd_ipd.dx2, view_ipd_ipd.dx3, view_ipd_ipd.causedead,
//         view_ipd_ipd.refer, view_ipd_ipd.move, view_ipd_ipd.fu,
//         view_ipd_ipd.fu_dep, view_ipd_ipd.stat_dsc, view_ipd_ipd.inp_id,
//         view_ipd_ipd.edit_id, view_ipd_ipd.dateinp, view_ipd_ipd.chartward,
//         view_ipd_ipd.chartaud, view_ipd_ipd.typeadmit, view_ipd_ipd.dead,
//         view_ipd_ipd.sentdrg, view_ipd_ipd.drg, view_ipd_ipd.rw,
//         view_ipd_ipd.adjrw, view_ipd_ipd.rw_dr, view_ipd_ipd.rw_coder,
//         view_ipd_ipd.rw_audit, view_ipd_ipd.isaudit, view_ipd_ipd.mdc,
//         view_ipd_ipd.dc, view_ipd_ipd.rep505, view_ipd_ipd.clinic,
//         view_ipd_ipd.scaned, view_ipd_ipd.room, view_ipd_ipd.visitstat,
//         view_ipd_ipd.admwt, view_ipd_ipd.lastupdate, view_ipd_ipd.title,
//         view_ipd_ipd.name, view_ipd_ipd.middlename, view_ipd_ipd.surname,
//         view_ipd_ipd.birth, view_ipd_ipd.address, view_ipd_ipd.moo,
//         view_ipd_ipd.soi, view_ipd_ipd.road, view_ipd_ipd.zip,
//         view_ipd_ipd.tel, view_ipd_ipd.sex, view_ipd_ipd.marry,
//         view_ipd_ipd.nation, view_ipd_ipd.race, view_ipd_ipd.occupa,
//         view_ipd_ipd.no_card, view_ipd_ipd.father, view_ipd_ipd.mother,
//         view_ipd_ipd.ethnic, view_ipd_ipd.blood, view_ipd_ipd.pttype,
//         view_ipd_ipd.ptt_no, view_ipd_ipd.ward_name, view_ipd_ipd.ward_abbr,
//         view_ipd_ipd.pttype_name, view_ipd_ipd.hospmain_name,
//         view_ipd_ipd.hospmain, view_ipd_ipd.drdisc_name, view_ipd_ipd.staff_name,
//         view_ipd_ipd.opd_date, view_ipd_ipd.opd_dep, view_ipd_ipd.opd_dx1,
//         view_ipd_ipd.opd_referin, view_ipd_ipd.opd_dr, view_ipd_ipd.age,
//         view_ipd_ipd.age_type, view_ipd_ipd.opd_clinic, view_ipd_ipd.opd_emg,
//         view_ipd_ipd.opd_cost, view_ipd_ipd.price, view_ipd_ipd.ptt_paid,
//         view_ipd_ipd.free, view_ipd_ipd.paid, view_ipd_ipd.assur,
//         view_ipd_ipd.hospsub, view_ipd_ipd.leaveday, view_ipd_ipd.actlos,
//         view_ipd_ipd.wtlos, view_ipd_ipd.drg_error, view_ipd_ipd.drg_warning,
//         view_ipd_ipd.grouper_version, view_ipd_ipd.pttype_std, view_ipd_ipd.dr_name,
//         view_ipd_ipd.add, view_ipd_ipd.ward_std, view_ipd_ipd.pttype_class,
//         view_ipd_ipd.pttype_std1, view_ipd_ipd.pttype_std2,
//         view_ipd_ipd.pttype_insclass, view_ipd_ipd.tambol, view_ipd_ipd.amp,
//         view_ipd_ipd.prov
//       FROM view_ipd_ipd
//       ${whereCondition}
//       ORDER BY view_ipd_ipd.admite DESC
//       LIMIT 50
//     `;

//     console.log("🟢 [Backend] SQL Query:", query, text); // Log Query

//     // Execute คำสั่ง SQL
//     const [rows] = await connection.execute(query, [text]);

//     await connection.end(); // ปิด Connection
//     console.log("📊 [Backend] ข้อมูลจาก SQL:", rows); // Log ข้อมูลที่ดึงมา

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "ไม่พบข้อมูล" });
//     }

//     res.status(200).json({ results: rows });
//   } catch (err) {
//     console.error("🚨 [Backend] SQL Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// module.exports = { btnsearch };

// แก้ไขล่าสุดยังไม่เทส
const mysql = require("mysql2/promise"); // ใช้ MySQL2 แบบ Promise
const dbConfig = require("../config/dbConfigMySQL.js"); // Import dbConfig

const btnsearch = async (req, res) => {
  try {
    const { patientType, type, text } = req.body; // รับค่าจาก frontend
    console.log("✅ [Backend] ได้รับค่า:", { patientType, type, text });

    if (!text || !patientType) {
      return res
        .status(400)
        .json({ message: "กรุณาใส่ค่าค้นหา และระบุประเภทผู้ป่วย (IPD/OPD)" });
    }

    // กำหนดเงื่อนไข WHERE เท่านั้น
    let whereCondition = "";

    if (patientType === "IPD") {
      switch (type) {
        case "AN":
          whereCondition = `WHERE an = ?`;
          break;
        case "HN":
          whereCondition = `WHERE hn = ?`;
          break;
        case "เลขบัตรประชาชน":
          whereCondition = `WHERE no_card = ?`;
          break;
        case "ชื่อ":
          whereCondition = `WHERE name = ?`;
          break;
        case "นามสกุล":
          whereCondition = `WHERE surname = ?`;
          break;
        default:
          return res
            .status(400)
            .json({ message: "ประเภทข้อมูลไม่ถูกต้องสำหรับ IPD" });
      }
    } else if (patientType === "OPD") {
      switch (type) {
        case "HN":
          whereCondition = `WHERE view_opd_visit.hn = ?`;
          break;
        case "VN":
          whereCondition = `WHERE view_opd_visit.vn = ?`;
          break;
        case "เลขบัตรประชาชน":
          whereCondition = `WHERE view_patient.no_card = ?`;
          break;
        default:
          return res
            .status(400)
            .json({ message: "ประเภทข้อมูลไม่ถูกต้องสำหรับ OPD" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "ประเภทผู้ป่วยไม่ถูกต้อง (ต้องเป็น IPD หรือ OPD)" });
    }

    // เชื่อมต่อฐานข้อมูล MySQL
    const connection = await mysql.createConnection(dbConfig);

    // คำสั่ง SQL (สุดท้าย)
    const query = `
SELECT
        view_ipd_ipd.hn, view_ipd_ipd.an, view_ipd_ipd.vn,
        view_ipd_ipd.admit, view_ipd_ipd.admite, view_ipd_ipd.time,
        DATE_FORMAT(view_ipd_ipd.disc, '%Y%m%d') as disc,
        DATE_FORMAT(view_ipd_ipd.disc, '%Y-%m-%d') as disct,
        view_ipd_ipd.timedisc, view_ipd_ipd.los, view_ipd_ipd.pday,
        view_ipd_ipd.dep, view_ipd_ipd.dr, view_ipd_ipd.dr_disc,
        view_ipd_ipd.staff, view_ipd_ipd.ward, view_ipd_ipd.dx1,
        view_ipd_ipd.dx2, view_ipd_ipd.dx3, view_ipd_ipd.causedead,
        view_ipd_ipd.refer, view_ipd_ipd.move, view_ipd_ipd.fu,
        view_ipd_ipd.fu_dep, view_ipd_ipd.stat_dsc, view_ipd_ipd.inp_id,
        view_ipd_ipd.edit_id, view_ipd_ipd.dateinp, view_ipd_ipd.chartward,
        view_ipd_ipd.chartaud, view_ipd_ipd.typeadmit, view_ipd_ipd.dead,
        view_ipd_ipd.sentdrg, view_ipd_ipd.drg, view_ipd_ipd.rw,
        view_ipd_ipd.adjrw, view_ipd_ipd.rw_dr, view_ipd_ipd.rw_coder,
        view_ipd_ipd.rw_audit, view_ipd_ipd.isaudit, view_ipd_ipd.mdc,
        view_ipd_ipd.dc, view_ipd_ipd.rep505, view_ipd_ipd.clinic,
        view_ipd_ipd.scaned, view_ipd_ipd.room, view_ipd_ipd.visitstat,
        view_ipd_ipd.admwt, view_ipd_ipd.lastupdate, view_ipd_ipd.title,
        view_ipd_ipd.name, view_ipd_ipd.middlename, view_ipd_ipd.surname,
        view_ipd_ipd.birth, view_ipd_ipd.address, view_ipd_ipd.moo,
        view_ipd_ipd.soi, view_ipd_ipd.road, view_ipd_ipd.zip,
        view_ipd_ipd.tel, view_ipd_ipd.sex, view_ipd_ipd.marry,
        view_ipd_ipd.nation, view_ipd_ipd.race, view_ipd_ipd.occupa,
        view_ipd_ipd.no_card, view_ipd_ipd.father, view_ipd_ipd.mother,
        view_ipd_ipd.ethnic, view_ipd_ipd.blood, view_ipd_ipd.pttype,
        view_ipd_ipd.ptt_no, view_ipd_ipd.ward_name, view_ipd_ipd.ward_abbr,
        view_ipd_ipd.pttype_name, view_ipd_ipd.hospmain_name,
        view_ipd_ipd.hospmain, view_ipd_ipd.drdisc_name, view_ipd_ipd.staff_name,
        view_ipd_ipd.opd_date, view_ipd_ipd.opd_dep, view_ipd_ipd.opd_dx1,
        view_ipd_ipd.opd_referin, view_ipd_ipd.opd_dr, view_ipd_ipd.age,
        view_ipd_ipd.age_type, view_ipd_ipd.opd_clinic, view_ipd_ipd.opd_emg,
        view_ipd_ipd.opd_cost, view_ipd_ipd.price, view_ipd_ipd.ptt_paid,
        view_ipd_ipd.free, view_ipd_ipd.paid, view_ipd_ipd.assur,
        view_ipd_ipd.hospsub, view_ipd_ipd.leaveday, view_ipd_ipd.actlos,
        view_ipd_ipd.wtlos, view_ipd_ipd.drg_error, view_ipd_ipd.drg_warning,
        view_ipd_ipd.grouper_version, view_ipd_ipd.pttype_std, view_ipd_ipd.dr_name,
        view_ipd_ipd.add, view_ipd_ipd.ward_std, view_ipd_ipd.pttype_class,
        view_ipd_ipd.pttype_std1, view_ipd_ipd.pttype_std2,
        view_ipd_ipd.pttype_insclass, view_ipd_ipd.tambol, view_ipd_ipd.amp,
        view_ipd_ipd.prov
      FROM view_ipd_ipd
      ${whereCondition}
      ORDER BY view_ipd_ipd.admite DESC
      LIMIT 50
    `;

    console.log("🟢 [Backend] SQL Query:", query, text); // Log Query

    // Execute คำสั่ง SQL
    const [rows] = await connection.execute(query, [text]);

    await connection.end(); // ปิด Connection
    console.log("📊 [Backend] ข้อมูลจาก SQL:", rows); // Log ข้อมูลที่ดึงมา

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูล" });
    }

    res.status(200).json({ results: rows });
  } catch (err) {
    console.error("🚨 [Backend] SQL Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { btnsearch };

// จากโคดนี้ถ้าได้รับค่า IPD จากฟร้อนเอนและ

// ค่าที่ส่งมาเป็น "AN" ให้ใช้ " where an = ' ข้อความที่ได้รับ ' "
//                     แต่ถ้าเป็น "HN"
//                         ให้ใช้ " where hn = ' ข้อความที่ได้รับ '"
//                     แต่ถ้าเป็น "เลขบัตรประชาชน"
//                         ให้ใช้ " where no_card = = ' ข้อความที่ได้รับ  %'"
//                     แต่ถ้าเป็น "ชื่อ"
//                         ให้ใช้ " where name =  '" ข้อความที่ได้รับ %'"
//                     แต่ถ้าเป็น "นามสกุล"
//                         ให้ใช้ " where surname =  '" ข้อความที่ได้รับ %'"

// สรุปต้องรับค่า 2 อย่างเพื่อให้ได้ sql เพื่อนำไปใช้ต่อใน sql อื่น

// ตัวอย่าง
// if (text) {
//         whereCondition += whereCondition
//           ? ` AND (dbo.ms_drugindex.drugindexname = '%${text}%' OR dbo.ms_drug.orderitemcode = '%${text}%' OR dbo.ms_drug.orderitemTHname = '%${text}%' OR dbo.ms_drug.orderitemENname = '${text}%')`
//           : `WHERE (dbo.ms_drugindex.drugindexname = '%${text}%' OR dbo.ms_drug.orderitemcode = '%${text}%' OR dbo.ms_drug.orderitemTHname = '%${text}%' OR dbo.ms_drug.orderitemENname = '${text}%')`;
//       }

//       const result = await request.query(`
//         SELECT
//             dbo.ms_drug.orderitemcode,
//             dbo.ms_drug.orderitemTHname
//             ...
//         LEFT JOIN dbo.ms_drugindex ON
//             dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
//         ${whereCondition}
//         GROUP BY
//         ...
//       `);

//       res.status(200).json(result.recordset);
//     } catch (err) {
//       console.error("SQL error", err);
//       res.status(500).send("Server error");
//     }
//   };

//   const mysql = require("mysql2/promise");
// const dbConfig = require("../config/dbConfigMySQL.js"); // นำเข้า config ของ MySQL

//v.6/2/68
// const mysql = require("mysql2/promise");
// const dbConfig = require("../config/dbConfigMySQL.js"); // นำเข้า config ของ MySQL

// const btnsearch = async (req, res) => {
//   const { an } = req.body; // รับค่า AN จาก frontend

//   if (!an) {
//     return res.status(400).json({ message: "กรุณาใส่ค่า AN" });
//   }

//   try {
//     const pool = await mysql.createPool(dbConfig); // สร้าง connection pool
//     const [rows] = await pool.execute(
//       `
//       SELECT
//         view_ipd_ipd.hn, view_ipd_ipd.an, view_ipd_ipd.vn,
//         view_ipd_ipd.admit, view_ipd_ipd.admite, view_ipd_ipd.time,
//         DATE_FORMAT(view_ipd_ipd.disc, '%Y%m%d') as disc,
//         DATE_FORMAT(view_ipd_ipd.disc, '%Y-%m-%d') as disct,
//         view_ipd_ipd.timedisc, view_ipd_ipd.los, view_ipd_ipd.pday,
//         view_ipd_ipd.dep, view_ipd_ipd.dr, view_ipd_ipd.dr_disc,
//         view_ipd_ipd.staff, view_ipd_ipd.ward, view_ipd_ipd.dx1,
//         view_ipd_ipd.dx2, view_ipd_ipd.dx3, view_ipd_ipd.causedead,
//         view_ipd_ipd.refer, view_ipd_ipd.move, view_ipd_ipd.fu,
//         view_ipd_ipd.fu_dep, view_ipd_ipd.stat_dsc, view_ipd_ipd.inp_id,
//         view_ipd_ipd.edit_id, view_ipd_ipd.dateinp, view_ipd_ipd.chartward,
//         view_ipd_ipd.chartaud, view_ipd_ipd.typeadmit, view_ipd_ipd.dead,
//         view_ipd_ipd.sentdrg, view_ipd_ipd.drg, view_ipd_ipd.rw,
//         view_ipd_ipd.adjrw, view_ipd_ipd.rw_dr, view_ipd_ipd.rw_coder,
//         view_ipd_ipd.rw_audit, view_ipd_ipd.isaudit, view_ipd_ipd.mdc,
//         view_ipd_ipd.dc, view_ipd_ipd.rep505, view_ipd_ipd.clinic,
//         view_ipd_ipd.scaned, view_ipd_ipd.room, view_ipd_ipd.visitstat,
//         view_ipd_ipd.admwt, view_ipd_ipd.lastupdate, view_ipd_ipd.title,
//         view_ipd_ipd.name, view_ipd_ipd.middlename, view_ipd_ipd.surname,
//         view_ipd_ipd.birth, view_ipd_ipd.address, view_ipd_ipd.moo,
//         view_ipd_ipd.soi, view_ipd_ipd.road, view_ipd_ipd.zip,
//         view_ipd_ipd.tel, view_ipd_ipd.sex, view_ipd_ipd.marry,
//         view_ipd_ipd.nation, view_ipd_ipd.race, view_ipd_ipd.occupa,
//         view_ipd_ipd.no_card, view_ipd_ipd.father, view_ipd_ipd.mother,
//         view_ipd_ipd.ethnic, view_ipd_ipd.blood, view_ipd_ipd.pttype,
//         view_ipd_ipd.ptt_no, view_ipd_ipd.ward_name, view_ipd_ipd.ward_abbr,
//         view_ipd_ipd.pttype_name, view_ipd_ipd.hospmain_name,
//         view_ipd_ipd.hospmain, view_ipd_ipd.drdisc_name, view_ipd_ipd.staff_name,
//         view_ipd_ipd.opd_date, view_ipd_ipd.opd_dep, view_ipd_ipd.opd_dx1,
//         view_ipd_ipd.opd_referin, view_ipd_ipd.opd_dr, view_ipd_ipd.age,
//         view_ipd_ipd.age_type, view_ipd_ipd.opd_clinic, view_ipd_ipd.opd_emg,
//         view_ipd_ipd.opd_cost, view_ipd_ipd.price, view_ipd_ipd.ptt_paid,
//         view_ipd_ipd.free, view_ipd_ipd.paid, view_ipd_ipd.assur,
//         view_ipd_ipd.hospsub, view_ipd_ipd.leaveday, view_ipd_ipd.actlos,
//         view_ipd_ipd.wtlos, view_ipd_ipd.drg_error, view_ipd_ipd.drg_warning,
//         view_ipd_ipd.grouper_version, view_ipd_ipd.pttype_std, view_ipd_ipd.dr_name,
//         view_ipd_ipd.add, view_ipd_ipd.ward_std, view_ipd_ipd.pttype_class,
//         view_ipd_ipd.pttype_std1, view_ipd_ipd.pttype_std2,
//         view_ipd_ipd.pttype_insclass, view_ipd_ipd.tambol, view_ipd_ipd.amp,
//         view_ipd_ipd.prov
//       FROM view_ipd_ipd
//       WHERE an = ?
//       ORDER BY view_ipd_ipd.admite DESC
//       LIMIT 50
//       `,
//       [an]
//     );

//     pool.end(); // ปิดการเชื่อมต่อ

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "ไม่พบข้อมูล AN นี้" });
//     }

//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Server error");
//   }
// };

// module.exports = { btnsearch };

// // มีหวาด
// Select
//         dbo.ms_patientadmit.hn,
//         dbo.ms_patientadmit.an,
//         dbo.ms_patientadmit.admitteddate,
//         dbo.ms_patientadmit.dischargeddate,
//         case when dbo.ms_patient.patientlanguage = 'TH' THEN
//         dbo.ms_patient.patientnameTH
//         ELSE
//         dbo.ms_patient.patientnameEN End As patientname,
//         dbo.ms_ward.wardcode,
//         dbo.ms_ward.warddesc,
//         dbo.ms_bedmove.toroom,
//         dbo.ms_bedmove.tobed,
//         dbo.ms_patient.sex,
//         dbo.ms_patient.id_card,
//         dbo.ms_patient.patientdob,
//         dbo.ms_patient.maritalstatus,
//         dbo.ms_patient.address,
//         dbo.ms_patient.moo,
//         dbo.ms_patient.tambol,
//         dbo.ms_patient.amp,
//         dbo.ms_patient.provcode,
//         dbo.ms_province.provcode,
//         dbo.ms_province.provname,
//         dbo.ms_right.rightid,
//         case when dbo.ms_patient.patientlanguage = 'TH' THEN
//         dbo.ms_right.rightnameTH
//         ELSE
//         dbo.ms_right.rightnameEN End As rightname
//         FROM dbo.ms_patient
//         LEFT JOIN dbo.ms_patientadmit ON dbo.ms_patient.hn = dbo.ms_patientadmit.hn
//         LEFT JOIN dbo.ms_bedmove ON dbo.ms_patientadmit.an = dbo.ms_bedmove.an
//         LEFT JOIN dbo.ms_ward ON dbo.ms_bedmove.towardcode = dbo.ms_ward.wardcode
//         LEFT JOIN dbo.ms_right ON dbo.ms_right.rightid = dbo.ms_patient.rightid
//         LEFT JOIN dbo.prescriptionheader ON dbo.ms_patientadmit.an = dbo.prescriptionheader.an
//         Left Join dbo.ms_province ON dbo.ms_province.provcode = dbo.ms_patient.provcode
//         WHERE
//         dbo.ms_bedmove.status = 0
//         And dbo.ms_patientadmit.an = '6679932'

//         Function get_ms_labresult
//         Select
//         dbo.ms_labresult.lab_no,
//         dbo.ms_labresult.rax_no,
//         dbo.ms_labresult.type,
//         dbo.ms_labresult.hn,
//         dbo.ms_labresult.lab_code,
//         dbo.ms_labresult.lab_name,
//         ISNULL(dbo.ms_labresult.result, 0) As result,
//         dbo.ms_labresult.type_result,
//         dbo.ms_labresult.unit,
//         ISNULL(dbo.ms_labresult.minresult,'') as minresult ,
//         ISNULL(dbo.ms_labresult.maxresult,'') as maxresult,
//         dbo.ms_labresult.remark,
//         dbo.ms_labresult.date_result,
//         dbo.ms_labresult.ref
//         FROM
//         dbo.ms_labresult
//         Left Join ms_druglabtype ON ms_druglabtype.labname = dbo.ms_labresult.lab_name
//         WHERE dbo.ms_labresult.hn = 'P1234' And ms_druglabtype.labtypename = 'Creatinine'  And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result) FROM dbo.ms_labresult Left Join ms_druglabtype ON ms_druglabtype.labname = dbo.ms_labresult.lab_name WHERE dbo.ms_labresult.hn= 'P1234' And ms_druglabtype.labtypename = 'Creatinine'  And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7)

//         Function showPatientadmit(condition) As DataTable

//          Select
//          view_ipd_ipd.hn,
//          view_ipd_ipd.an,
//          view_ipd_ipd.vn,
//          view_ipd_ipd.admit,
//          view_ipd_ipd.admite,
//          view_ipd_ipd.time,
//          DATE_FORMAT(view_ipd_ipd.disc, '%Y%m%d') as disc,
//          DATE_FORMAT(view_ipd_ipd.disc, 'yyyy-mm-dd') as disct,
//          view_ipd_ipd.timedisc,
//          view_ipd_ipd.los,
//          view_ipd_ipd.pday,
//          view_ipd_ipd.dep,
//          view_ipd_ipd.dr,
//          view_ipd_ipd.dr_disc,
//          view_ipd_ipd.staff,
//          view_ipd_ipd.ward,
//          view_ipd_ipd.dx1,
//          view_ipd_ipd.dx2,
//          view_ipd_ipd.dx3,
//          view_ipd_ipd.causedead,
//          view_ipd_ipd.refer,
//          view_ipd_ipd.move,
//          view_ipd_ipd.fu,
//          view_ipd_ipd.fu_dep,
//          view_ipd_ipd.stat_dsc,
//          view_ipd_ipd.inp_id,
//          view_ipd_ipd.edit_id,
//          view_ipd_ipd.dateinp,
//          view_ipd_ipd.chartward,
//          view_ipd_ipd.chartaud,
//          view_ipd_ipd.typeadmit,
//          view_ipd_ipd.dead,
//          view_ipd_ipd.sentdrg,
//          view_ipd_ipd.drg,
//          view_ipd_ipd.rw,
//          view_ipd_ipd.adjrw,
//          view_ipd_ipd.rw_dr,
//          view_ipd_ipd.rw_coder,
//          view_ipd_ipd.rw_audit,
//          view_ipd_ipd.isaudit,
//          view_ipd_ipd.mdc,
//          view_ipd_ipd.dc,
//          view_ipd_ipd.rep505,
//          view_ipd_ipd.clinic,
//          view_ipd_ipd.scaned,
//          view_ipd_ipd.room,
//          view_ipd_ipd.visitstat,
//          view_ipd_ipd.admwt,
//          view_ipd_ipd.lastupdate,
//          view_ipd_ipd.title,
//          view_ipd_ipd.`name`,
//          view_ipd_ipd.middlename,
//          view_ipd_ipd.surname,
//          view_ipd_ipd.birth,
//          view_ipd_ipd.address,
//          view_ipd_ipd.moo,
//          view_ipd_ipd.soi,
//          view_ipd_ipd.road,
//          view_ipd_ipd.zip,
//          view_ipd_ipd.tel,
//          view_ipd_ipd.sex,
//          view_ipd_ipd.marry,
//          view_ipd_ipd.nation,
//          view_ipd_ipd.race,
//          view_ipd_ipd.occupa,
//          view_ipd_ipd.no_card,
//          view_ipd_ipd.father,
//          view_ipd_ipd.mother,
//          view_ipd_ipd.ethnic,
//          view_ipd_ipd.blood,
//          view_ipd_ipd.pttype,
//          view_ipd_ipd.ptt_no,
//          view_ipd_ipd.ward_name,
//          view_ipd_ipd.ward_abbr,
//          view_ipd_ipd.pttype_name,
//          view_ipd_ipd.hospmain_name,
//          view_ipd_ipd.hospmain,
//          view_ipd_ipd.drdisc_name,
//          view_ipd_ipd.staff_name,
//          view_ipd_ipd.opd_date,
//          view_ipd_ipd.opd_dep,
//          view_ipd_ipd.opd_dx1,
//          view_ipd_ipd.opd_referin,
//          view_ipd_ipd.opd_dr,
//          view_ipd_ipd.age,
//          view_ipd_ipd.age_type,
//          view_ipd_ipd.opd_clinic,
//          view_ipd_ipd.opd_emg,
//          view_ipd_ipd.opd_cost,
//          view_ipd_ipd.price,
//          view_ipd_ipd.ptt_paid,
//          view_ipd_ipd.free,
//          view_ipd_ipd.paid,
//          view_ipd_ipd.assur,
//          view_ipd_ipd.hospsub,
//          view_ipd_ipd.leaveday,
//          view_ipd_ipd.actlos,
//          view_ipd_ipd.wtlos,
//          view_ipd_ipd.drg_error,
//          view_ipd_ipd.drg_warning,
//          view_ipd_ipd.grouper_version,
//          view_ipd_ipd.pttype_std,
//          view_ipd_ipd.dr_name,
//          view_ipd_ipd.`add`,
//          view_ipd_ipd.ward_std,
//          view_ipd_ipd.pttype_class,
//          view_ipd_ipd.pttype_std1,
//          view_ipd_ipd.pttype_std2,
//          view_ipd_ipd.pttype_insclass,
//          view_ipd_ipd.tambol,
//          view_ipd_ipd.amp,
//          view_ipd_ipd.prov
//          From view_ipd_ipd
//          where an = '6679932'
//          ORDER BY
//          view_ipd_ipd.admite DESC LIMIT 50

///////////////////////////////////////////////////////////////////////////////////////////
// // models/ipdModel.js
// const pool = require("../models/dbMySQL"); // ใช้การเชื่อมต่อ MySQL จาก pool

// const dbMySQL = require("../models/dbMySQL"); // ใช้การเชื่อมต่อ MySQL

// async function medicationProfile(req, res) {
//   const { an } = req.params; // รับค่า an จาก URL parameter

//   // คำสั่ง SQL สำหรับดึงข้อมูลที่ต้องการ
//   const query = `
//         SELECT
//             view_ipd_ipd.hn,
//             view_ipd_ipd.an,
//             view_ipd_ipd.admit,
//             view_ipd_ipd.title,
//             view_ipd_ipd.name,
//             view_ipd_ipd.middlename,
//             view_ipd_ipd.surname,
//             view_ipd_ipd.birth,
//             view_ipd_ipd.sex,
//             view_ipd_ipd.ward_name,
//             view_ipd_ipd.pttype_name,
//             view_ipd_ipd.dr_name
//         FROM view_ipd_ipd
//         WHERE an = ?
//         ORDER BY view_ipd_ipd.admite DESC
//         LIMIT 50;
//     `;

//   try {
//     dbMySQL.query(query, [an], (err, results) => {
//       if (err) {
//         console.error("SQL error", err);
//         return res.status(500).send("Internal Server Error");
//       }

//       // เตรียมข้อมูลในรูปแบบที่ต้องการ
//       const finalResults = results.map((record) => ({
//         hn: record.hn,
//         an: record.an,
//         admit: record.admit,
//         title: record.title,
//         name: record.name,
//         middlename: record.middlename,
//         surname: record.surname,
//         birth: record.birth,
//         sex: record.sex,
//         ward_name: record.ward_name,
//         pttype_name: record.pttype_name,
//         dr_name: record.dr_name,
//       }));

//       res.status(200).json(finalResults); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     });
//   } catch (err) {
//     console.error("Error during database query", err);
//     res.status(500).send("Internal Server Error");
//   }
// }

// module.exports = {
//   medicationProfile,
// };

// const dbMySQL = require("../models/dbMySQL");

// const medicationProfile = (an) => {
//   return new Promise((resolve, reject) => {
//     const sqlQuery = `
//       SELECT
//           view_ipd_ipd.hn,
//           view_ipd_ipd.an,
//           view_ipd_ipd.admit,
//           view_ipd_ipd.title,
//           view_ipd_ipd.name,
//           view_ipd_ipd.middlename,
//           view_ipd_ipd.surname,
//           view_ipd_ipd.birth,
//           view_ipd_ipd.sex,
//           view_ipd_ipd.ward_name,
//           view_ipd_ipd.pttype_name,
//           view_ipd_ipd.dr_name
//       FROM view_ipd_ipd
//       WHERE an = ?
//       ORDER BY view_ipd_ipd.admite DESC
//       LIMIT 50;
//     `;

//     dbMySQL.query(sqlQuery, [an], (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

// module.exports = { medicationProfile };

// Select
//         dbo.ms_patientlabresult.patientlabcode,
//         dbo.ms_patientlabresult.hn,
//         dbo.ms_patientlabresult.an,
//         dbo.ms_patientlabresult.weight,
//         dbo.ms_patientlabresult.height,
//         dbo.ms_patientlabresult.bsa,
//         dbo.ms_patientlabresult.eGFR,
//         dbo.ms_patientlabresult.Crcl,
//         dbo.ms_patientlabresult.scr,
//         dbo.ms_patientlabresult.lastmodified
//         FROM
//         dbo.ms_patientlabresult
// where dbo.ms_patientlabresult.an ='6764154'

// Select
//     view_ipd_ipd.hn,
//     view_ipd_ipd.an,
//     view_ipd_ipd.vn,
//     view_ipd_ipd.admit,
//     view_ipd_ipd.admite,
//     view_ipd_ipd.time,
//     DATE_FORMAT(view_ipd_ipd.disc, '%Y%m%d') as disc,
//     DATE_FORMAT(view_ipd_ipd.disc, 'yyyy-mm-dd') as disct,
//     view_ipd_ipd.timedisc,
//     view_ipd_ipd.los,
//     view_ipd_ipd.pday,
//     view_ipd_ipd.dep,
//     view_ipd_ipd.dr,
//     view_ipd_ipd.dr_disc,
//     view_ipd_ipd.staff,
//     view_ipd_ipd.ward,
//     view_ipd_ipd.dx1,
//     view_ipd_ipd.dx2,
//     view_ipd_ipd.dx3,
//     view_ipd_ipd.causedead,
//     view_ipd_ipd.refer,
//     view_ipd_ipd.move,
//     view_ipd_ipd.fu,
//     view_ipd_ipd.fu_dep,
//     view_ipd_ipd.stat_dsc,
//     view_ipd_ipd.inp_id,
//     view_ipd_ipd.edit_id,
//     view_ipd_ipd.dateinp,
//     view_ipd_ipd.chartward,
//     view_ipd_ipd.chartaud,
//     view_ipd_ipd.typeadmit,
//     view_ipd_ipd.dead,
//     view_ipd_ipd.sentdrg,
//     view_ipd_ipd.drg,
//     view_ipd_ipd.rw,
//     view_ipd_ipd.adjrw,
//     view_ipd_ipd.rw_dr,
//     view_ipd_ipd.rw_coder,
//     view_ipd_ipd.rw_audit,
//     view_ipd_ipd.isaudit,
//     view_ipd_ipd.mdc,
//     view_ipd_ipd.dc,
//     view_ipd_ipd.rep505,
//     view_ipd_ipd.clinic,
//     view_ipd_ipd.scaned,
//     view_ipd_ipd.room,
//     view_ipd_ipd.visitstat,
//     view_ipd_ipd.admwt,
//     view_ipd_ipd.lastupdate,
//     view_ipd_ipd.title,
//     view_ipd_ipd.`name`,
//     view_ipd_ipd.middlename,
//     view_ipd_ipd.surname,
//     view_ipd_ipd.birth,
//     view_ipd_ipd.address,
//     view_ipd_ipd.moo,
//     view_ipd_ipd.soi,
//     view_ipd_ipd.road,
//     view_ipd_ipd.zip,
//     view_ipd_ipd.tel,
//     view_ipd_ipd.sex,
//     view_ipd_ipd.marry,
//     view_ipd_ipd.nation,
//     view_ipd_ipd.race,
//     view_ipd_ipd.occupa,
//     view_ipd_ipd.no_card,
//     view_ipd_ipd.father,
//     view_ipd_ipd.mother,
//     view_ipd_ipd.ethnic,
//     view_ipd_ipd.blood,
//     view_ipd_ipd.pttype,
//     view_ipd_ipd.ptt_no,
//     view_ipd_ipd.ward_name,
//     view_ipd_ipd.ward_abbr,
//     view_ipd_ipd.pttype_name,
//     view_ipd_ipd.hospmain_name,
//     view_ipd_ipd.hospmain,
//     view_ipd_ipd.drdisc_name,
//     view_ipd_ipd.staff_name,
//     view_ipd_ipd.opd_date,
//     view_ipd_ipd.opd_dep,
//     view_ipd_ipd.opd_dx1,
//     view_ipd_ipd.opd_referin,
//     view_ipd_ipd.opd_dr,
//     view_ipd_ipd.age,
//     view_ipd_ipd.age_type,
//     view_ipd_ipd.opd_clinic,
//     view_ipd_ipd.opd_emg,
//     view_ipd_ipd.opd_cost,
//     view_ipd_ipd.price,
//     view_ipd_ipd.ptt_paid,
//     view_ipd_ipd.free,
//     view_ipd_ipd.paid,
//     view_ipd_ipd.assur,
//     view_ipd_ipd.hospsub,
//     view_ipd_ipd.leaveday,
//     view_ipd_ipd.actlos,
//     view_ipd_ipd.wtlos,
//     view_ipd_ipd.drg_error,
//     view_ipd_ipd.drg_warning,
//     view_ipd_ipd.grouper_version,
//     view_ipd_ipd.pttype_std,
//     view_ipd_ipd.dr_name,
//     view_ipd_ipd.`add`,
//     view_ipd_ipd.ward_std,
//     view_ipd_ipd.pttype_class,
//     view_ipd_ipd.pttype_std1,
//     view_ipd_ipd.pttype_std2,
//     view_ipd_ipd.pttype_insclass,
//     view_ipd_ipd.tambol,
//     view_ipd_ipd.amp,
//     view_ipd_ipd.prov
//     From view_ipd_ipd
// where an = '6723165'
//     ORDER BY
//     view_ipd_ipd.admite DESC LIMIT 50

//search ไป search ต่อ
// UPDATE ms_patient
//         SET
//         ms_patient.title = 'title' ,
//         ms_patient.patientnameTH = 'patientnameTH' ,
//         ms_patient.patientnameEN = 'patientnameEN' ,
//         ms_patient.sex = 'sex' ,
//         ms_patient.patientdob = 'patientdob' ,
//         ms_patient.maritalstatus = 'maritalstatus' ,
//         ms_patient.patientlanguage = 'patientlanguage' ,
//         ms_patient.rightid = 'rightid' ,
//         ms_patient.imgpath = 'imgpath' ,
//         ms_patient.address = 'address' ,
//         ms_patient.moo = 'moo' ,
//         ms_patient.tambol = 'tambol' ,
//         ms_patient.amp = 'amp' ,
//         ms_patient.provcode = 'provcode' ,
//         ms_patient.id_card = 'id_card' ,

//         ms_patient.lastmodified = getdate()
// WHERE ms_patient.hn = 'hn'

// Select
//         dbo.ms_patientlabresult.patientlabcode,
//         dbo.ms_patientlabresult.hn,
//         dbo.ms_patientlabresult.an,
//         dbo.ms_patientlabresult.weight,
//         dbo.ms_patientlabresult.height,
//         dbo.ms_patientlabresult.bsa,
//         dbo.ms_patientlabresult.eGFR,
//         dbo.ms_patientlabresult.Crcl,
//         dbo.ms_patientlabresult.scr,
//         dbo.ms_patientlabresult.lastmodified
//         FROM
//         dbo.ms_patientlabresult

//         Select
//         dbo.ms_patientadmit.hn,
//         dbo.ms_patientadmit.an,
//         dbo.ms_patientadmit.admitteddate,
//         dbo.ms_patientadmit.dischargeddate,
//         case when dbo.ms_patient.patientlanguage = 'TH' THEN
//         dbo.ms_patient.patientnameTH
//         ELSE
//         dbo.ms_patient.patientnameEN End As patientname,
//         dbo.ms_ward.wardcode,
//         dbo.ms_ward.warddesc,
//         dbo.ms_bedmove.toroom,
//         dbo.ms_bedmove.tobed,
//         dbo.ms_patient.sex,
//         dbo.ms_patient.id_card,
//         dbo.ms_patient.patientdob,
//         dbo.ms_patient.maritalstatus,
//         dbo.ms_patient.address,
//         dbo.ms_patient.moo,
//         dbo.ms_patient.tambol,
//         dbo.ms_patient.amp,
//         dbo.ms_patient.provcode,
//         dbo.ms_province.provcode,
//         dbo.ms_province.provname,
//         dbo.ms_right.rightid,
//         case when dbo.ms_patient.patientlanguage = 'TH' THEN
//         dbo.ms_right.rightnameTH
//         ELSE
//         dbo.ms_right.rightnameEN End As rightname
//         FROM dbo.ms_patient
//         LEFT JOIN dbo.ms_patientadmit ON dbo.ms_patient.hn = dbo.ms_patientadmit.hn
//         LEFT JOIN dbo.ms_bedmove ON dbo.ms_patientadmit.an = dbo.ms_bedmove.an
//         LEFT JOIN dbo.ms_ward ON dbo.ms_bedmove.towardcode = dbo.ms_ward.wardcode
//         LEFT JOIN dbo.ms_right ON dbo.ms_right.rightid = dbo.ms_patient.rightid
//         LEFT JOIN dbo.prescriptionheader ON dbo.ms_patientadmit.an = dbo.prescriptionheader.an
//         Left Join dbo.ms_province ON dbo.ms_province.provcode = dbo.ms_patient.provcode
//         WHERE
//         dbo.ms_bedmove.status = 0
//         And dbo.ms_patientadmit.an = ''

//         Select
//         dbo.ms_adr.AllergyGroupCd,
//         dbo.ms_adr.AllergyGroupNm,
//         dbo.ms_adr.adversereactions,
//         dbo.ms_adr.typeofadr,
//         dbo.ms_adr.naranjoscore,
//         dbo.ms_adr.propability,
//         dbo.ms_adr.policy,
//         dbo.ms_adr.startadrddatetime,
//         dbo.ms_adrgeneric.genericname,
//         dbo.ms_allergygroupdetail.ingredientcode,
//         CASE WHEN dbo.ms_adr.AllergyGroupCd Is NULL THEN
//         dbo.ms_adrgeneric.genericname
//         ELSE
//         dbo.ms_ingredient.ingredientname
//         END AS patadr
//         FROM
//         dbo.ms_adr
//         Left JOIN dbo.ms_adrgeneric ON dbo.ms_adr.adrcode = dbo.ms_adrgeneric.adrcode
//         LEFT JOIN dbo.ms_allergygroupdetail ON dbo.ms_adr.AllergyGroupCd = dbo.ms_allergygroupdetail.AllergyGroupCd
//         Left Join dbo.ms_ingredient  ON dbo.ms_ingredient.ingredientcode = dbo.ms_allergygroupdetail.ingredientcode
//         WHERE
//         dbo.ms_adr.hn = '57023999'
//         ORDER BY
//         dbo.ms_adr.AllergyGroupCd

//ใช้ req.params ในการรับค่า an จาก URL parameter
// const pool = require("../models/dbMySQL"); // ใช้ pool ที่สร้างไว้แทน connection เดิม

// async function medicationProfile(req, res) {
//   const { an } = req.params; // รับค่า an จาก URL parameter

//   const query = `
//     SELECT
//       view_ipd_ipd.hn,
//       view_ipd_ipd.an,
//       view_ipd_ipd.admit,
//       view_ipd_ipd.title,
//       view_ipd_ipd.name,
//       view_ipd_ipd.middlename,
//       view_ipd_ipd.surname,
//       view_ipd_ipd.birth,
//       view_ipd_ipd.sex,
//       view_ipd_ipd.ward_name,
//       view_ipd_ipd.pttype_name,
//       view_ipd_ipd.dr_name
//     FROM view_ipd_ipd
//     WHERE an = ?
//     ORDER BY view_ipd_ipd.admite DESC
//     LIMIT 50;
//   `;

//   try {
//     pool.query(query, [an], (err, results) => {
//       if (err) {
//         console.error("SQL error", err);
//         return res.status(500).send("Internal Server Error");
//       }

//       // เตรียมข้อมูลในรูปแบบที่ต้องการ
//       const finalResults = results.map((record) => ({
//         hn: record.hn,
//         an: record.an,
//         admit: record.admit,
//         title: record.title,
//         name: record.name,
//         middlename: record.middlename,
//         surname: record.surname,
//         birth: record.birth,
//         sex: record.sex,
//         ward_name: record.ward_name,
//         pttype_name: record.pttype_name,
//         dr_name: record.dr_name,
//       }));

//       res.status(200).json(finalResults); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     });
//   } catch (err) {
//     console.error("Error during database query", err);
//     res.status(500).send("Internal Server Error");
//   }
// }

// module.exports = {
//   medicationProfile,
// };

//ส่งข้อมูลผ่าน body ไม่ใช่ URL parameter
// const pool = require("../models/dbMySQL"); // ใช้ pool ที่สร้างไว้แทน connection เดิม

// async function medicationProfile_database_view(req, res) {
//   const { an } = req.body; // รับค่า an จาก body ของ request
//   console.log("Received AN:", an);
//   const query = `
//     SELECT
//       view_ipd_ipd.hn,
//       view_ipd_ipd.an,
//       view_ipd_ipd.admit,
//       view_ipd_ipd.title,
//       view_ipd_ipd.name,
//       view_ipd_ipd.middlename,
//       view_ipd_ipd.surname,
//       view_ipd_ipd.birth,
//       view_ipd_ipd.sex,
//       view_ipd_ipd.ward_name,
//       view_ipd_ipd.pttype_name,
//       view_ipd_ipd.dr_name
//     FROM view_ipd_ipd
//     WHERE an = ?
//     ORDER BY view_ipd_ipd.admit DESC
//     LIMIT 50;
//   `;

//   try {
//     pool.query(query, [an], (err, results) => {
//       if (err) {
//         console.error("SQL error", err);
//         return res.status(500).send("Internal Server Error");
//       }

//       // เตรียมข้อมูลในรูปแบบที่ต้องการ
//       const finalResults = results.map((record) => ({
//         hn: record.hn,
//         an: record.an,
//         admit: record.admit,
//         title: record.title,
//         name: record.name,
//         middlename: record.middlename,
//         surname: record.surname,
//         birth: record.birth,
//         sex: record.sex,
//         ward_name: record.ward_name,
//         pttype_name: record.pttype_name,
//         dr_name: record.dr_name,
//       }));

//       res.status(200).json(finalResults); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     });
//   } catch (err) {
//     console.error("Error during database query", err);
//     res.status(500).send("Internal Server Error");
//   }
// }

// module.exports = {
//   medicationProfile_database_view,
// };

// SELECT *
// FROM
// dbo.ms_bedmove
// WHERE
// dbo.ms_bedmove.an = '6722818'
// and dbo.ms_bedmove.towardcode = '7'
// and status ='0'

// Select
// dbo.ms_patientlabresult.patientlabcode,
// dbo.ms_patientlabresult.hn,
// dbo.ms_patientlabresult.an,
// dbo.ms_patientlabresult.weight,
// dbo.ms_patientlabresult.height,
// dbo.ms_patientlabresult.bsa,
// dbo.ms_patientlabresult.eGFR,
// dbo.ms_patientlabresult.Crcl,
// dbo.ms_patientlabresult.scr,
// dbo.ms_patientlabresult.lastmodified
// FROM
// dbo.ms_patientlabresult
//  where dbo.ms_patientlabresult.an ='6722818'

// Select
// dbo.ms_patientadmit.hn,
// dbo.ms_patientadmit.an,
// dbo.ms_patientadmit.admitteddate,
// dbo.ms_patientadmit.dischargeddate,
// case when dbo.ms_patient.patientlanguage = 'TH' THEN
// dbo.ms_patient.patientnameTH
// ELSE
// dbo.ms_patient.patientnameEN End As patientname,
// dbo.ms_ward.wardcode,
// dbo.ms_ward.warddesc,
// dbo.ms_bedmove.toroom,
// dbo.ms_bedmove.tobed,
// dbo.ms_patient.sex,
// dbo.ms_patient.id_card,
// dbo.ms_patient.patientdob,
// dbo.ms_patient.maritalstatus,
// dbo.ms_patient.address,
// dbo.ms_patient.moo,
// dbo.ms_patient.tambol,
// dbo.ms_patient.amp,
// dbo.ms_patient.provcode,
// dbo.ms_province.provcode,
// dbo.ms_province.provname,
// dbo.ms_right.rightid,
// case when dbo.ms_patient.patientlanguage = 'TH' THEN
// dbo.ms_right.rightnameTH
// ELSE
// dbo.ms_right.rightnameEN End As rightname
// FROM dbo.ms_patient
// LEFT JOIN dbo.ms_patientadmit ON dbo.ms_patient.hn = dbo.ms_patientadmit.hn
// LEFT JOIN dbo.ms_bedmove ON dbo.ms_patientadmit.an = dbo.ms_bedmove.an
// LEFT JOIN dbo.ms_ward ON dbo.ms_bedmove.towardcode = dbo.ms_ward.wardcode
// LEFT JOIN dbo.ms_right ON dbo.ms_right.rightid = dbo.ms_patient.rightid
// LEFT JOIN dbo.prescriptionheader ON dbo.ms_patientadmit.an = dbo.prescriptionheader.an
// Left Join dbo.ms_province ON dbo.ms_province.provcode = dbo.ms_patient.provcode
// WHERE
// dbo.ms_bedmove.status = 0
// And dbo.ms_patientadmit.an = '6722818'

// Select
// dbo.ms_adr.AllergyGroupCd,
// dbo.ms_adr.AllergyGroupNm,
// dbo.ms_adr.adversereactions,
// dbo.ms_adr.typeofadr,
// dbo.ms_adr.naranjoscore,
// dbo.ms_adr.propability,
// dbo.ms_adr.policy,
// dbo.ms_adr.startadrddatetime,
// dbo.ms_adrgeneric.genericname,
// dbo.ms_allergygroupdetail.ingredientcode,
// CASE WHEN dbo.ms_adr.AllergyGroupCd Is NULL THEN
// dbo.ms_adrgeneric.genericname
// ELSE
// dbo.ms_ingredient.ingredientname
// END AS patadr
// FROM
// dbo.ms_adr
// Left JOIN dbo.ms_adrgeneric ON dbo.ms_adr.adrcode = dbo.ms_adrgeneric.adrcode
// LEFT JOIN dbo.ms_allergygroupdetail ON dbo.ms_adr.AllergyGroupCd = dbo.ms_allergygroupdetail.AllergyGroupCd
// Left Join dbo.ms_ingredient  ON dbo.ms_ingredient.ingredientcode = dbo.ms_allergygroupdetail.ingredientcode
// WHERE
// dbo.ms_adr.hn = ''
// ORDER BY
// dbo.ms_adr.AllergyGroupCd

// Select
// dbo.ms_labresult.lab_no,
// dbo.ms_labresult.rax_no,
// dbo.ms_labresult.type,
// dbo.ms_labresult.hn,
// dbo.ms_labresult.lab_code,
// dbo.ms_labresult.lab_name,
// ISNULL(dbo.ms_labresult.result, 0) As result,
// dbo.ms_labresult.type_result,
// dbo.ms_labresult.unit,
// ISNULL(dbo.ms_labresult.minresult,'') as minresult ,
// ISNULL(dbo.ms_labresult.maxresult,'') as maxresult,
// dbo.ms_labresult.remark,
// dbo.ms_labresult.date_result,
// dbo.ms_labresult.ref
// FROM
// dbo.ms_labresult
// Left Join ms_druglabtype ON ms_druglabtype.labname = dbo.ms_labresult.lab_name
// WHERE dbo.ms_labresult.hn = '" & hn & "' And dbo.ms_labresult.lab_name = 'Creatinine*'
// And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7
// And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result)
// FROM dbo.ms_labresult
// WHERE dbo.ms_labresult.hn= '" & hn & "' And dbo.ms_labresult.lab_name = 'Creatinine*'
// And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7)

// SELECT * FROM ms_patientlabresult
// WHERE an = '6727582'
