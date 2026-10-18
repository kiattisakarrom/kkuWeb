// const sql = require('mssql');
// const { pool, poolConnect } = require('../models/db');

// async function compare(req, res) {
//     const { wardcode } = req.body; // รับค่า wardcode จากผู้ใช้หรือส่วนต่อประกอบที่จะต้องใช้ในคำสั่ง SQL ในการค้นหา

//     try {
//         await poolConnect; // รอการเชื่อมต่อกับฐานข้อมูล

//         // คำสั่ง SQL สำหรับดึงข้อมูลที่ต้องการจากตาราง
//         const query = `
//             SELECT
//                 w.warddesc AS ตึก,
//                 p.patientnameTH AS ชื่อ,
//                 an.an AS an
//             FROM
//                 ms_ward w
//                 JOIN ms_bedmove an ON w.wardcode = an.fromwardcode
//                 JOIN ms_patientadmit pa ON an.an = pa.an
//                 JOIN ms_patient p ON pa.hn = p.hn
//             WHERE
//                 w.wardcode = @wardcode`;

//         // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
//         const result = await pool.request()
//             .input('wardcode', sql.NVarChar, wardcode)
//             .query(query);

//         res.status(200).json(result.recordset); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     }
// // }



// const sql = require('mssql');
// const { pool, poolConnect } = require('../models/db');

// async function compare(req, res) {
//     const { wardcode } = req.body; // รับค่า wardcode จากผู้ใช้หรือส่วนต่อประกอบที่จะต้องใช้ในคำสั่ง SQL ในการค้นหา
//     const search = req.body.search || ''; // รับค่า search จากผู้ใช้หรือส่วนต่อประกอบที่จะต้องใช้ในคำสั่ง SQL ในการค้นหา
//     const ptstatus = req.body.ptstatus || ''; // รับค่า ptstatus จากผู้ใช้หรือส่วนต่อประกอบที่จะต้องใช้ในคำสั่ง SQL ในการค้นหา

//     try {
//         await poolConnect; // รอการเชื่อมต่อกับฐานข้อมูล

//         // คำสั่ง SQL สำหรับดึงข้อมูลที่ต้องการจากตาราง
//         let query = `
//             SELECT
//                 dbo.ms_ward.wardcode,
//                 ('[' + dbo.ms_ward.wardcode + '] ' + dbo.ms_ward.warddesc) AS warddesc,
//                 COUNT(DISTINCT dbo.ms_patientadmit.an) AS countadmit
//             FROM
//                 dbo.ms_patient
//                 LEFT JOIN dbo.ms_patientadmit ON dbo.ms_patient.hn = dbo.ms_patientadmit.hn
//                 LEFT JOIN dbo.ms_bedmove ON dbo.ms_patientadmit.an = dbo.ms_bedmove.an
//                 LEFT JOIN dbo.ms_ward ON dbo.ms_bedmove.towardcode = dbo.ms_ward.wardcode
//                 LEFT JOIN dbo.ms_patientDischarge ON dbo.ms_patientadmit.an = dbo.ms_patientDischarge.an 
//                     AND dbo.ms_patientadmit.hn = dbo.ms_patientDischarge.hn
//             WHERE
//                 dbo.ms_bedmove.status = 0
//                 AND dbo.ms_ward.wardcode NOT IN ('1420')
//                 ${ptstatus}
//         `;

//         if (search !== '') {
//             query += ` AND dbo.ms_patientadmit.an = '${search}' `;
//         }

//         query += `
//             GROUP BY
//                 dbo.ms_ward.wardcode,
//                 ('[' + dbo.ms_ward.wardcode + '] ' + dbo.ms_ward.warddesc)
//             ORDER BY
//                 CONVERT(INT, dbo.ms_ward.wardcode) ASC
//         `;

//         // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
//         const result = await pool.request()
//             .input('wardcode', sql.NVarChar, wardcode)
//             .query(query);

//         // เตรียมข้อมูลในรูปแบบที่ต้องการ
//         const finalResults = result.recordset.map(record => ({
//             wardcode: record.wardcode,
//             warddesc: record.warddesc,
//             countadmit: record.countadmit
//         }));

//         res.status(200).json(finalResults); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     }
// }

// module.exports = {
//     compare
// };



// // services/compare.js
// const sql = require('mssql');
// const { pool, poolConnect } = require('../models/db');

// async function compare(req, res) {
//     const { wardcode } = req.body; // รับค่า wardcode จากผู้ใช้หรือส่วนต่อประกอบที่จะต้องใช้ในคำสั่ง SQL ในการค้นหา

//     try {
//         await poolConnect; // รอการเชื่อมต่อกับฐานข้อมูล

//         // คำสั่ง SQL สำหรับดึงข้อมูลที่ต้องการจากตาราง
//         const query = `
//             SELECT
//                 w.warddesc AS warddesc,
//                 p.patientnameTH AS patientnameTH,
//                 pa.an AS an,
//                 pa.admitteddate AS admitteddate,
//                 pa.hn AS hn
//             FROM
//                 ms_ward w
//                 JOIN ms_bedmove bm ON w.wardcode = bm.fromwardcode
//                 JOIN ms_patientadmit pa ON bm.an = pa.an
//                 JOIN ms_patient p ON pa.hn = p.hn
//                 JOIN ms_patientDischarge pd ON pa.hn = pd.hn
//             WHERE
//                 w.wardcode = @wardcode`;

//         // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
//         const result = await pool.request()
//             .input('wardcode', sql.NVarChar, wardcode)
//             .query(query);

//         // เตรียมข้อมูลในรูปแบบที่ต้องการ
//         const finalResults = result.recordset.map(record => ({
//             "Admitdate Date": record.admitteddate ? new Date(record.admitteddate).toLocaleDateString('th-TH', {
//                 year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
//             }) : null,
//             hn: record.hn,
//             an: record.an,
//             patientnameTH: record.patientnameTH,
//             warddesc: record.warddesc
//         }));

//         res.status(200).json(finalResults); // ส่งผลลัพธ์กลับไปยังผู้เรียกใช้
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     }
// }

module.exports = {
    compare
}