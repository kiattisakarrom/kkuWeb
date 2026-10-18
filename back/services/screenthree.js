// const sql = require('mssql');
// const dbConfig = require('../config/dbConfig'); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
// const moment = require('moment');

// // ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
// async function screenthree(req, res) {
//     const { orderitemcode,prescriptionno } = req.body; // รับค่า wardcode จาก request body

//     // Get current time
//     const now = moment();

//     // Define start and end dates
//     let startDate;
//     let endDate;

//     if (now.hour() > 8 || (now.hour() === 8 && now.minute() > 0)) {
//         // Current time is after 08:00:00
//         startDate = now.startOf('day').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
//         endDate = now.startOf('day').add(1, 'days').add(7, 'hours').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss');
//     } else {
//         // Current time is before or equal to 08:00:00
//         startDate = now.startOf('day').subtract(1, 'days').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
//         endDate = now.startOf('day').add(7, 'hours').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss');
//     }

//     try {
//         await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

//         let query = `
//             SELECT
//     dbo.prescription.prescriptionno,
//     dbo.prescription.seq,
//     dbo.prescription.seqmax,
//     dbo.prescription.orderitembarcode,
//     dbo.prescription.patientname,
//     dbo.prescription.sex,
//     CONVERT(VARCHAR(20), dbo.prescription.patientdob, 120) AS patientdob,
//     dbo.prescription.hn,
//     dbo.prescription.an,
//     dbo.prescription.wardcode,
//     dbo.prescription.wardname,
//     dbo.prescription.bedcode,
//     dbo.prescription.prioritycode,
//     dbo.prescription.prioritydesc,
//     CONVERT(VARCHAR(20), dbo.prescription.takedate, 120) AS takedate,
//     ISNULL(CONVERT(VARCHAR(20), dbo.prescription.enddate, 120), '') AS enddate,
//     CONVERT(VARCHAR(20), dbo.prescription.ordercreatedate, 120) AS ordercreatedate,
//     dbo.prescription.orderitemcode,
//     dbo.prescription.orderitemname,
//     CONVERT(FLOAT, dbo.prescription.orderqty) AS orderqty,
//     dbo.prescription.orderunitcode,
//     dbo.prescription.orderunitdesc,
//     dbo.prescription.instructioncode,
//     dbo.prescription.instructiondesc,
//     CONVERT(FLOAT, dbo.prescription.dosage) AS dosage,
//     dbo.prescription.dosageunitcode,
//     dbo.prescription.dosageunitdesc,
//     dbo.prescription.frequencycode,
//     dbo.prescription.frequencydesc,
//     dbo.prescription.timecode,
//     dbo.prescription.timedesc,
//     dbo.prescription.fromlocationname,
//     dbo.prescription.usercreatecode,
//     dbo.prescription.usercreatename,
//     dbo.prescription.orderacceptfromip,
//     dbo.prescription.computername,
//     dbo.prescription.itemlotcode,
//     dbo.prescription.itemlotexpire,
//     dbo.prescription.doctorcode,
//     dbo.prescription.doctorname,
//     dbo.prescription.pharmacyitemcode,
//     dbo.prescription.pharmacyitemdesc,
//     dbo.prescription.freetext1,
//     dbo.prescription.freetext2,
//     dbo.prescription.freetext3,
//     dbo.prescription.itemidentify,
//     dbo.prescription.lastmodified,
//     dbo.prescription.[language],
//     dbo.prescription.statuscode,
//     dbo.prescription.ordertype,
//     dbo.prescription.varymeal,
//     dbo.prescription.varymealtime,
//     dbo.prescription.voiddatetime,
//     dbo.prescription.genorderdatetime,
//     dbo.prescription.forcash,
//     '' AS timedetailcode,
//     '' AS timedetailTH,
//     '' AS timedetailEN,
//     dbo.prescription.timecount,
//     dbo.prescription.itemindex,
//     dbo.prescription.tmtcode,
//     dbo.prescription.sendmachine,
//     dbo.prescription.sendmix,
//     dbo.prescription.sendchemo,
//     dbo.prescription.printstatus,
//     dbo.prescription.rowpatient,
//     dbo.prescription.holddatetime,
//     dbo.prescription.startdate,
//     dbo.prescription.printauto,
//     dbo.prescription.statustimeend,
//     dbo.prescription.timestart,
//     dbo.prescription.timeend,
//     dbo.ms_drug.drugform,
//     dbo.ms_drug.orderitemENname,
//     dbo.ms_drug.sendmachine AS drug_sendmachine,
//     dbo.ms_drug.sendmix AS drug_sendmix,
//     dbo.ms_drug.dosegeform AS drug_dosageform,
//     dbo.ms_drug.unused AS drug_unused,
//     dbo.ms_drug.dosageunitcode AS drug_dosageunitcode,
//     dbo.ms_dosageunit.DispensedUnitTH AS drug_dispensedunitTH,
//     dbo.ms_drug.orderunitcode AS drug_orderunitcode,
//     dbo.ms_orderunit.DispensedTotalUnitTH AS drug_dispensedtotalunitTH,
//     dbo.ms_drug.displaycolour AS drug_displaycolour,
//     dbo.ms_drug.tmtcode AS drug_tmtcode,
//     dbo.ms_drug.DIDcode AS drug_DIDcode,
//     dbo.ms_drug.cost AS drug_cost,
//     dbo.ms_drug.IPDprice AS drug_IPDprice,
//     dbo.ms_drug.OPDprice AS drug_OPDprice
// FROM
//     dbo.prescription
// LEFT JOIN ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
// LEFT JOIN dbo.ms_dosageunit ON dbo.ms_drug.dosageunitcode = dbo.ms_dosageunit.DispensedUnitCd
// LEFT JOIN dbo.ms_orderunit ON dbo.ms_drug.orderunitcode = dbo.ms_orderunit.DispensedTotalUnitCd
// WHERE
//     dbo.prescription.genorderdatetime IS NULL
//     AND dbo.prescription.prescriptionno = @prescriptionno
//     AND ISNULL(dbo.prescription.frequencycode, '') NOT IN ('S', 'E', 'STAT');

//         `;

//         const request = new sql.Request();
//         request.input('startDate', sql.VarChar, startDate);
//         request.input('endDate', sql.VarChar, endDate);

//         if (orderitemcode) {
//             query += ' AND dbo.prescription.orderitemcode = @orderitemcode';
//             request.input('orderitemcode', sql.VarChar, orderitemcode); // เพิ่มค่า wardcode เข้าไปใน request
//         }
//         if (prescriptionno) {
//             query += ' AND dbo.prescription.prescriptionno = @prescriptionno';
//             request.input('prescriptionno', sql.VarChar, prescriptionno); // เพิ่มค่า wardcode เข้าไปใน request
//         }

//         const result = await request.query(query);

//         const finalResults = result.recordset.map(record => {

//             let responseObject = {
//                 takedate: record.takedate,
//                 ordertype: record.ordertype,
//                 prescriptionno: record.prescriptionno,
//                 // hn: record.hn,
//                 // an: record.an,
//                 patientname: record.patientname,
//                 wardcode: record.wardcode,
//                 wardname: record.wardname,
//                 orderitemname: record.orderitemname,
//                 bedcode: record.bedcode,
//                 prioritycode: record.prioritycode,
//                 genorderdatetime: record.genorderdatetime,
//                 fromlocationname: record.fromlocationname,
//             };

//             // Add optional fields if they exist
//             if (record.seq) responseObject.seq = record.seq;
//             if (record.timedetailcode) responseObject.timedetailcode = record.timedetailcode;
//             if (record.admindesc) responseObject.admindesc = record.admindesc;
//             if (record.orderitemcode) responseObject.orderitemcode = record.orderitemcode;
//             // if (record.orderitemname) responseObject.orderitemname = record.orderitemname;
//             if (record.dosage) responseObject.dosage = record.dosage;
//             if (record.orderqty) responseObject.orderqty = record.orderqty;
//             if (record.timecode) responseObject.timecode = record.timecode;
//             if (record.freetext2) responseObject.freetext2 = record.freetext2;
//             if (record.bedcode) responseObject.bedcode = record.bedcode;
//             if (record.locationname) responseObject.locationname = record.locationname;
//             if (record.printstatus) responseObject.printstatus = record.printstatus;
//             if (record.itemindex) responseObject.itemindex = record.itemindex;

//             // Check location
//             // if (record.location) {
//             //     responseObject.locationname = record.location;

//             //     if (record.locationcode === "1") {
//             //         responseObject.printstatus = false;
//             //     } else {
//             //         responseObject.printstatus = true;
//             //     }
//             // } else {
//             //     responseObject.printstatus = true;
//             //     responseObject.locationname = "จัดมือ";
//             // }

//             // Set sendmachine and sendmix
//             // responseObject.sendmachine = record.sendmachine === 'Y' ? true : false;
//             // responseObject.sendmix = record.sendmix === 'Y' ? true : false;

//             return responseObject;
//         });

//         res.status(200).json(finalResults);
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     } finally {
//         sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
//     }
// }

// module.exports = {
//     screenthree
// // };

// ///// ล่าสุดที่ทำงานยังไม่ได้
// const sql = require('mssql');
// const dbConfig = require('../config/dbConfig');
// const moment = require('moment');

// async function screenthree(req, res) {
//     const { orderitemcode, prescriptionno } = req.body;

//     const now = moment();

//     let startDate;
//     let endDate;

//     if (now.hour() > 8 || (now.hour() === 8 && now.minute() > 0)) {
//         startDate = now.startOf('day').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
//         endDate = now.startOf('day').add(1, 'days').add(7, 'hours').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss');
//     } else {
//         startDate = now.startOf('day').subtract(1, 'days').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
//         endDate = now.startOf('day').add(7, 'hours').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss');
//     }

//     try {
//         await sql.connect(dbConfig);

//         const query = `
//             SELECT
//                 dbo.prescription.prescriptionno,
//                 dbo.prescription.seq,
//                 dbo.prescription.seqmax,
//                 dbo.prescription.orderitembarcode,
//                 dbo.prescription.patientname,
//                 dbo.prescription.sex,
//                 convert(varchar(20), dbo.prescription.patientdob, 120) As patientdob,
//                 dbo.prescription.hn,
//                 dbo.prescription.an,
//                 dbo.prescription.wardcode,
//                 dbo.prescription.wardname,
//                 dbo.prescription.bedcode,
//                 dbo.prescription.prioritycode,
//                 dbo.prescription.prioritydesc,
//                 dbo.prescription.takedate,
//                 ISNULL(dbo.prescription.enddate, null) as enddate,
//                 dbo.prescription.ordercreatedate,
//                 dbo.prescription.orderitemcode,
//                 dbo.prescription.orderitemname,
//                 convert(float, dbo.prescription.orderqty) As orderqty,
//                 dbo.prescription.orderunitcode,
//                 dbo.prescription.orderunitdesc,
//                 dbo.prescription.instructioncode,
//                 dbo.prescription.instructiondesc,
//                 convert(float, dbo.prescription.dosage) As dosage,
//                 dbo.prescription.dosageunitcode,
//                 dbo.prescription.dosageunitdesc,
//                 dbo.prescription.frequencycode,
//                 dbo.prescription.frequencydesc,
//                 dbo.prescription.timecode,
//                 dbo.prescription.timedesc,
//                 dbo.prescription.fromlocationname,
//                 dbo.prescription.usercreatecode,
//                 dbo.prescription.usercreatename,
//                 dbo.prescription.orderacceptfromip,
//                 dbo.prescription.computername,
//                 dbo.prescription.itemlotcode,
//                 dbo.prescription.itemlotexpire,
//                 dbo.prescription.doctorcode,
//                 dbo.prescription.doctorname,
//                 dbo.prescription.pharmacyitemcode,
//                 dbo.prescription.pharmacyitemdesc,
//                 dbo.prescription.freetext1,
//                 dbo.prescription.freetext2,
//                 dbo.prescription.freetext3,
//                 dbo.prescription.itemidentify,
//                 dbo.prescription.lastmodified,
//                 dbo.prescription.[language],
//                 dbo.prescription.statuscode,
//                 dbo.prescription.ordertype,
//                 dbo.prescription.varymeal,
//                 dbo.prescription.varymealtime,
//                 dbo.prescription.voiddatetime,
//                 dbo.prescription.genorderdatetime,
//                 dbo.prescription.forcash,
//                 '' As timedetailcode,
//                 '' As timedetailTH,
//                 '' As timedetailEN,
//                 dbo.prescription.timecount,
//                 dbo.prescription.itemindex,
//                 dbo.prescription.tmtcode,
//                 dbo.prescription.sendmachine,
//                 dbo.prescription.sendmix,
//                 dbo.prescription.sendchemo,
//                 dbo.prescription.printstatus,
//                 dbo.prescription.rowpatient,
//                 dbo.prescription.holddatetime,
//                 dbo.prescription.startdate,
//                 dbo.prescription.printauto,
//                 dbo.prescription.statustimeend,
//                 dbo.prescription.timestart,
//                 dbo.prescription.timeend,
//                 dbo.ms_drug.drugform
//             FROM
//                 dbo.prescription
//                 LEFT JOIN ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
//             WHERE dbo.prescription.prescriptionno = @prescriptionno
//                 AND dbo.prescription.ordercreatedate BETWEEN @startDate AND @endDate
//             ORDER BY dbo.prescription.printstatus DESC, dbo.ms_drug.sendmachine
//         `;

//         const request = new sql.Request();
//         request.input('startDate', sql.VarChar, startDate);
//         request.input('endDate', sql.VarChar, endDate);

//         if (orderitemcode) {
//             request.input('orderitemcode', sql.VarChar, orderitemcode);
//         }
//         if (prescriptionno) {
//             request.input('prescriptionno', sql.VarChar, prescriptionno);
//         }

//         const result = await request.query(query);

//         if (result.recordset.length > 0) {
//             const finalResults = result.recordset.map(record => {
//                 let timecount = record.timecount ? record.timecount : 0;
//                 let dose = record.dosage ? record.dosage : 0;
//                 let dosecal = 0;
//                 let qty = record.orderqty ? record.orderqty : 0;
//                 let admindesc = record.timedetailcode === ""
//                     ? record.freetext1
//                     : `[${record.timedetailcode.slice(0, 2)}:${record.timedetailcode.slice(2, 4)}] ${record.timedetailTH}`;

//                 return {
//                     takedate: record.takedate,
//                     ordertype: record.ordertype,
//                     prescriptionno: record.prescriptionno,
//                     patientname: record.patientname,
//                     wardcode: record.wardcode,
//                     wardname: record.wardname,
//                     orderitemname: record.orderitemname,
//                     bedcode: record.bedcode,
//                     prioritycode: record.prioritycode,
//                     genorderdatetime: record.genorderdatetime,
//                     fromlocationname: record.fromlocationname,
//                     timecount,
//                     dose,
//                     dosecal,
//                     qty,
//                     admindesc,
//                     sendmachine: record.sendmachine === 'Y',
//                     sendmix: record.sendmix === 'Y'
//                 };
//             });

//             res.status(200).json(finalResults);
//         } else {
//             res.status(200).json([]);
//         }
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     } finally {
//         sql.close();
//     }
// }

// module.exports = {
//     screenthree
// };

//โคดนี้ใช้ orderitemcode prescriptionno ในการหา
// const sql = require('mssql');
// const dbConfig = require('../config/dbConfig'); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
// const moment = require('moment');

// // ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
// async function screenthree(req, res) {
//     const { orderitemcode, prescriptionno } = req.body; // รับค่า orderitemcode และ prescriptionno จาก request body

//     // Get current time
//     const now = moment();

//     // Define start and end dates
//     let startDate;
//     let endDate;

//     if (now.hour() > 8 || (now.hour() === 8 && now.minute() > 0)) {
//         // Current time is after 08:00:00
//         startDate = now.startOf('day').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
//         endDate = now.startOf('day').add(1, 'days').add(7, 'hours').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss');
//     } else {
//         // Current time is before or equal to 08:00:00
//         startDate = now.startOf('day').subtract(1, 'days').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
//         endDate = now.startOf('day').add(7, 'hours').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss');
//     }

//     try {
//         await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

//         let query = `
//             SELECT
//                 dbo.prescription.prescriptionno,
//                 dbo.prescription.seq,
//                 dbo.prescription.seqmax,
//                 dbo.prescription.orderitembarcode,
//                 dbo.prescription.patientname,
//                 dbo.prescription.sex,
//                 convert(varchar(20), dbo.prescription.patientdob, 120) As patientdob,
//                 dbo.prescription.hn,
//                 dbo.prescription.an,
//                 dbo.prescription.wardcode,
//                 dbo.prescription.wardname,
//                 dbo.prescription.bedcode,
//                 dbo.prescription.prioritycode,
//                 dbo.prescription.prioritydesc,
//                 dbo.prescription.takedate,
//                 ISNULL(dbo.prescription.enddate, null) as enddate,
//                 dbo.prescription.ordercreatedate,
//                 dbo.prescription.orderitemcode,
//                 dbo.prescription.orderitemname,
//                 convert(float, dbo.prescription.orderqty) As orderqty,
//                 dbo.prescription.orderunitcode,
//                 dbo.prescription.orderunitdesc,
//                 dbo.prescription.instructioncode,
//                 dbo.prescription.instructiondesc,
//                 convert(float, dbo.prescription.dosage) As dosage,
//                 dbo.prescription.dosageunitcode,
//                 dbo.prescription.dosageunitdesc,
//                 dbo.prescription.frequencycode,
//                 dbo.prescription.frequencydesc,
//                 dbo.prescription.timecode,
//                 dbo.prescription.timedesc,
//                 dbo.prescription.fromlocationname,
//                 dbo.prescription.usercreatecode,
//                 dbo.prescription.usercreatename,
//                 dbo.prescription.orderacceptfromip,
//                 dbo.prescription.computername,
//                 dbo.prescription.itemlotcode,
//                 dbo.prescription.itemlotexpire,
//                 dbo.prescription.doctorcode,
//                 dbo.prescription.doctorname,
//                 dbo.prescription.pharmacyitemcode,
//                 dbo.prescription.pharmacyitemdesc,
//                 dbo.prescription.freetext2,
//                 dbo.prescription.freetext3,
//                 dbo.prescription.itemidentify,
//                 dbo.prescription.lastmodified,
//                 dbo.prescription.[language],
//                 dbo.prescription.statuscode,
//                 dbo.prescription.ordertype,
//                 dbo.prescription.varymeal,
//                 dbo.prescription.varymealtime,
//                 dbo.prescription.voiddatetime,
//                 dbo.prescription.genorderdatetime,
//                 dbo.prescription.forcash,
//                 '' As timedetailcode,
//                 '' As timedetailTH,
//                 '' As timedetailEN,
//                 dbo.prescription.timecount,
//                 dbo.prescription.itemindex,
//                 dbo.prescription.tmtcode,
//                 dbo.prescription.sendmachine,
//                 dbo.prescription.sendmix,
//                 dbo.prescription.sendchemo,
//                 dbo.prescription.printstatus,
//                 dbo.prescription.rowpatient,
//                 dbo.prescription.holddatetime,
//                 dbo.prescription.startdate,
//                 dbo.prescription.printauto,
//                 dbo.prescription.statustimeend,
//                 dbo.prescription.timestart,
//                 dbo.prescription.timeend,
//                 dbo.ms_drug.drugform
//             FROM
//                 dbo.prescription
//                 LEFT JOIN ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
//             WHERE dbo.prescription.prescriptionno = @prescriptionno
//                 AND dbo.prescription.ordercreatedate BETWEEN @startDate AND @endDate
//                                 ORDER BY  dbo.prescription.printstatus DESC,dbo.ms_drug.sendmachine

//         `;

//         const request = new sql.Request();
//         request.input('startDate', sql.VarChar, startDate);
//         request.input('endDate', sql.VarChar, endDate);

//         if (orderitemcode) {
//             request.input('orderitemcode', sql.VarChar, orderitemcode);
//         }
//         if (prescriptionno) {
//             request.input('prescriptionno', sql.VarChar, prescriptionno);
//         }

//         const result = await request.query(query);

//         let timecount = result.recordset.length > 0 ? result.recordset[0].timecount : 0;
//         let dose = result.recordset.length > 0 ? result.recordset[0].dosage : 0;
//         let dosecal = 0;
//         let qty = result.recordset.length > 0 ? result.recordset[0].orderqty : 0;
//         let admindesc = result.recordset.length > 0 && result.recordset[0].timedetailcode === "" ? result.recordset[0].freetext1 : "";

//         const finalResults = result.recordset.map(record => {

//             let responseObject = {
//                 takedate: record.takedate,
//                 ordertype: record.ordertype,
//                 prescriptionno: record.prescriptionno,
//                 patientname: record.patientname,
//                 wardcode: record.wardcode,
//                 wardname: record.wardname,
//                 orderitemname: record.orderitemname,
//                 bedcode: record.bedcode,
//                 prioritycode: record.prioritycode,
//                 genorderdatetime: record.genorderdatetime,
//                 fromlocationname: record.fromlocationname,
//             };

//             // Add optional fields if they exist
//             if (record.seq) responseObject.seq = record.seq;
//             if (record.timedetailcode) responseObject.timedetailcode = record.timedetailcode;
//             if (admindesc) responseObject.admindesc = admindesc;
//             if (record.orderitemcode) responseObject.orderitemcode = record.orderitemcode;
//             if (dose) responseObject.dosage = dose;
//             if (qty) responseObject.orderqty = qty;
//             if (record.timecode) responseObject.timecode = record.timecode;
//             if (record.freetext2) responseObject.freetext2 = record.freetext2;
//             if (record.bedcode) responseObject.bedcode = record.bedcode;
//             if (record.locationname) responseObject.locationname = record.locationname;
//             if (record.printstatus) responseObject.printstatus = record.printstatus;
//             if (record.itemindex) responseObject.itemindex = record.itemindex;

//             // Check location
//             if (record.locationname) {
//                 responseObject.locationname = record.locationname;

//                 if (record.locationcode === "1") {
//                     responseObject.printstatus = false;
//                 } else {
//                     responseObject.printstatus = true;
//                 }
//             } else {
//                 responseObject.printstatus = true;
//                 responseObject.locationname = "จัดมือ";
//             }

//             // Set sendmachine and sendmix
//             responseObject.sendmachine = record.sendmachine === 'Y';
//             responseObject.sendmix = record.sendmix === 'Y';

//             return responseObject;
//         });

//         res.status(200).json(finalResults);
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Internal Server Error');
//     } finally {
//         sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
//     }
// }

// module.exports = {
//     screenthree
// };

const sql = require("mssql");
const dbConfig = require("../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function screenthree(req, res) {
  const { orderitemcode, prescriptionno } = req.body; // รับค่า orderitemcode และ prescriptionno จาก request body

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
                dbo.prescription.prescriptionno,
                dbo.prescription.seq,
                dbo.prescription.seqmax,
                dbo.prescription.orderitembarcode,
                dbo.prescription.patientname,
                dbo.prescription.sex,
                convert(varchar(20), dbo.prescription.patientdob, 120) As patientdob,
                dbo.prescription.hn,
                dbo.prescription.an,
                dbo.prescription.wardcode,
                dbo.prescription.wardname,
                dbo.prescription.bedcode,
                dbo.prescription.prioritycode,
                dbo.prescription.prioritydesc,
                dbo.prescription.takedate,
                ISNULL(dbo.prescription.enddate, null) as enddate,
                dbo.prescription.ordercreatedate,
                dbo.prescription.orderitemcode,
                dbo.prescription.orderitemname,
                convert(float, dbo.prescription.orderqty) As orderqty,
                dbo.prescription.orderunitcode,
                dbo.prescription.orderunitdesc,
                dbo.prescription.instructioncode,
                dbo.prescription.instructiondesc,
                convert(float, dbo.prescription.dosage) As dosage,
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
                LEFT JOIN ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
            
                WHERE dbo.prescription.prescriptionno = @prescriptionno 
                AND dbo.prescription.ordercreatedate BETWEEN @startDate AND @endDate
            
                ORDER BY  dbo.prescription.printstatus DESC,dbo.ms_drug.sendmachine

        `;

    const request = new sql.Request();
    request.input("startDate", sql.VarChar, startDate);
    request.input("endDate", sql.VarChar, endDate);

    if (orderitemcode) {
      request.input("orderitemcode", sql.VarChar, orderitemcode);
    }
    if (prescriptionno) {
      request.input("prescriptionno", sql.VarChar, prescriptionno);
    }

    const result = await request.query(query);

    let timecount =
      result.recordset.length > 0 ? result.recordset[0].timecount : 0;
    let dose = result.recordset.length > 0 ? result.recordset[0].dosage : 0;
    let dosecal = 0;
    let qty = result.recordset.length > 0 ? result.recordset[0].orderqty : 0;
    let admindesc =
      result.recordset.length > 0 && result.recordset[0].timedetailcode === ""
        ? result.recordset[0].freetext1
        : "";

    const finalResults = result.recordset.map((record) => {
      let responseObject = {
        takedate: record.takedate,
        ordertype: record.ordertype,
        prescriptionno: record.prescriptionno,
        patientname: record.patientname,
        wardcode: record.wardcode,
        wardname: record.wardname,
        orderitemname: record.orderitemname,
        bedcode: record.bedcode,
        prioritycode: record.prioritycode,
        genorderdatetime: record.genorderdatetime,
        fromlocationname: record.fromlocationname,
      };

      // Add optional fields if they exist
      if (record.seq) responseObject.seq = record.seq;
      if (record.timedetailcode)
        responseObject.timedetailcode = record.timedetailcode;
      if (admindesc) responseObject.admindesc = admindesc;
      if (record.orderitemcode)
        responseObject.orderitemcode = record.orderitemcode;
      if (dose) responseObject.dosage = dose;
      if (qty) responseObject.orderqty = qty;
      if (record.timecode) responseObject.timecode = record.timecode;
      if (record.freetext2) responseObject.freetext2 = record.freetext2;
      if (record.bedcode) responseObject.bedcode = record.bedcode;
      if (record.locationname)
        responseObject.locationname = record.locationname;
      if (record.printstatus) responseObject.printstatus = record.printstatus;
      if (record.itemindex) responseObject.itemindex = record.itemindex;

      // Check location
      if (record.locationname) {
        responseObject.locationname = record.locationname;

        if (record.locationcode === "1") {
          responseObject.printstatus = false;
        } else {
          responseObject.printstatus = true;
        }
      } else {
        responseObject.printstatus = true;
        responseObject.locationname = "จัดมือ";
      }

      // Set sendmachine and sendmix
      responseObject.sendmachine = record.sendmachine === "Y";
      responseObject.sendmix = record.sendmix === "Y";

      return responseObject;
    });

    res.status(200).json(finalResults);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Internal Server Error");
  } finally {
    sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
  }
}

module.exports = {
  screenthree,
};
