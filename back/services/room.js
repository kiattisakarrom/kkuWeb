// const sql = require("mssql");
// const dbConfig = require("../config/dbConfig");
// const express = require("express"); // เพิ่มการนำเข้า express
// const app = express();
// app.use(express.json());

// async function room(req, res) {
//   try {
//     await sql.connect(dbConfig);
//     const result = await sql.query(`
//         SELECT roomcode, roomname
//         FROM dbo.ms_room
//       `);
//     res.json(result.recordset);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("เกิดข้อผิดพลาดในเซิร์ฟเวอร์");
//   } finally {
//     await sql.close(); // ปิดการเชื่อมต่อ
//   }
// }

// module.exports = {
//   room,
// };

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
// WHERE dbo.ms_labresult.hn = '67024810'
// And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7
// Order by dbo.ms_labresult.date_result DESC

// SELECT
//         dd.DRPItemNo,
//         dd.Ordercreatedate,
//         dd.[Time],
//         dd.ProcessCd,
//         dd.[No],
//         dd.DRP_ProblemCd,
//         dd.OrderItemCaseCode,
//         dd.OrderItemDispenCode,
//         dd.ProblemOccurCd,
//         dd.Severity,
//         dd.Preventable,
//         dd.CauseOfDRPCd,
//         dd.InterventionCd,
//         dd.InterAcceptCd,
//         dd.StatusOfproblemCd,
//         dd.ReporterCd,
//         dd.UserCreateCode,
//         dd.PharmacistNote,
//         dd.PlanNote
//         FROM ms_drpdetail dd
//         WHERE dd.Hn =  '67024810'
//         ORDER BY dd.Ordercreatedate DESC, dd.[No] ASC

//         SELECT
//         null as dispensstatus,
//         med.meditemindex,
//         med.seq,
//         med.seqmax,
//         med.hn,
//         med.an,
//         med.prioritycode,
//         pr.prioritydesc,
//         med.takedate,
//         med.ordercreatedate,
//         med.orderitemcode,
//         med.orderitemname,
//         dg.orderitemENname,
//         dg.displaycolour,
//         convert(float, ISNULL(med.orderqty, 0)) As orderqty,
//         med.orderunitcode,
//         dou.DispensedTotalUnitTH,
//         med.instructioncode,
//         Ins.InstructionNameTH,
//         convert(float,ISNULL(med.dosage,0)) As dosage,
//         med.dosageunitcode,
//         dos.DispensedUnitTH,
//         med.frequencycode,
//         fc.frequency_nameTH,
//         ISNULL(fc.qty_per_day,0) As qty_per_day,
//         fc.frequency_onlydays,
//         fc.oddday,
//         med.timecode,
//         ft.timeTH,
//         med.timecount,
//         ISNULL(med.durationcode,'0') As durationcode,
//         med.usercreatecode,
//         us.fullname,
//         med.orderacceptfromip,
//         med.computername,
//         med.departmentcode,
//         med.itemlotcode,
//         med.itemlotexpire,
//         med.doctorcode,
//         med.doctorname,
//         med.freetext1,
//         med.freetext2,
//         med.lastmodified,
//         med.[language],
//         med.ordertype,
//         med.highalert,
//         med.shelfzone,
//         med.shelfname,
//         med.varymeal,
//         med.varymealtime,
//         med.voiddatetime,
//         convert(float,ISNULL(med.price,0)) As price,
//         convert(float,ISNULL(med.totalprice,0)) As totalprice,
//         med.sendmachine,
//         med.sendmix,
//         ISNULL(med.sendchemo,'N') As sendchemo,
//         ISNULL(med.sendtpn,'N') As sendtpn,
//         med.drugusagecode,
//         med.tmtcode,
//         med.startdate,
//         med.enddate,
//         med.offstatus,
//         med.groupdrug,
//         med.sendmixcode,
//         med.sendmixname,
//         convert(float,med.vol) as vol,
//         med.dosageunitforVol,
//         med.pricetype,
//         med.printstatus,
//         med.itemidentify,
//         med.printdrp,
//         convert(float,ISNULL(med.firstdose,0)) As firstdose,
//         med.diluentadd,
//         med.orderfrom,
//         med.holddatetime,
//         ISNULL(med.varymealstatus,'N') As varymealstatus,
//         med.freetext3,
//         med.odddatetime,
//         med.oddday as odd,
//         med.paytype,
//         ISNULL(med.firstdosestatus,'0') As firstdosestatus,
//         ISNULL(med.firsttimecount,1) As firsttimecount,
//         med.DIDcode,
//         ISNULL(med.continuestatus,'N') as continuestatus,
//         mer.meditemindex,
//         Case WHEN mer.meditemindex Is Not NULL THEN
//         'MRC'
//         Else '' END as MRC,
//         ISNULL(med.statustimeend,'N') As statustimeend,
//         med.timestart,
//         med.timeend,
//         med.odddatetime,
//         isnull(med.dosecal,0) as dosecal,
//         med.statuscal,
//         isnull(med.dayend,0) As dayend,
//         med.protocolcode

//         From
//         dbo.ms_medicationprofile med
//         Left Join dbo.ms_medicationrecconcile mer On mer.meditemindex = med.meditemindex
//         Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd
//         Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd
//         Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code
//         Left Join dbo.ms_time ft On med.timecode = ft.timecode
//         Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd
//         Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode
//         Left Join dbo.ms_users us On us.userID = med.usercreatecode
//         Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode
//         WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '2567-10-17 08:00:00' AND '2567-10-18 07:59:00')
//         And (format(med.enddate,'yyyy-MM-dd') = '2567-10-16' and med.enddate IS NOT NULL and med.voiddatetime IS NULL)  And (med.ordercreatedate between '2567-10-17 08:00:00' AND '2567-10-18 07:59:00' OR med.prioritycode ='C' OR med.prioritycode ='CS')
//         And med.an ='6766196'
//         ORDER BY med.voiddatetime ASC,
//         med.ordercreatedate ASC,
//         med.groupdrug Asc,
//         med.seq ASC

//         SELECT
//         dbo.ms_adrhistory.adrhiscode,
//         dbo.ms_adrhistory.adrhisdatetime,
//         dbo.ms_adrhistory.orderitemcode,
//         dbo.ms_adrhistory.orderitemname,
//         dbo.ms_adrhistory.doctorCd,
//         dbo.ms_adrhistory.doctorname,
//         dbo.ms_adrhistory.userID,
//         dbo.ms_adrhistory.fullname,
//         dbo.ms_adrhistory.hn,
//         dbo.ms_adrhistory.an,
//         dbo.ms_adrhistory.adrnotecode,
//         dbo.ms_adrhistory.adrnotedetail,
//         dbo.ms_adrhistory.adrremark,
//         dbo.ms_adrhistory.meditemindex,
//         dbo.ms_adrhistory.level
//         FROM dbo.ms_adrhistory
//         WHERE an = '6766196'

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
//         dbo.ms_adr.hn = '67032519'
//         ORDER BY
//         dbo.ms_adr.AllergyGroupCd

//         WHERE dbo.ms_labresult.hn = '67032519' And dbo.ms_labresult.lab_name = 'Creatinine*'
//         And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7
//         And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result)
//         FROM dbo.ms_labresult
//         WHERE dbo.ms_labresult.hn= '67032519' And dbo.ms_labresult.lab_name = 'Creatinine*'
//         And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7)
//         WHERE dbo.ms_labresult.hn = '67032519' And dbo.ms_labresult.lab_name = 'Creatinine*' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7

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
//         WHERE dbo.ms_labresult.hn = '67032519' And dbo.ms_labresult.lab_name = 'Creatinine*' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result) FROM dbo.ms_labresult WHERE dbo.ms_labresult.hn= '67032519' And dbo.ms_labresult.lab_name = 'Creatinine*' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7

//         Public Function get_ms_labresult(ByVal condition As String) As DataTable
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
//         WHERE dbo.ms_labresult.hn = '67032519' And dbo.ms_labresult.lab_name = 'WBC' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 and dbo.ms_labresult.result not like '%-%' And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result) FROM dbo.ms_labresult WHERE dbo.ms_labresult.hn= '67032519' And dbo.ms_labresult.lab_name = 'WBC' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 and dbo.ms_labresult.result not like '%-%')

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
//         WHERE dbo.ms_labresult.hn = '67032519' And dbo.ms_labresult.lab_name = 'Neutrophil %' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result) FROM dbo.ms_labresult WHERE dbo.ms_labresult.hn= '67032519' And dbo.ms_labresult.lab_name = 'Neutrophil %' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7

//         Public Function get_ms_doctor(ByVal condition As String) As DataTable
//         Select
//         ROW_NUMBER() OVER(ORDER BY ms_doctor.DoctorCd ASC) As Row# ,
//         ms_doctor.DoctorCd,
//         ms_doctor.DoctorTH,
//         ms_doctor.DoctorEN,
//         ms_doctor.Status
//         FROM
//         ms_doctor
//         Where (ms_doctor.DoctorCd LIKE 'เกวลี ศรีคราม%' OR ms_doctor.DoctorTH LIKE '%เกวลี ศรีคราม%') And ms_doctor.Status = 'Y'

//         Public Function Getms_patientlabresult(ByVal condition As String) As DataTable
//         Select
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
//         where dbo.ms_patientlabresult.an ='6762377'

//         pub get_viewDRP
//         SELECT
//         dd.DRPItemNo,
//         dd.Ordercreatedate,
//         dd.[Time],
//         dd.ProcessCd,
//         dd.[No],
//         dd.DRP_ProblemCd,
//         dd.OrderItemCaseCode,
//         dd.OrderItemDispenCode,
//         dd.ProblemOccurCd,
//         dd.Severity,
//         dd.Preventable,
//         dd.CauseOfDRPCd,
//         dd.InterventionCd,
//         dd.InterAcceptCd,
//         dd.StatusOfproblemCd,
//         dd.ReporterCd,
//         dd.UserCreateCode,
//         dd.PharmacistNote,
//         dd.PlanNote
//         FROM ms_drpdetail dd
//         WHERE dd.Hn =  '67032519'
//         ORDER BY dd.Ordercreatedate DESC, dd.[No] ASC

//         Public Function GetData_note(ByVal condition As String) As DataTable
//         SELECT id,Problem,note,ms_users.fullname,format(Lastupdatedatetime,'dd-MM-yyyy') as lastupdate
//         from ms_note
//         LEFT JOIN ms_users on ms_users.userID = ms_note.usercreateID
//         WHERE hn = '67032519'
//         Order by Lastupdatedatetime DESC

//         Public Function get_msdetailIPD(ByVal condition As String) As DataTable
//         SELECT
//         null as dispensstatus,
//         med.meditemindex,
//         med.seq,
//         med.seqmax,
//         med.hn,
//         med.an,
//         med.prioritycode,
//         pr.prioritydesc,
//         med.takedate,
//         med.ordercreatedate,
//         med.orderitemcode,
//         med.orderitemname,
//         dg.orderitemENname,
//         dg.displaycolour,
//         convert(float, ISNULL(med.orderqty, 0)) As orderqty,
//         med.orderunitcode,
//         dou.DispensedTotalUnitTH,
//         med.instructioncode,
//         Ins.InstructionNameTH,
//         convert(float,ISNULL(med.dosage,0)) As dosage,
//         med.dosageunitcode,
//         dos.DispensedUnitTH,
//         med.frequencycode,
//         fc.frequency_nameTH,
//         ISNULL(fc.qty_per_day,0) As qty_per_day,
//         fc.frequency_onlydays,
//         fc.oddday,
//         med.timecode,
//         ft.timeTH,
//         med.timecount,
//         ISNULL(med.durationcode,'0') As durationcode,
//         med.usercreatecode,
//         us.fullname,
//         med.orderacceptfromip,
//         med.computername,
//         med.departmentcode,
//         med.itemlotcode,
//         med.itemlotexpire,
//         med.doctorcode,
//         med.doctorname,
//         med.freetext1,
//         med.freetext2,
//         med.lastmodified,
//         med.[language],
//         med.ordertype,
//         med.highalert,
//         med.shelfzone,
//         med.shelfname,
//         med.varymeal,
//         med.varymealtime,
//         med.voiddatetime,
//         convert(float,ISNULL(med.price,0)) As price,
//         convert(float,ISNULL(med.totalprice,0)) As totalprice,
//         med.sendmachine,
//         med.sendmix,
//         ISNULL(med.sendchemo,'N') As sendchemo,
//         ISNULL(med.sendtpn,'N') As sendtpn,
//         med.drugusagecode,
//         med.tmtcode,
//         med.startdate,
//         med.enddate,
//         med.offstatus,
//         med.groupdrug,
//         med.sendmixcode,
//         med.sendmixname,
//         convert(float,med.vol) as vol,
//         med.dosageunitforVol,
//         med.pricetype,
//         med.printstatus,
//         med.itemidentify,
//         med.printdrp,
//         convert(float,ISNULL(med.firstdose,0)) As firstdose,
//         med.diluentadd,
//         med.orderfrom,
//         med.holddatetime,
//         ISNULL(med.varymealstatus,'N') As varymealstatus,
//         med.freetext3,
//         med.odddatetime,
//         med.oddday as odd,
//         med.paytype,
//         ISNULL(med.firstdosestatus,'0') As firstdosestatus,
//         ISNULL(med.firsttimecount,1) As firsttimecount,
//         med.DIDcode,
//         ISNULL(med.continuestatus,'N') as continuestatus,
//         mer.meditemindex,
//         Case WHEN mer.meditemindex Is Not NULL THEN
//         'MRC'
//         Else '' END as MRC,
//         ISNULL(med.statustimeend,'N') As statustimeend,
//         med.timestart,
//         med.timeend,
//         med.odddatetime,
//         isnull(med.dosecal,0) as dosecal,
//         med.statuscal,
//         isnull(med.dayend,0) As dayend,
//         med.protocolcode
//         From
//         dbo.ms_medicationprofile med
//         Left Join dbo.ms_medicationrecconcile mer On mer.meditemindex = med.meditemindex
//         Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd
//         Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd
//         Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code
//         Left Join dbo.ms_time ft On med.timecode = ft.timecode
//         Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd
//         Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode
//         Left Join dbo.ms_users us On us.userID = med.usercreatecode
//         Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode
//         WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '2567-10-21 08:00:00' AND '2567-10-22 07:59:00')
//         And (format(med.enddate,'yyyy-MM-dd') = '2567-10-20' and med.enddate IS NOT NULL and med.voiddatetime IS NULL)  And (med.ordercreatedate between '2567-10-21 08:00:00' AND '2567-10-22 07:59:00' OR med.prioritycode ='C' OR med.prioritycode ='CS')   And med.an ='6762377'

//         ORDER BY med.voiddatetime ASC,
//         med.prioritycode ASC,
//         med.ordercreatedate ASC,
//         med.groupdrug Asc,
//         med.seq ASC

//         Public Function Showms_adrhistory(ByVal condition As String) As DataTable
//         SELECT
//         dbo.ms_adrhistory.adrhiscode,
//         dbo.ms_adrhistory.adrhisdatetime,
//         dbo.ms_adrhistory.orderitemcode,
//         dbo.ms_adrhistory.orderitemname,
//         dbo.ms_adrhistory.doctorCd,
//         dbo.ms_adrhistory.doctorname,
//         dbo.ms_adrhistory.userID,
//         dbo.ms_adrhistory.fullname,
//         dbo.ms_adrhistory.hn,
//         dbo.ms_adrhistory.an,
//         dbo.ms_adrhistory.adrnotecode,
//         dbo.ms_adrhistory.adrnotedetail,
//         dbo.ms_adrhistory.adrremark,
//         dbo.ms_adrhistory.meditemindex,
//         dbo.ms_adrhistory.level
//         FROM dbo.ms_adrhistory
//         WHERE an = '6739326'

//         Public Function ShowAllow(ByVal condition As String) As DataTabl
//         SELECT
//         AL.AllowCd,
//         AL.AllowStatus,
//         AL.StartDate,
//         AL.EndDate,
//         AL.Reason,
//         AL.userID,
//         us.firstname + ' ' + us.lastname as fullname,
//         AL.meditemindex
//         FROM ms_Allow AL
//         LEFT JOIN ms_users us ON AL.userID = us.userID
//          Where meditemindex = '20240619305611'

//          SELECT
//          dbo.ms_adrhistory.adrhiscode,
//          dbo.ms_adrhistory.adrhisdatetime,
//          dbo.ms_adrhistory.orderitemcode,
//          dbo.ms_adrhistory.orderitemname,
//          dbo.ms_adrhistory.doctorCd,
//          dbo.ms_adrhistory.doctorname,
//          dbo.ms_adrhistory.userID,
//          dbo.ms_adrhistory.fullname,
//          dbo.ms_adrhistory.hn,
//          dbo.ms_adrhistory.an,
//          dbo.ms_adrhistory.adrnotecode,
//          dbo.ms_adrhistory.adrnotedetail,
//          dbo.ms_adrhistory.adrremark,
//          dbo.ms_adrhistory.meditemindex,
//          dbo.ms_adrhistory.level
//          FROM dbo.ms_adrhistory
//          WHERE an = '6766305'

//         SELECT
//         dbo.ms_adrnote.adrnotecode,
//         dbo.ms_adrnote.adrnotedetail
//         FROM dbo.ms_adrnote
//         WHERE an = '6766305'

// {  get_msdetailIPD
//         SELECT
//         null as dispensstatus,
//         med.meditemindex,
//         med.seq,
//         med.seqmax,
//         med.hn,
//         med.an,
//         med.prioritycode,
//         pr.prioritydesc,
//         med.takedate,
//         med.ordercreatedate,
//         med.orderitemcode,
//         med.orderitemname,
//         dg.orderitemENname,
//         dg.displaycolour,
//         convert(float, ISNULL(med.orderqty, 0)) As orderqty,
//         med.orderunitcode,
//         dou.DispensedTotalUnitTH,
//         med.instructioncode,
//         Ins.InstructionNameTH,
//         convert(float,ISNULL(med.dosage,0)) As dosage,
//         med.dosageunitcode,
//         dos.DispensedUnitTH,
//         med.frequencycode,
//         fc.frequency_nameTH,
//         ISNULL(fc.qty_per_day,0) As qty_per_day,
//         fc.frequency_onlydays,
//         fc.oddday,
//         med.timecode,
//         ft.timeTH,
//         med.timecount,
//         ISNULL(med.durationcode,'0') As durationcode,
//         med.usercreatecode,
//         us.fullname,
//         med.orderacceptfromip,
//         med.computername,
//         med.departmentcode,
//         med.itemlotcode,
//         med.itemlotexpire,
//         med.doctorcode,
//         med.doctorname,
//         med.freetext1,
//         med.freetext2,
//         med.lastmodified,
//         med.[language],
//         med.ordertype,
//         med.highalert,
//         med.shelfzone,
//         med.shelfname,
//         med.varymeal,
//         med.varymealtime,
//         med.voiddatetime,
//         convert(float,ISNULL(med.price,0)) As price,
//         convert(float,ISNULL(med.totalprice,0)) As totalprice,
//         med.sendmachine,
//         med.sendmix,
//         ISNULL(med.sendchemo,'N') As sendchemo,
//         ISNULL(med.sendtpn,'N') As sendtpn,
//         med.drugusagecode,
//         med.tmtcode,
//         med.startdate,
//         med.enddate,
//         med.offstatus,
//         med.groupdrug,
//         med.sendmixcode,
//         med.sendmixname,
//         convert(float,med.vol) as vol,
//         med.dosageunitforVol,
//         med.pricetype,
//         med.printstatus,
//         med.itemidentify,
//         med.printdrp,
//         convert(float,ISNULL(med.firstdose,0)) As firstdose,
//         med.diluentadd,
//         med.orderfrom,
//         med.holddatetime,
//         ISNULL(med.varymealstatus,'N') As varymealstatus,
//         med.freetext3,
//         med.odddatetime,
//         med.oddday as odd,
//         med.paytype,
//         ISNULL(med.firstdosestatus,'0') As firstdosestatus,
//         ISNULL(med.firsttimecount,1) As firsttimecount,
//         med.DIDcode,
//         ISNULL(med.continuestatus,'N') as continuestatus,
//         mer.meditemindex,
//         Case WHEN mer.meditemindex Is Not NULL THEN
//         'MRC'
//         Else '' END as MRC,
//         ISNULL(med.statustimeend,'N') As statustimeend,
//         med.timestart,
//         med.timeend,
//         med.odddatetime,
//         isnull(med.dosecal,0) as dosecal,
//         med.statuscal,
//         isnull(med.dayend,0) As dayend,
//         med.protocolcode
//         From
//         dbo.ms_medicationprofile med
//         Left Join dbo.ms_medicationrecconcile mer On mer.meditemindex = med.meditemindex
//         Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd
//         Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd
//         Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code
//         Left Join dbo.ms_time ft On med.timecode = ft.timecode
//         Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd
//         Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode
//         Left Join dbo.ms_users us On us.userID = med.usercreatecode
//         Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode
//         WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '2567-10-22 08:00:00' AND '2567-10-23 07:59:00')   And (med.enddate >= '2567-10-21' or med.enddate IS NULL)  And (med.ordercreatedate between '2567-10-22 08:00:00' AND '2567-10-23 07:59:00' OR med.prioritycode ='C' OR med.prioritycode ='CS' OR med.prioritycode ='H')  And med.an ='6766305'        ORDER BY med.voiddatetime ASC,
//         med.prioritycode ASC,
//         med.ordercreatedate ASC,
//         med.groupdrug Asc,
//         med.seq ASC

//       ใช้ได้
//         SELECT
//         null AS dispensstatus,
//         med.meditemindex,
//         med.seq,
//         med.seqmax,
//         med.hn,
//         med.an,
//         med.prioritycode,
//         pr.prioritydesc,
//         med.takedate,
//         med.ordercreatedate,
//         med.orderitemcode,
//         med.orderitemname,
//         dg.orderitemENname,
//         dg.displaycolour,
//         CONVERT(float, ISNULL(med.orderqty, 0)) AS orderqty,
//         med.orderunitcode,
//         dou.DispensedTotalUnitTH,
//         med.instructioncode,
//         Ins.InstructionNameTH,
//         CONVERT(float, ISNULL(med.dosage, 0)) AS dosage,
//         med.dosageunitcode,
//         dos.DispensedUnitTH,
//         med.frequencycode,
//         fc.frequency_nameTH,
//         ISNULL(fc.qty_per_day, 0) AS qty_per_day,
//         fc.frequency_onlydays,
//         fc.oddday,
//         med.timecode,
//         ft.timeTH,
//         med.timecount,
//         ISNULL(med.durationcode, '0') AS durationcode,
//         med.usercreatecode,
//         us.fullname,
//         med.orderacceptfromip,
//         med.computername,
//         med.departmentcode,
//         med.itemlotcode,
//         med.itemlotexpire,
//         med.doctorcode,
//         med.doctorname,
//         med.freetext1,
//         med.freetext2,
//         med.lastmodified,
//         med.[language],
//         med.ordertype,
//         med.highalert,
//         med.shelfzone,
//         med.shelfname,
//         med.varymeal,
//         med.varymealtime,
//         med.voiddatetime,
//         CONVERT(float, ISNULL(med.price, 0)) AS price,
//         CONVERT(float, ISNULL(med.totalprice, 0)) AS totalprice,
//         med.sendmachine,
//         med.sendmix,
//         ISNULL(med.sendchemo, 'N') AS sendchemo,
//         ISNULL(med.sendtpn, 'N') AS sendtpn,
//         med.drugusagecode,
//         med.tmtcode,
//         med.startdate,
//         med.enddate,
//         med.offstatus,
//         med.groupdrug,
//         med.sendmixcode,
//         med.sendmixname,
//         CONVERT(float, med.vol) AS vol,
//         med.dosageunitforVol,
//         med.pricetype,
//         med.printstatus,
//         med.itemidentify,
//         med.printdrp,
//         CONVERT(float, ISNULL(med.firstdose, 0)) AS firstdose,
//         med.diluentadd,
//         med.orderfrom,
//         med.holddatetime,
//         ISNULL(med.varymealstatus, 'N') AS varymealstatus,
//         med.freetext3,
//         med.odddatetime,
//         med.oddday AS odd,
//         med.paytype,
//         ISNULL(med.firstdosestatus, '0') AS firstdosestatus,
//         ISNULL(med.firsttimecount, 1) AS firsttimecount,
//         med.DIDcode,
//         ISNULL(med.continuestatus, 'N') AS continuestatus,
//         mer.meditemindex,
//         CASE WHEN mer.meditemindex IS NOT NULL THEN 'MRC' ELSE '' END AS MRC,
//         ISNULL(med.statustimeend, 'N') AS statustimeend,
//         med.timestart,
//         med.timeend,
//         med.odddatetime,
//         ISNULL(med.dosecal, 0) AS dosecal,
//         med.statuscal,
//         ISNULL(med.dayend, 0) AS dayend,
//         med.protocolcode
//     FROM
//         dbo.ms_medicationprofile med
//     LEFT JOIN dbo.ms_medicationrecconcile mer ON mer.meditemindex = med.meditemindex
//     LEFT JOIN dbo.ms_dosageunit dos ON med.dosageunitcode = dos.DispensedUnitCd
//     LEFT JOIN dbo.ms_orderunit dou ON med.orderunitcode = dou.DispensedTotalUnitCd
//     LEFT JOIN dbo.ms_frequency_code fc ON med.frequencycode = fc.frequency_code
//     LEFT JOIN dbo.ms_time ft ON med.timecode = ft.timecode
//     LEFT JOIN dbo.ms_Instruction Ins ON med.instructioncode = Ins.InstructionCd
//     LEFT JOIN dbo.ms_priority pr ON med.prioritycode = pr.prioritycode
//     LEFT JOIN dbo.ms_users us ON us.userID = med.usercreatecode
//     LEFT JOIN dbo.ms_drug dg ON dg.orderitemcode = med.orderitemcode
//     WHERE
//         (med.voiddatetime IS NULL OR med.voiddatetime BETWEEN '2567-10-22 08:00:00' AND '2567-10-23 07:59:00')
//         AND (med.enddate >= '2567-10-21' OR med.enddate IS NULL)
//         AND (med.ordercreatedate BETWEEN '2567-10-22 08:00:00' AND '2567-10-23 07:59:00'
//              OR med.prioritycode = 'C'
//              OR med.prioritycode = 'CS'
//              OR med.prioritycode = 'H')
//         AND med.an = '6766305'
//     ORDER BY
//         med.voiddatetime ASC,
//         med.prioritycode ASC,
//         med.ordercreatedate ASC,
//         med.groupdrug ASC,
//         med.seq ASC;

// }

// ShowAllow
// SELECT
// AL.AllowCd,
// AL.AllowStatus,
// AL.StartDate,
// AL.EndDate,
// AL.Reason,
// AL.userID,
// us.firstname + ' ' + us.lastname as fullname,
// AL.meditemindex
// FROM ms_Allow AL
// LEFT JOIN ms_users us ON AL.userID = us.userID
// Where meditemindex = '20191031002340'

// Dim tstrart As Integer = 800
//         Dim strStartdate2 As Integer = 0
//         Dim strEnddate2 As Integer = 0
//         Dim tnow As Integer = CInt(Date.Now.ToString("HHmm"))
//         Dim dstart As DateTime = Date.Now
//         Dim dend As DateTime = Date.Now
//         If tnow >= 800 And tnow <= 2359 Then
//              WHERE (med.voiddatetime IS NULL OR med.voiddatetime between ' Date.Now.ToString("yyyy-MM-dd 08:00:00") ' AND ' Date.Now.AddDays(1).ToString("yyyy-MM-dd 07:59:00") ')
//             And (format(med.enddate,'yyyy-MM-dd') = ' Date.Now.AddDays(-1).ToString("yyyy-MM-dd") ' and med.enddate IS NOT NULL and med.voiddatetime IS NULL) "
//             And (med.ordercreatedate between ' Date.Now.ToString("yyyy-MM-dd 08:00:00") ' AND ' Date.Now.AddDays(1).ToString("yyyy-MM-dd 07:59:00") ' OR med.prioritycode ='C' OR med.prioritycode ='CS')
//         ElseIf tnow >= 0 And tnow <= 759 Then
//              WHERE (med.voiddatetime IS NULL OR med.voiddatetime between ' Date.Now.AddDays(-1).ToString("yyyy-MM-dd 08:00:00") ' AND ' Date.Now.ToString("yyyy-MM-dd 07:59:00") ')
//             And (format(med.enddate,'yyyy-MM-dd') = ' Date.Now.AddDays(-1).ToString("yyyy-MM-dd") ' or med.enddate IS NOT NULL and med.voiddatetime IS NULL) "
//             AND (med.ordercreatedate between ' Date.Now.AddDays(-1).ToString("yyyy-MM-dd 08:00:00") ' AND ' Date.Now.ToString("yyyy-MM-dd 07:59:00") ' OR med.prioritycode ='C' OR med.prioritycode ='CS')
//         End If

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
//         dbo.ms_adr.hn = '" & hn & "'
//         ORDER BY
//         dbo.ms_adr.AllergyGroupCd

//         Public Function get_viewDRP
//         SELECT
//         dd.DRPItemNo,
//         dd.Ordercreatedate,
//         dd.[Time],
//         dd.ProcessCd,
//         dd.[No],
//         dd.DRP_ProblemCd,
//         dd.OrderItemCaseCode,
//         dd.OrderItemDispenCode,
//         dd.ProblemOccurCd,
//         dd.Severity,
//         dd.Preventable,
//         dd.CauseOfDRPCd,
//         dd.InterventionCd,
//         dd.InterAcceptCd,
//         dd.StatusOfproblemCd,
//         dd.ReporterCd,
//         dd.UserCreateCode,
//         dd.PharmacistNote,
//         dd.PlanNote
//         FROM ms_drpdetail dd
//         WHERE dd.Hn = '64116475'
//         ORDER BY dd.Ordercreatedate DESC, dd.[No] ASC

//         Public Function get_ms_labresult(ByVal condition As String) As DataTable
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
//         WHERE dbo.ms_labresult.hn = '47856568'
//          And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7
//          Order by dbo.ms_labresult.date_result DESC

// location?
// SELECT
//         dbo.prescription.wardcode,
//         '[ '+ dbo.prescription.wardcode +' ]' + dbo.prescription.wardname AS wardname,
//         COUNT(DISTINCT dbo.prescription.prescriptionno) counpres
//         FROM
//         dbo.prescription
//         LEFT JOIN dbo.ms_ward On dbo.prescription.wardcode = dbo.ms_ward.wardcode
//         Left JOIN dbo.ms_drug On dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
//         WHERE  dbo.prescription.genorderdatetime IS NOT NULL And ISNULL(dbo.prescription.frequencycode,'') NOT In ('S','E','STAT')  And dbo.prescription.ordertype <> '1' AND prescription.ordercreatedate BETWEEN '2024-10-31 08:00' AND '2024-11-01 07:59:00
//         GROUP BY
//         dbo.prescription.wardcode,
//         dbo.prescription.wardname
//         ORDER BY CONVERT(INT, dbo.prescription.wardcode) ASC

//         Public Function GetStickersummary(ByVal condition As String) As DataTable
//         SELECT
//         ROW_NUMBER() OVER(ORDER BY dbo.packagemaster.orderunitcode) As RowID,
//         dbo.packagemaster.prescriptionno,
//         dbo.packagemaster.hn,
//         dbo.packagemaster.an,
//         dbo.packagemaster.patientname,
//         dbo.packagemaster.wardcode,
//         dbo.packagemaster.wardname,
//         dbo.packagemaster.orderitemcode,
//         dbo.packagemaster.orderitemname,
//         convert(float,dbo.packagemaster.orderqty) As orderqty,
//         dbo.packagemaster.orderunitcode,
//         dbo.packagemaster.orderunitdesc,
//         dbo.packagemaster.prioritycode,
//         dbo.packagemaster.instructioncode,
//         dbo.packagemaster.instructiondesc,
//         dbo.packagemaster.dosageunitcode,
//         dbo.packagemaster.dosageunitdesc,
//         dbo.packagemaster.frequencycode,
//         dbo.packagemaster.frequencydesc,
//         dbo.packagemaster.timecode,
//         dbo.packagemaster.timedesc,
//         dbo.packagemaster.shelfname,
//         dbo.packagemaster.printstatus,
//         convert(float,dbo.packagemaster.dosage) as dosage,
//         REPLACE(dbo.packagemaster.freetext1,'' ,CHAR(10)) AS freetext1,
//         REPLACE(dbo.packagemaster.freetext2,'' ,CHAR(10)) AS freetext2,
//         dbo.packagemaster.locationcode,
//         dbo.ms_drug.edned,
//         ISNULL(dbo.ms_drug.IPDprice,'0') As IPDprice,
//         dbo.packagemaster.usercreatecode,
//         dbo.ms_users.username,
//         dbo.ms_patient.rightid,
//         dbo.ms_right.rightnameTH,
//         dbo.ms_right.grouptopupHM,
//         dbo.packagemaster.patientdob,
//         dbo.packagemaster.printstatus,
//         dbo.packagemaster.ordertype
//         FROM
//         dbo.packagemaster
//         Left Join dbo.ms_drug On dbo.packagemaster.orderitemcode = dbo.ms_drug.orderitemcode
//         Left Join dbo.ms_patient On dbo.packagemaster.hn = dbo.ms_patient.hn
//         Left Join dbo.ms_right On dbo.ms_patient.rightid = dbo.ms_right.rightid
//         Left Join dbo.ms_users On dbo.packagemaster.usercreatecode = dbo.ms_users.userID
//         WHERE prescriptionno  = '24110201272' AND (dbo.packagemaster.printstatus ='1' OR dbo.packagemaster.shelfname='JVM') AND ISNULL(packagemaster.dosage,0) >= 0
//         GROUP BY
//         dbo.packagemaster.prescriptionno,
//         dbo.packagemaster.patientname,
//         dbo.packagemaster.hn,
//         dbo.packagemaster.an,
//         dbo.packagemaster.wardcode,
//         dbo.packagemaster.wardname,
//         dbo.packagemaster.orderitemcode,
//         dbo.packagemaster.orderitemname,
//         dbo.packagemaster.orderqty,
//         dbo.packagemaster.orderunitcode,
//         dbo.packagemaster.orderunitdesc,
//         dbo.packagemaster.prioritycode,
//         dbo.packagemaster.instructioncode,
//         dbo.packagemaster.instructiondesc,
//         dbo.packagemaster.dosageunitcode,
//         dbo.packagemaster.dosageunitdesc,
//         dbo.packagemaster.frequencycode,
//         dbo.packagemaster.frequencydesc,
//         dbo.packagemaster.timecode,
//         dbo.packagemaster.timedesc,
//         dbo.packagemaster.shelfname,
//         dbo.packagemaster.printstatus,
//         dbo.packagemaster.dosage,
//         dbo.packagemaster.freetext1,
//         dbo.packagemaster.freetext2,
//         dbo.packagemaster.locationcode,
//         dbo.ms_drug.edned,
//         dbo.ms_drug.IPDprice,
//         dbo.packagemaster.usercreatecode,
//         dbo.ms_users.username,
//         dbo.ms_patient.rightid,
//         dbo.ms_right.rightnameTH,
//         dbo.ms_right.grouptopupHM,
//         dbo.packagemaster.patientdob,
//         dbo.packagemaster.printstatus,
//         dbo.packagemaster.ordertype
//         ORDER BY
//         dbo.packagemaster.locationcode DESC

//         dtDDI = clsDDIhis.Showms_drugintereactionhistory("WHERE ms_drugintereactionhistory.prescriptionno='24110201272' AND dbo.ms_drugintereactionhistory.printstatus='1' and dbo.ms_drugintereactionhistory.dlevel <> 'Inform'")
//         Public Function GetSticker(ByVal condition As String) As DataTable
//         Select
//         pk.prescriptionno,
//         pk.orderitembarcode,
//         pk.patientname,
//         pk.hn,
//         pk.an,
//         pk.wardcode,
//         pk.wardname,
//         CASE WHEN ISNULL(pk.bedcode, '0') = '0' THEN '-'
//         End As bedcode,
//         pk.takedate,
//         pk.orderitemcode,
//         pk.orderitemname,
//         convert(float,pk.orderqty) As orderqty,
//         pk.orderunitcode,
//         pk.orderunitdesc,
//         pk.prioritycode As type,
//         Case
//         WHEN pk.prioritycode = 'C' THEN 'Continue'
//         When pk.prioritycode = 'E' THEN 'Continue Extra'
//         WHEN pk.prioritycode = 'O' THEN 'One day'
//         When pk.prioritycode = 'H' THEN 'Home Made'
//         Else 'One day'
//         End As prioritycode,
//         pk.prioritydesc,
//         convert(float,pk.dosage) As dosage,
//         pk.dosageunitdesc,
//         pk.freetext1,
//         pk.freetext2,
//         pk.freetext3,
//         Case
//         When pk.forcash = 0 Then 'ก'
//         End As forcash,
//         pk.shelfname,
//         pk.frequencycount,
//         l.auxiliary1_THIPD,
//         l.auxiliary2_THIPD,
//         l.auxiliary1_ENIPD,
//         l.auxiliary2_ENIPD,
//         l.auxiliary1_THOPD,
//         l.auxiliary2_THOPD,
//         l.auxiliary1_ENOPD,
//         l.auxiliary2_ENOPD,
//         l.integration_THIPD,
//         l.integration_ENIPD,
//         l.integration_THOPD,
//         l.integration_ENOPD,
//         drug.orderitemTHname,
//         pk.printstatus,
//         pk.locationcode,
//         pk.tmtcode,
//         pk.rowpatient,
//         pk.itemindex,
//         pk.ordertype,
//         dbo.ms_patient.rightid,
//         dbo.ms_right.rightnameTH,
//         dbo.ms_right.grouptopupHM,
//         pr.meditemindex
//         FROM
//         packagemaster pk
//         Left Join ms_drug  As drug On drug.orderitemcode = pk.orderitemcode
//         Left Join ms_label As l On l.orderitemcode = pk.orderitemcode
//         Left Join dbo.ms_patient On pk.hn = dbo.ms_patient.hn
//         Left Join dbo.ms_right On dbo.ms_patient.rightid = dbo.ms_right.rightid
//         Left Join dbo.prescription As pr On pr.itemindex = pk.itemindex
//         And pr.prescriptionno = pk.prescriptionno

//         WHERE pk.prescriptionno  = '24110201272'  AND ISNULL(pk.dosage,0) >= 0
//         ORDER BY
//         pk.prioritycode DESC,
//         pk.takedate ASC ,
//         pk.shelfname

//         Public Function getForgenorder(ByVal condition As String) As DataTable
//          SELECT
//          dbo.prescription.prescriptionno,
//          dbo.prescription.seq,
//          dbo.prescription.seqmax,
//          dbo.prescription.orderitembarcode,
//          dbo.prescription.patientname,
//          dbo.prescription.sex,
//          convert(varchar(20),dbo.prescription.patientdob,120) As patientdob ,
//          dbo.prescription.hn,
//          dbo.prescription.an,
//          dbo.prescription.wardcode,
//          dbo.prescription.wardname,
//          dbo.prescription.bedcode,
//          dbo.prescription.prioritycode,
//          dbo.prescription.prioritydesc,
//          dbo.prescription.takedate,
//          ISNULL(dbo.prescription.enddate,null) as enddate,
//          dbo.prescription.ordercreatedate,
//          dbo.prescription.orderitemcode,
//          dbo.prescription.orderitemname,
//          convert(float,dbo.prescription.orderqty) As orderqty,
//          dbo.prescription.orderunitcode,
//          dbo.prescription.orderunitdesc,
//          dbo.prescription.instructioncode,
//          dbo.prescription.instructiondesc,
//          convert(float,dbo.prescription.dosage) As dosage,
//          dbo.prescription.dosageunitcode,
//          dbo.prescription.dosageunitdesc,
//          dbo.prescription.frequencycode,
//          dbo.prescription.frequencydesc,
//          dbo.prescription.timecode,
//          dbo.prescription.timedesc,
//          dbo.prescription.fromlocationname,
//          dbo.prescription.usercreatecode,
//          dbo.prescription.usercreatename,
//          dbo.prescription.orderacceptfromip,
//          dbo.prescription.computername,
//          dbo.prescription.itemlotcode,
//          dbo.prescription.itemlotexpire,
//          dbo.prescription.doctorcode,
//          dbo.prescription.doctorname,
//          dbo.prescription.pharmacyitemcode,
//          dbo.prescription.pharmacyitemdesc,
//          dbo.prescription.freetext1,
//          dbo.prescription.freetext2,
//          dbo.prescription.freetext3,
//          dbo.prescription.itemidentify,
//          dbo.prescription.lastmodified,
//          dbo.prescription.[language],
//          dbo.prescription.statuscode,
//          dbo.prescription.ordertype,
//          dbo.prescription.varymeal,
//          dbo.prescription.varymealtime,
//          dbo.prescription.voiddatetime,
//          dbo.prescription.genorderdatetime,
//          dbo.prescription.forcash,
//          '' As timedetailcode,
//          '' As timedetailTH,
//          '' As timedetailEN,
//          dbo.prescription.timecount,
//          dbo.prescription.itemindex,
//          dbo.prescription.tmtcode,
//          dbo.prescription.sendmachine,
//          dbo.prescription.sendmix,
//          dbo.prescription.sendchemo,
//          dbo.prescription.printstatus,
//          dbo.prescription.rowpatient,
//          dbo.prescription.holddatetime,
//          dbo.prescription.startdate,
//          dbo.prescription.printauto,
//          dbo.prescription.statustimeend,
//          dbo.prescription.timestart,
//          dbo.prescription.timeend,
//          dbo.ms_drug.drugform
//          FROM
//          dbo.prescription
//          Left Join ms_drug ON dbo.prescription.orderitemcode = dbo.ms_drug.orderitemcode
//          WHERE dbo.prescription.prescriptionno = '24110201272'  AND dbo.prescription.printstatus = '3'
//          ORDER BY  dbo.prescription.printstatus DESC,dbo.ms_drug.sendmachine

//          SELECT
//          null as dispensstatus,
//          med.meditemindex,
//          med.seq,
//          med.seqmax,
//          med.hn,
//          med.an,
//          med.prioritycode,
//          pr.prioritydesc,
//          med.takedate,
//          med.ordercreatedate,
//          med.orderitemcode,
//          med.orderitemname,
//          dg.orderitemENname,
//          dg.displaycolour,
//          convert(float, ISNULL(med.orderqty, 0)) As orderqty,
//          med.orderunitcode,
//          dou.DispensedTotalUnitTH,
//          med.instructioncode,
//          Ins.InstructionNameTH,
//          convert(float,ISNULL(med.dosage,0)) As dosage,
//          med.dosageunitcode,
//          dos.DispensedUnitTH,
//          med.frequencycode,
//          fc.frequency_nameTH,
//          ISNULL(fc.qty_per_day,0) As qty_per_day,
//          fc.frequency_onlydays,
//          fc.oddday,
//          med.timecode,
//          ft.timeTH,
//          med.timecount,
//          ISNULL(med.durationcode,'0') As durationcode,
//          med.usercreatecode,
//          us.fullname,
//          med.orderacceptfromip,
//          med.computername,
//          med.departmentcode,
//          med.itemlotcode,
//          med.itemlotexpire,
//          med.doctorcode,
//          med.doctorname,
//          med.freetext1,
//          med.freetext2,
//          med.lastmodified,
//          med.[language],
//          med.ordertype,
//          med.highalert,
//          med.shelfzone,
//          med.shelfname,
//          med.varymeal,
//          med.varymealtime,
//          med.voiddatetime,
//          convert(float,ISNULL(med.price,0)) As price,
//          convert(float,ISNULL(med.totalprice,0)) As totalprice,
//          med.sendmachine,
//          med.sendmix,
//          ISNULL(med.sendchemo,'N') As sendchemo,
//          ISNULL(med.sendtpn,'N') As sendtpn,
//          med.drugusagecode,
//          med.tmtcode,
//          med.startdate,
//          med.enddate,
//          med.offstatus,
//          med.groupdrug,
//          med.sendmixcode,
//          med.sendmixname,
//          convert(float,med.vol) as vol,
//          med.dosageunitforVol,
//          med.pricetype,
//          med.printstatus,
//          med.itemidentify,
//          med.printdrp,
//          convert(float,ISNULL(med.firstdose,0)) As firstdose,
//          med.diluentadd,
//          med.orderfrom,
//          med.holddatetime,
//          ISNULL(med.varymealstatus,'N') As varymealstatus,
//          med.freetext3,
//          med.odddatetime,
//          med.oddday as odd,
//          med.paytype,
//          ISNULL(med.firstdosestatus,'0') As firstdosestatus,
//          ISNULL(med.firsttimecount,1) As firsttimecount,
//          med.DIDcode,
//          ISNULL(med.continuestatus,'N') as continuestatus,
//          mer.meditemindex,
//          Case WHEN mer.meditemindex Is Not NULL THEN
//          'MRC'
//          Else '' END as MRC,
//          ISNULL(med.statustimeend,'N') As statustimeend,
//          med.timestart,
//          med.timeend,
//          med.odddatetime,
//          isnull(med.dosecal,0) as dosecal,
//          med.statuscal,
//          isnull(med.dayend,0) As dayend,
//          med.protocolcode
//          From
//          dbo.ms_medicationprofile med
//          Left Join dbo.ms_medicationrecconcile mer On mer.meditemindex = med.meditemindex
//          Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd
//          Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd
//          Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code
//          Left Join dbo.ms_time ft On med.timecode = ft.timecode
//          Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd
//          Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode
//          Left Join dbo.ms_users us On us.userID = med.usercreatecode
//          Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode
//          WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '2567-11-04 08:00:00' AND '2567-11-05 07:59:00') And (format(med.enddate,'yyyy-MM-dd') = '2567-11-03' and med.enddate IS NOT NULL and med.voiddatetime IS NULL)  And (med.ordercreatedate between '2567-11-04 08:00:00' AND '2567-11-05 07:59:00' OR med.prioritycode ='C' OR med.prioritycode ='CS') And med.an ='6760590'
//           ORDER BY med.voiddatetime ASC,
//          med.prioritycode ASC,
//          med.ordercreatedate ASC,
//          med.groupdrug Asc,
//          med.seq ASC

//           SELECT
//          dbo.ms_adrhistory.adrhiscode,
//          dbo.ms_adrhistory.adrhisdatetime,
//          dbo.ms_adrhistory.orderitemcode,
//          dbo.ms_adrhistory.orderitemname,
//          dbo.ms_adrhistory.doctorCd,
//          dbo.ms_adrhistory.doctorname,
//          dbo.ms_adrhistory.userID,
//          dbo.ms_adrhistory.fullname,
//          dbo.ms_adrhistory.hn,
//          dbo.ms_adrhistory.an,
//          dbo.ms_adrhistory.adrnotecode,
//          dbo.ms_adrhistory.adrnotedetail,
//          dbo.ms_adrhistory.adrremark,
//          dbo.ms_adrhistory.meditemindex,
//          dbo.ms_adrhistory.level
//          FROM dbo.ms_adrhistory
//         WHERE an = '6760590'

//         Public Function get_msdetailIPD(ByVal condition As String) As DataTable //// ใช้ได้  medIPD
//         SELECT
//         null as dispensstatus,
//         med.meditemindex,
//         med.seq,
//         med.seqmax,
//         med.hn,
//         med.an,
//         med.prioritycode,
//         pr.prioritydesc,
//         med.takedate,
//         med.ordercreatedate,
//         med.orderitemcode,
//         med.orderitemname,
//         dg.orderitemENname,
//         dg.displaycolour,
//         convert(float, ISNULL(med.orderqty, 0)) As orderqty,
//         med.orderunitcode,
//         dou.DispensedTotalUnitTH,
//         med.instructioncode,
//         Ins.InstructionNameTH,
//         convert(float,ISNULL(med.dosage,0)) As dosage,
//         med.dosageunitcode,
//         dos.DispensedUnitTH,
//         med.frequencycode,
//         fc.frequency_nameTH,
//         ISNULL(fc.qty_per_day,0) As qty_per_day,
//         fc.frequency_onlydays,
//         fc.oddday,
//         med.timecode,
//         ft.timeTH,
//         med.timecount,
//         ISNULL(med.durationcode,'0') As durationcode,
//         med.usercreatecode,
//         us.fullname,
//         med.orderacceptfromip,
//         med.computername,
//         med.departmentcode,
//         med.itemlotcode,
//         med.itemlotexpire,
//         med.doctorcode,
//         med.doctorname,
//         med.freetext1,
//         med.freetext2,
//         med.lastmodified,
//         med.[language],
//         med.ordertype,
//         med.highalert,
//         med.shelfzone,
//         med.shelfname,
//         med.varymeal,
//         med.varymealtime,
//         med.voiddatetime,
//         convert(float,ISNULL(med.price,0)) As price,
//         convert(float,ISNULL(med.totalprice,0)) As totalprice,
//         med.sendmachine,
//         med.sendmix,
//         ISNULL(med.sendchemo,'N') As sendchemo,
//         ISNULL(med.sendtpn,'N') As sendtpn,
//         med.drugusagecode,
//         med.tmtcode,
//         med.startdate,
//         med.enddate,
//         med.offstatus,
//         med.groupdrug,
//         med.sendmixcode,
//         med.sendmixname,
//         convert(float,med.vol) as vol,
//         med.dosageunitforVol,
//         med.pricetype,
//         med.printstatus,
//         med.itemidentify,
//         med.printdrp,
//         convert(float,ISNULL(med.firstdose,0)) As firstdose,
//         med.diluentadd,
//         med.orderfrom,
//         med.holddatetime,
//         ISNULL(med.varymealstatus,'N') As varymealstatus,
//         med.freetext3,
//         med.odddatetime,
//         med.oddday as odd,
//         med.paytype,
//         ISNULL(med.firstdosestatus,'0') As firstdosestatus,
//         ISNULL(med.firsttimecount,1) As firsttimecount,
//         med.DIDcode,
//         ISNULL(med.continuestatus,'N') as continuestatus,
//         mer.meditemindex,
//         Case WHEN mer.meditemindex Is Not NULL THEN
//         'MRC'
//         Else '' END as MRC,
//         ISNULL(med.statustimeend,'N') As statustimeend,
//         med.timestart,
//         med.timeend,
//         med.odddatetime,
//         isnull(med.dosecal,0) as dosecal,
//         med.statuscal,
//         isnull(med.dayend,0) As dayend,
//         med.protocolcode
//         From
//         dbo.ms_medicationprofile med
//         Left Join dbo.ms_medicationrecconcile mer On mer.meditemindex = med.meditemindex
//         Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd
//         Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd
//         Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code
//         Left Join dbo.ms_time ft On med.timecode = ft.timecode
//         Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd
//         Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode
//         Left Join dbo.ms_users us On us.userID = med.usercreatecode
//         Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode
//         WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '2567-11-04 08:00:00'
//           AND '2567-11-05 07:59:00')
//            And (med.enddate >= '2567-11-03' or med.enddate IS NULL)
//            And (med.ordercreatedate between '2567-11-04 08:00:00'
//           AND '2567-11-05 07:59:00' OR med.prioritycode ='C' OR med.prioritycode ='CS' OR med.prioritycode ='H')
//          And med.an ='6760590'

//         ORDER BY med.voiddatetime ASC,
//         med.prioritycode ASC,
//         med.ordercreatedate ASC,
//         med.groupdrug Asc,
//         med.seq ASC

//         Private Sub checkoffdrug(ByVal an As String)
//         Dim dt As New DataTable
//         Dim codition As String = ""
//         Dim tstrart As Integer = 800
//         Dim strStartdate2 As Integer = 0
//         Dim strEnddate2 As Integer = 0
//         Dim tnow As Integer = CInt(Date.Now.ToString("HHmm"))
//         Dim dstart As DateTime = Date.Now
//         Dim dend As DateTime = Date.Now
//         If tnow >= 800 And tnow <= 2359 Then
//             codition = " WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '" & Date.Now.ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.AddDays(1).ToString("yyyy-MM-dd 07:59:00") & "') " & vbCrLf
//             codition &= " And (format(med.enddate,'yyyy-MM-dd') = '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd") & "' and med.enddate IS NOT NULL and med.voiddatetime IS NULL) "
//             codition &= " And (med.ordercreatedate between '" & Date.Now.ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.AddDays(1).ToString("yyyy-MM-dd 07:59:00") & "' OR med.prioritycode ='C' OR med.prioritycode ='CS') " & vbCrLf
//         ElseIf tnow >= 0 And tnow <= 759 Then
//             codition = " WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.ToString("yyyy-MM-dd 07:59:00") & "') " & vbCrLf
//             codition &= " And (format(med.enddate,'yyyy-MM-dd') = '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd") & "' or med.enddate IS NOT NULL and med.voiddatetime IS NULL) "
//             codition &= " AND (med.ordercreatedate between '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.ToString("yyyy-MM-dd 07:59:00") & "' OR med.prioritycode ='C' OR med.prioritycode ='CS') " & vbCrLf
//         End If
//         codition &= " And med.an ='" & an & "' " & vbCrLf

//         dt = clsMed.get_msdetailIPD(codition)

//         Private Sub checkoffdrug(ByVal an As String)
//         Dim dt As New DataTable
//         Dim codition As String = ""
//         Dim tstrart As Integer = 800
//         Dim strStartdate2 As Integer = 0
//         Dim strEnddate2 As Integer = 0
//         Dim tnow As Integer = CInt(Date.Now.ToString("HHmm"))
//         Dim dstart As DateTime = Date.Now
//         Dim dend As DateTime = Date.Now
//         If tnow >= 800 And tnow <= 2359 Then
//             codition = " WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '" & Date.Now.ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.AddDays(1).ToString("yyyy-MM-dd 07:59:00") & "') " & vbCrLf
//             codition &= " And (format(med.enddate,'yyyy-MM-dd') = '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd") & "' and med.enddate IS NOT NULL and med.voiddatetime IS NULL) "
//             codition &= " And (med.ordercreatedate between '" & Date.Now.ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.AddDays(1).ToString("yyyy-MM-dd 07:59:00") & "' OR med.prioritycode ='C' OR med.prioritycode ='CS') " & vbCrLf
//         ElseIf tnow >= 0 And tnow <= 759 Then
//             codition = " WHERE (med.voiddatetime IS NULL OR med.voiddatetime between '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.ToString("yyyy-MM-dd 07:59:00") & "') " & vbCrLf
//             codition &= " And (format(med.enddate,'yyyy-MM-dd') = '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd") & "' or med.enddate IS NOT NULL and med.voiddatetime IS NULL) "
//             codition &= " AND (med.ordercreatedate between '" & Date.Now.AddDays(-1).ToString("yyyy-MM-dd 08:00:00") & "' AND '" & Date.Now.ToString("yyyy-MM-dd 07:59:00") & "' OR med.prioritycode ='C' OR med.prioritycode ='CS') " & vbCrLf
//         End If
//         codition &= " And med.an ='" & an & "' " & vbCrLf

//         dt = clsMed.get_msdetailIPD(codition)

//         Note DRP
//         SELECT
//         dd.DRPItemNo,
//         dd.Ordercreatedate,
//         dd.[Time],
//         dd.ProcessCd,
//         dd.[No],
//         dd.DRP_ProblemCd,
//         dd.OrderItemCaseCode,
//         dd.OrderItemDispenCode,
//         dd.ProblemOccurCd,
//         dd.Severity,
//         dd.Preventable,
//         dd.CauseOfDRPCd,
//         dd.InterventionCd,
//         dd.InterAcceptCd,
//         dd.StatusOfproblemCd,
//         dd.ReporterCd,
//         dd.UserCreateCode,
//         dd.PharmacistNote,
//         dd.PlanNote
//         FROM ms_drpdetail dd
//          WHERE dd.Hn =  '67023025'
//         ORDER BY dd.Ordercreatedate DESC, dd.[No] ASC

//         show_SearchDruglist
//         SELECT
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
//         FROM
//         dbo.ms_drug
//         LEFT JOIN dbo.ms_drugindex ON
//         dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode

//         WHERE ISNULL(dbo.ms_drug.GeneralChemo, 'N') = 'N'

//         GROUP BY
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

//         where dbo.ms_drug.medicalsupplies = 'Y' And dbo.ms_drug.unused = 'Y'

//         where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' // ทั้งหมด
//         where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'Y' // เปิดใช้งาน
//         where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'N' // ปิดใช้งาน

// แรก
//         Private Sub showDatanonmedisup()
//         Dim dt As New DataTable
//         Dim condition As String = ""

//         If txtSearch.Text = "" Then
//             If rdOpen.Checked = True Then
//                 condition = "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'Y'" 2 2
//             ElseIf rdClose.Checked = True Then
//                 condition = "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'N'"
//             Else
//                 condition = "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y'"
//             End If
//         Else

//         ส่วนสอง
//         Private Sub showDatamedisup()
//         Dim dt As New DataTable
//         Dim condition As String = ""

//         If txtSearch.Text = "" Then
//             If rdOpen.Checked = True Then
//                 condition = "where dbo.ms_drug.medicalsupplies = 'Y' And dbo.ms_drug.unused = 'Y'" 1-1
//             ElseIf rdClose.Checked = True Then
//                 condition = "where dbo.ms_drug.medicalsupplies = 'Y' And dbo.ms_drug.unused = 'N'"
//             Else
//                 condition = "where dbo.ms_drug.medicalsupplies = 'Y'"
//             End If

//             Public Function show_SearchDrugSendmix(ByVal condition As String) As DataTable

//             Select
//             ROW_NUMBER() OVER(ORDER BY sd.sendmixcode ASC) As Row#,
//             sd.orderitemcode,
//             dr.orderitemENname,
//             sd.sendmixcode,
//             sd.sendmixname,
//             sd.VolperPack,
//             sd.dosageunitforvol,
//             sd.DoseperPack,
//             sd.dosageunitfordose,
//             sd.price,
//             sd.nodayexp,
//             sd.theory,
//             sd.calstatus,
//             sd.freetext1,
//             sd.freetext2
//             FROM
//             ms_sendmix AS sd
//             LEFT JOIN ms_drug AS dr ON dr.orderitemcode = sd.orderitemcode
// where sd.orderitemcode = ''
//             Order by sd.sendmixcode ASC

//             Public Function show_msdrug(ByVal condition As String) As DataTable
//         SELECT
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         ISNULL(dbo.ms_drug.unused,'N') AS unused,
//         dbo.ms_drug.barcode,
//         dbo.ms_drug.Strength,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.capacity_orderunit,
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_drug.description,
//         dbo.ms_drug.dateupdate,
//         dbo.ms_drug.locationcode,
//         dbo.ms_drug.highalert,
//         dbo.ms_drug.multidose,
//         dbo.ms_drug.shelfzone,
//         dbo.ms_drug.shelfname,
//         dbo.ms_drug.shelfzone2,
//         dbo.ms_drug.shelfname2,
//         ISNULL(dbo.ms_drug.edned,0) AS edned,
//         dbo.ms_drug.stdcode,
//         ISNULL(dbo.ms_drug.drugaccountcode,'ก') AS drugaccountcode,
//         dbo.ms_drug.dosegeform,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.DIDcode,
//         dbo.ms_drug.TMTcode,
//         dbo.ms_drug.GFMIScode,
//         dbo.ms_drug.GPOcode,
//         dbo.ms_drug.Inventorycode,
//         dbo.ms_drug.cost,
//         dbo.ms_drug.IPDprice,
//         dbo.ms_drug.OPDprice,
//         ISNULL(dbo.ms_drug.sendmachine,'N') AS sendmachine,
//         ISNULL(dbo.ms_drug.sendmix,'N') AS sendmix,
//         dbo.ms_drug.print_ipd_injection_sticker,
//         dbo.ms_drug.pharmacoindex,
//         dbo.ms_drug.pharmacoindexaddition1,
//         dbo.ms_drug.pharmacoindexaddition2,
//         dbo.ms_drug.pharmacoindexaddition3,
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
//         dbo.ms_drug.notify_text,
//         dbo.ms_drug.lactation_text,
//         dbo.ms_drug.pragnancy_text,
//         dbo.ms_drug.agestart,
//         dbo.ms_drug.ageend,
//         dbo.ms_drug.age_text,
//         dbo.ms_drug.spesification_text,
//         dbo.ms_drug.adverse_reaction_text,
//         dbo.ms_drug.contraindications_text,
//         dbo.ms_drug.precaution_text,
//         dbo.ms_drug.storage_text,
//         dbo.ms_drug.maxdoseperdose,
//         dbo.ms_drug.maxdoseperday,
//         dbo.ms_drug.maxduration,
//         dbo.ms_drug.mintimenextdose,
//         ISNULL(dbo.ms_drug.medicalsupplies,'N') AS medicalsupplies,
//         dbo.ms_drug.picname,
//         dbo.ms_drug.locationname1,
//         dbo.ms_drug.locationname2,
//         ISNULL(dbo.ms_drug.drugtype,'0') As drugtype,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         ISNULL(dbo.ms_drug.diluentstatus,'N') AS diluentstatus,
//         ISNULL(dbo.ms_drug.continuestatus,'N') AS continuestatus,
//         ISNULL(dbo.ms_drug.freezestatus,'N') AS freezestatus,
//         ISNULL(dbo.ms_drug.lightstatus,'N') AS lightstatus,
//         ISNULL(dbo.ms_drug.priceunittotalstatus,'N') AS priceunittotalstatus,
//         ISNULL(dbo.ms_drug.paystatus,'N') AS paystatus,
//         ISNULL(dbo.ms_drug.logstatus,'N') AS logstatus,
//         dbo.ms_drug.drugform,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.sendStore,
//         dbo.ms_drug.sendF3F4,
//         dbo.ms_drug.pack,
//         dbo.ms_drug.free,
//         dbo.ms_drug.searchindex,
//         dbo.ms_drug.sendTPN,
//         dbo.ms_drug.sendChemo,
//         dbo.ms_drug.DoseCal,
//         dbo.ms_drug.UnitDoseCal,
//         dbo.ms_drug.CalStatus,
//         dbo.ms_drug.DrugAge,
//         dbo.ms_drug.GeneralChemo,
//         ISNULL(dbo.ms_drug.ChemicalStatus,'N') AS ChemicalStatus,
//         ISNULL(dbo.ms_drug.MasterCTX,0) AS MasterCTX,
//         ISNULL(dbo.ms_drug.PercentCTX,0) AS PercentCTX,
//         dbo.ms_drug.vehicletype
//         From ms_drug
//         sb.Append(condition)
//         WHERE dbo.ms_drug.orderitemcode = 'MRPNI3'

//         Select
//         dbo.ms_orderunit.DispensedTotalUnitCd,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_orderunit.DispensedTotalUnitEN
//         FROM
//         dbo.ms_orderunit
//         WHERE dbo.ms_orderunit.DispensedTotalUnitEN LIKE 'ไวแอล%' OR dbo.ms_orderunit.DispensedTotalUnitTH LIKE '%ไวแอล%'

//         Public Function get_ms_drugindex(ByVal condition As String) As DataTable
//         Select
//         ROW_NUMBER() OVER(ORDER BY dbo.ms_drugindex.drugindexcode ASC) As Row#,
//         dbo.ms_drugindex.drugindexcode,
//         dbo.ms_drugindex.orderitemcode,
//         dbo.ms_drugindex.drugindexname
//         FROM
//         dbo.ms_drugindex
//         where dbo.ms_drugindex.orderitemcode = 'MRPNI3'

//         Public Function get_ms_druginteraction(ByVal condition As String) As DataTable
//         Select
//         ROW_NUMBER() OVER(ORDER BY dbo.ms_druginteraction.DDIcode ASC) As Row#,
//         dbo.ms_druginteraction.DDIcode,
//         dbo.ms_druginteraction.drugnameindex1,
//         dbo.ms_druginteraction.drugnameindex2,
//         dbo.ms_druginteraction.dlevel,
//         dbo.ms_druginteraction.onset,
//         dbo.ms_druginteraction.severity,
//         dbo.ms_druginteraction.document,
//         dbo.ms_druginteraction.adverbs1,
//         dbo.ms_druginteraction.adverbs2,
//         dbo.ms_druginteraction.adverbs3,
//         dbo.ms_druginteraction.memo,
//         dbo.ms_druginteraction.effect_memo,
//         dbo.ms_druginteraction.machanism_memo,
//         dbo.ms_druginteraction.management_memo,
//         dbo.ms_druginteraction.monitoring
//         FROM
//         dbo.ms_druginteraction
//         where dbo.ms_druginteraction.drugnameindex1 LIKE 'meropenem%' OR dbo.ms_druginteraction.drugnameindex2 LIKE 'meropenem%'

//         Public Function show_selectgridview(ByVal condition As String) As DataTable
//         SELECT
//         dbo.ms_drug.instructioncode_ipd,
//         dbo.ms_drug.dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         dbo.ms_drug.dispensedose_opd,
//         dbo.ms_drug.dispensedoseqty_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         dbo.ms_drug.drugusagecodeIPD,
//         dbo.ms_drug.drugusagecodeOPD
//         FROM
//         dbo.ms_drug
//         where dbo.ms_drug.orderitemcode= 'MRPNI3'

//         Public Function get_ms_mapdrugusage(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_mapdrugusage.drugusagecode,
//         dbo.ms_mapdrugusage.drugusagedesc
//         FROM
//         dbo.ms_mapdrugusage
//         Where drugusagecode = '3195'

//         Public Function get_ms_Instruction(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_Instruction.InstructionCd,
//         dbo.ms_Instruction.InstructionNameTH,
//         dbo.ms_Instruction.InstructionNameEN,
//         dbo.ms_Instruction.dose
//         FROM
//         dbo.ms_Instruction
//         WHERE dbo.ms_Instruction.InstructionCd Like 'RF%'

//         Public Function get_ms_dosageunit(ByVal condition As String) As DataTable //หน่วย
//         Select
//         dbo.ms_dosageunit.DispensedUnitCd,
//         dbo.ms_dosageunit.DispensedUnitTH,
//         dbo.ms_dosageunit.DispensedUnitEN
//         FROM
//         dbo.ms_dosageunit
//         WHERE dbo.ms_dosageunit.DispensedUnitCd Like 'GM%'

//         Public Function get_ms_label(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_label.labelcode,
//         dbo.ms_label.orderitemcode,
//         dbo.ms_label.auxiliary1_THIPD,
//         dbo.ms_label.auxiliary2_THIPD,
//         dbo.ms_label.auxiliary1_ENIPD,
//         dbo.ms_label.auxiliary2_ENIPD,
//         dbo.ms_label.auxiliary1_THOPD,
//         dbo.ms_label.auxiliary2_THOPD,
//         dbo.ms_label.auxiliary1_ENOPD,
//         dbo.ms_label.auxiliary2_ENOPD,
//         dbo.ms_label.auxiliary1_THMIX,
//         dbo.ms_label.auxiliary2_THMIX,
//         dbo.ms_label.integration_THIPD,
//         dbo.ms_label.integration_THOPD,
//         dbo.ms_label.integration_ENIPD,
//         dbo.ms_label.integration_ENOPD,
//         dbo.ms_label.integration_THMIX
//         FROM
//         dbo.ms_label
//         where dbo.ms_label.orderitemcode = 'MRPNI3'

//         Public Function get_ms_notify(ByVal condition As String) As DataTable

//         Select
//         ROW_NUMBER() OVER(ORDER BY ms_notify.notifycode ASC) As Row#,
//         ms_notify.notifycode,
//         ms_notify.orderitemcode,
//         ms_notify.notifydetailcode,
//         ms_notifydetail.notifydesc,
//         ms_notify.detail,
//         ms_notify.agestart,
//         ms_notify.ageend,
//         ms_notify.contraindications,
//         ms_notify.statusnotify,
//         ms_notify.statuscontraindications,
//         ms_notify.maxdoseperdose,
//         ms_notify.DispensedUnitCd,
//         ms_dosageunit.DispensedUnitTH,
//         ms_notify.maxdoseperday,
//         ms_notify.maxduration,
//         ms_notify.mintimenextdose
//         FROM
//         dbo.ms_notify
//         INNER JOIN ms_notifydetail ON ms_notifydetail.notifydetailcode = ms_notify.notifydetailcode
//         LEFT JOIN ms_dosageunit ON ms_dosageunit.DispensedUnitCd = ms_notify.DispensedUnitCd
//         where dbo.ms_notify.orderitemcode = 'MRPNI3'

//         Public Function get_ms_drug_generic(ByVal condition As String) As DataTable
//         Select
//         ms_drug_generic.drug_genericcode,
//         ms_drug_generic.genericname,
//         ms_drug_generic.Strength,
//         ms_drug_generic.DispensedUnitCd,
//         isnull(ms_drug_generic.calstatus, 'Y') AS calstatus,
//         ms_drug_generic.perdose,
//         ms_drug_generic.dosageunitcode
//         FROM
//         dbo.ms_drug_generic
//         where dbo.ms_drug_generic.orderitemcode = 'MRPNI3'

//         Public Function get_ms_drug_doctor(ByVal condition As String) As DataTable
//         Select
//         ms_drug_doctor.drug_doctorcode,
//         ms_drug_doctor.orderitemcode,
//         ms_drug_doctor.DoctorCd,
//         ms_doctor.DoctorTH,
//         ms_drug_doctor.status
//         FROM
//         ms_drug_doctor
//         Inner JOIN ms_doctor ON ms_doctor.DoctorCd = ms_drug_doctor.DoctorCd
//             where dbo.ms_drug_doctor.orderitemcode = 'MRPNI3'
//         Order by ms_drug_doctor.status DESC

//         Public Function get_ms_grouplocation(ByVal condition As String) As DataTable
//         Select
//         ROW_NUMBER() OVER(ORDER BY ms_grouplocation.grouplocationcode ASC) As Row# ,
//         ms_grouplocation.grouplocationcode,
//         ms_grouplocation.roomcode,
//         ms_room.roomname,
//         ms_grouplocation.wardcode,
//         ms_ward.warddescfull,
//         ms_grouplocation.locationcode,
//         ms_location.locationname,
//         ms_grouplocation.cabinet,
//         ms_grouplocation.location
//         FROM
//         ms_grouplocation
//         Left JOIN ms_room ON ms_room.roomcode = ms_grouplocation.roomcode
//         Left JOIN ms_location ON ms_location.locationcode = ms_grouplocation.locationcode
//         Left JOIN ms_ward ON ms_ward.wardcode = ms_grouplocation.wardcode
//         Where ms_grouplocation.orderitemcode = 'MRPNI3'

//         Public Function getComponent(ByVal condition As String) As DataTable
//         SELECT
//         dn.drugcode,
//         d.orderitemENname AS drugname,
//         dn.Master,
//         dn.[Percent],
//         d.capacity_unit,
//         dn.SortBy
//         FROM ms_drug_component dn
//         LEFT JOIN ms_drug d ON d.orderitemcode = dn.drugcode
//         WHERE dn.orderitemcode = 'MRPNI3'
//         ORDER BY dn.SortBy ASC

// ////////////////////////////////////////////////////////////////////////////////////// วิธีใช้ IPD
// Public Function show_selectgridview(ByVal condition As String) As DataTable
//         Dim sb As New StringBuilder()
//         sb.Clear()
//         SELECT
//         dbo.ms_drug.instructioncode_ipd,
//         dbo.ms_drug.dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         dbo.ms_drug.dispensedose_opd,
//         dbo.ms_drug.dispensedoseqty_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         dbo.ms_drug.drugusagecodeIPD,
//         dbo.ms_drug.drugusagecodeOPD
//         FROM
//         dbo.ms_drug
//         where dbo.ms_drug.orderitemcode= 'TZCI1'

//         Public Function get_ms_Instruction(ByVal condition As String) As DataTable
//          Select
//          dbo.ms_Instruction.InstructionCd,
//          dbo.ms_Instruction.InstructionNameTH,
//          dbo.ms_Instruction.InstructionNameEN,
//          dbo.ms_Instruction.dose
//          FROM
//          dbo.ms_Instruction
//          WHERE dbo.ms_Instruction.InstructionCd Like 'IVD3H%'

//         Public Function get_ms_dosageunit(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_dosageunit.DispensedUnitCd,
//         dbo.ms_dosageunit.DispensedUnitTH,
//         dbo.ms_dosageunit.DispensedUnitEN
//         FROM
//         dbo.ms_dosageunit
//         WHERE dbo.ms_dosageunit.DispensedUnitCd Like 'GM%'

//         Public Function get_ms_frequency_code(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_frequency_code.frequency_code,
//         dbo.ms_frequency_code.frequency_nameTH,
//         dbo.ms_frequency_code.frequency_nameEN,
//         dbo.ms_frequency_code.qty_per_day,
//         dbo.ms_frequency_code.frequency_count,
//         dbo.ms_frequency_code.lastmodify,
//         dbo.ms_frequency_code.status,
//         dbo.ms_frequency_code.frequency_onlydays,
//         dbo.ms_frequency_code.oddday,
//         dbo.ms_frequency_code.EveryOtherDay,
//         dbo.ms_frequency_code.qty_per_day2
//         FROM
//         dbo.ms_frequency_code
//         WHERE dbo.ms_frequency_code.frequency_code Like 'E8%'

//         Public Function get_ms_time_code(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_time.timecode,
//         dbo.ms_time.timeTH,
//         dbo.ms_time.timeEN,
//         dbo.ms_time.timecount
//         FROM
//         dbo.ms_time
//         WHERE dbo.ms_time.timecode Like 'E8T%' OR dbo.ms_time.timeTH Like 'E8T%' OR dbo.ms_time.timeEN Like 'E8T%'

//         //txtFrequencynameIPD.Text = row(1) ค่าว่าง

//         // Dim result() As DataRow = dttimecode.Select("timecode = '" & txttimecodeIPD.Text & "'")

//         //         For Each row As DataRow In result
//         //             txttimenameIPD.Text = row(1) ว่าง

//         Public Function get_ms_mapdrugusage(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_mapdrugusage.drugusagecode,
//         dbo.ms_mapdrugusage.drugusagedesc
//         FROM
//         dbo.ms_mapdrugusage
//         WHERE dbo.ms_mapdrugusage.drugusagecode Like '1GIVD3HQ8H%' OR dbo.ms_mapdrugusage.drugusagedesc Like '1GIVD3HQ8H%'

// //////////////////////////////////////////////////////////////////////////////////////  OPD
//         Public Function get_ms_Instruction(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_Instruction.InstructionCd,
//         dbo.ms_Instruction.InstructionNameTH,
//         dbo.ms_Instruction.InstructionNameEN,
//         dbo.ms_Instruction.dose
//         FROM
//         dbo.ms_Instruction
//         WHERE dbo.ms_dosageunit.DispensedUnitCd Like 'GM%'

//         Public Function get_ms_dosageunit(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_dosageunit.DispensedUnitCd,
//         dbo.ms_dosageunit.DispensedUnitTH,
//         dbo.ms_dosageunit.DispensedUnitEN
//         FROM
//         dbo.ms_dosageunit
//         WHERE dbo.ms_dosageunit.DispensedUnitCd Like 'GM%'

//         Public Function get_ms_time_code(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_time.timecode,
//         dbo.ms_time.timeTH,
//         dbo.ms_time.timeEN,
//         dbo.ms_time.timecount
//         FROM
//         dbo.ms_time
//         WHERE dbo.ms_time.timecode Like 'E8T%' OR dbo.ms_time.timeTH Like 'E8T%' OR dbo.ms_time.timeEN Like 'E8T%'

//         //////////////////////////////////////////////////search
//         If rdOpen.Checked = True Then
//                     condition = "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'Y' And (dbo.ms_drugindex.drugindexname Like '${text}%' OR dbo.ms_drug.orderitemcode LIKE '${text}%' OR dbo.ms_drug.orderitemTHname LIKE '${text}%' OR dbo.ms_drug.orderitemENname LIKE '${text}%')"
//                 ElseIf rdClose.Checked = True Then
//                     condition = "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'N' And (dbo.ms_drugindex.drugindexname Like '${text}%' OR dbo.ms_drug.orderitemcode LIKE '${text}%' OR dbo.ms_drug.orderitemTHname LIKE '${text}%' OR dbo.ms_drug.orderitemENname LIKE '${text}%')"
//                 Else
//                     condition = "where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And (dbo.ms_drugindex.drugindexname Like '${text}%' OR dbo.ms_drug.orderitemcode LIKE '${text}%' OR dbo.ms_drug.orderitemTHname LIKE '${text}%' OR dbo.ms_drug.orderitemENname LIKE '${text}%')"
//                 End If

//                 where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And dbo.ms_drug.unused = 'Y' And (dbo.ms_drugindex.drugindexname Like 'm%' OR dbo.ms_drug.orderitemcode LIKE 'm%' OR dbo.ms_drug.orderitemTHname LIKE 'm%' OR dbo.ms_drug.orderitemENname LIKE 'm%')

//                 where ISNULL(dbo.ms_drug.medicalsupplies, 0) <> 'Y' And (dbo.ms_drugindex.drugindexname Like '${text}%' OR dbo.ms_drug.orderitemcode LIKE '${text}%' OR dbo.ms_drug.orderitemTHname LIKE '${text}%' OR dbo.ms_drug.orderitemENname LIKE '${text}%')

//     Public Function get_ms_druginteraction(ByVal condition As String) As DataTable
//         Select
//         ROW_NUMBER() OVER(ORDER BY dbo.ms_druginteraction.DDIcode ASC) As Row#,
//         dbo.ms_druginteraction.DDIcode,
//         dbo.ms_druginteraction.drugnameindex1,
//         dbo.ms_druginteraction.drugnameindex2,
//         dbo.ms_druginteraction.dlevel,
//         dbo.ms_druginteraction.onset,
//         dbo.ms_druginteraction.severity,
//         dbo.ms_druginteraction.document,
//         dbo.ms_druginteraction.adverbs1,
//         dbo.ms_druginteraction.adverbs2,
//         dbo.ms_druginteraction.adverbs3,
//         dbo.ms_druginteraction.memo,
//         dbo.ms_druginteraction.effect_memo,
//         dbo.ms_druginteraction.machanism_memo,
//         dbo.ms_druginteraction.management_memo,
//         dbo.ms_druginteraction.monitoring
//         FROM
//         dbo.ms_druginteraction
//         where dbo.ms_druginteraction.drugnameindex1 LIKE 'meropenem%' OR dbo.ms_druginteraction.drugnameindex2 LIKE 'meropenem%'

// ///////////////////////////////////////
//         Public Function show_Search(ByVal condition As String) As DataTable
//         Select
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         ISNULL(dbo.ms_drug.sendmachine,'N') As sendmachine,
//         ISNULL(dbo.ms_drug.sendmix,'N') As sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         convert(float,ISNULL(dbo.ms_drug.dispensedose_ipd,0)) As dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         convert(float,ISNULL(dbo.ms_drug.dispensedose_opd,0)) As dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         convert(float,ISNULL(dbo.ms_drug.cost,0)) As cost,
//         convert(float,ISNULL(dbo.ms_drug.IPDprice,0)) As IPDprice,
//         convert(float,ISNULL(dbo.ms_drug.OPDprice,0)) As OPDprice,
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.diluentstatus,
//         CONVERT(FLOAT,ISNULL( dbo.ms_drug.capacity,0)) AS capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         dbo.ms_drug.priceunittotalstatus,
//         dbo.ms_drug.paystatus,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.edned,
//         ISNULL(dbo.ms_drug.continuestatus,'N') As continuestatus,
//         dbo.ms_drug.DIDcode
//         FROM dbo.ms_drug
//         LEFT JOIN dbo.ms_drugindex ON dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
//         LEFT JOIN dbo.ms_orderunit ON dbo.ms_orderunit.DispensedTotalUnitCd = dbo.ms_drug.orderunitcode
//         " where dbo.ms_drug.unused = 'Y' AND (dbo.ms_drugindex.drugindexname Like 'm%' OR dbo.ms_drug.orderitemTHname LIKE 'm%' OR dbo.ms_drug.orderitemENname LIKE 'm%') OR (dbo.ms_drug.unused = 'Y' AND dbo.ms_drug.orderitemcode LIKE 'm%' AND dbo.ms_drug.searchindex = 'Y')
//         GROUP BY
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
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
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.diluentstatus,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         dbo.ms_drug.priceunittotalstatus,
//         dbo.ms_drug.paystatus,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.edned,
//         dbo.ms_drug.continuestatus,
//         dbo.ms_drug.DIDcode

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
//         dbo.ms_adr.hn = '" & hn & "'
//         ORDER BY
//         dbo.ms_adr.AllergyGroupCd

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
//          WHERE dbo.ms_labresult.hn = 'P1234' And dbo.ms_labresult.lab_name = 'WBC' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 and dbo.ms_labresult.result not like '%-%' And dbo.ms_labresult.date_result >= (SELECT MAX(dbo.ms_labresult.date_result) FROM dbo.ms_labresult WHERE dbo.ms_labresult.hn= 'P1234' And dbo.ms_labresult.lab_name = 'WBC' And DateDiff(Day, dbo.ms_labresult.date_result, GETDATE()) < 7 and dbo.ms_labresult.result not like '%-%'

//         //Showms_druglablevel
//         SELECT
//         dbo.ms_druglablevel.lablevelcode,
//         dbo.ms_druglablevel.labtypecode,
//         dbo.ms_druglabtype.labname,
//         dbo.ms_druglablevel.[level],
//         dbo.ms_druglablevel.leveldesc,
//         dbo.ms_druglablevel.orderitemcode,
//         ISNULL(dbo.ms_druglablevel.levelfrom, 0) As levelfrom,
//         ISNULL(dbo.ms_druglablevel.levelto,0) As levelto,
//         ISNULL(dbo.ms_druglablevel.perdose,0) As perdose,
//         dbo.ms_druglablevel.doseunit,
//         dbo.ms_druglablevel.perfrequency,
//         ISNULL(dbo.ms_druglablevel.perfrequencycount,0) As perfrequencycount,
//         ISNULL(dbo.ms_druglablevel.perday,0) As perday,
//         dbo.ms_druglablevel.perdayunit,
//         dbo.ms_druglablevel.leveldescchild,
//         dbo.ms_druglablevel.target,
//         dbo.ms_frequency_code.frequency_code,
//         ISNULL(dbo.ms_frequency_code.frequency_count,'0') As frequency_count
//         FROM
//         dbo.ms_druglablevel
//         Left Join dbo.ms_frequency_code On dbo.ms_druglablevel.perfrequency = dbo.ms_frequency_code.frequency_code
//         Left Join dbo.ms_druglabtype ON dbo.ms_druglablevel.labtypecode = dbo.ms_druglabtype.labtypecode
//          WHERE dbo.ms_druglablevel.orderitemcode = 'MRPNI3' and dbo.ms_druglablevel.labtypecode='1'

//          //show_Search
//         Select
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         ISNULL(dbo.ms_drug.sendmachine,'N') As sendmachine,
//         ISNULL(dbo.ms_drug.sendmix,'N') As sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         convert(float,ISNULL(dbo.ms_drug.dispensedose_ipd,0)) As dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         convert(float,ISNULL(dbo.ms_drug.dispensedose_opd,0)) As dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         convert(float,ISNULL(dbo.ms_drug.cost,0)) As cost,
//         convert(float,ISNULL(dbo.ms_drug.IPDprice,0)) As IPDprice,
//         convert(float,ISNULL(dbo.ms_drug.OPDprice,0)) As OPDprice,
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.diluentstatus,
//         CONVERT(FLOAT,ISNULL( dbo.ms_drug.capacity,0)) AS capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         dbo.ms_drug.priceunittotalstatus,
//         dbo.ms_drug.paystatus,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.edned,
//         ISNULL(dbo.ms_drug.continuestatus,'N') As continuestatus,
//         dbo.ms_drug.DIDcode,
//         dbo.ms_drug.fontBold
//         FROM dbo.ms_drug
//         LEFT JOIN dbo.ms_drugindex ON dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
//         LEFT JOIN dbo.ms_orderunit ON dbo.ms_orderunit.DispensedTotalUnitCd = dbo.ms_drug.orderunitcode

//         where dbo.ms_drug.unused = 'Y' AND (dbo.ms_drugindex.drugindexname Like 'm%' OR dbo.ms_drug.orderitemTHname LIKE 'm%' OR dbo.ms_drug.orderitemENname LIKE 'm%') OR (dbo.ms_drug.unused = 'Y' AND dbo.ms_drug.orderitemcode LIKE 'm%' AND dbo.ms_drug.searchindex = 'Y')
//         GROUP BY

//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
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
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.diluentstatus,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         dbo.ms_drug.priceunittotalstatus,
//         dbo.ms_drug.paystatus,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.edned,
//         dbo.ms_drug.continuestatus,
//         dbo.ms_drug.DIDcode,
//         dbo.ms_drug.fontBold
