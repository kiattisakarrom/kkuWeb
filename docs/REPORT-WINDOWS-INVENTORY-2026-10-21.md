# รายการ Report ใน Windows App — ตรวจโค้ด 21 ตุลาคม 2026

ขอบเขต: ไล่เมนู Report จาก frmMain.Designer.vb เทียบ Click handler ใน frmMain.vb และปุ่มเปลี่ยนหน้าภายใน IV Admixture, Sticker ยา, Nurse Station รวมตัวเลือกรายงานย่อยที่ตรวจพบ ไม่เรียกฐานข้อมูล ไม่เปิดรายงานจริง ไม่สั่งพิมพ์ และไม่แก้โค้ดแอป

คำว่า “รายการรายงาน” หมายถึงปลายทางในเมนู ไม่เท่ากับจำนวนฟอร์มที่ไม่ซ้ำ หลายรายงานใช้ฟอร์มเดียวกันและเปลี่ยนโหมดด้วย StatusBT/StatusRoom; ไฟล์ Crystal Reports ที่ไม่มีเส้นทางเปิดจากเมนูนี้ไม่นับเป็นหน้าเพิ่ม

พบ 16 กลุ่มหลัก และ 100 รายการปลายทางในเมนูหลัก รวมรายการที่ตั้งซ่อน 3 รายการ; จำนวนนี้ยังไม่รวมปุ่มเปลี่ยนหน้าภายในและรูปแบบรายงานที่เลือกด้วย radio button

## เมนูและรายงานย่อย

- ADR
  - ADR — ucReportADR (tsADR1)
  - ประวัติ ADR — ucADRHistory (tsADRHis)

- IV Admixture — ucIVmain (tsSendMix)

- Med Transfer — ucReport (tsMedTransfer)

- Nurse Station — ucNurseMain (tsNurse)

- Pharmcare
  - ห้องยา IPD
    - Workload ของ Pharmacist ตาม GrOfCare — ucPGrOfCare (tsWPGrOfCare_IPD)
    - Cover Rate Pharmcare By MedSurg_Acute Care_Month — ucCRByAcute_Care (tsCR_Acute_Care_IPD)
    - Cover Rate Pharmcare By Ward_Counselling_Month — ucCRByAcute_Care (tsCR_Counselling_IPD)
    - NoOfCareDRPfound — ucPharmcareIPD_main (tsNoOfCare)
    - DRPVSIntervention — ucPharmcareIPD_main (tsDRP_Intervention)
    - DRPforInterventionPatientVSAcceptance — ucPharmcareIPD_main (tsDRP_InterventionPa)
    - DRPforInterventionPrescriberVSAcceptance — ucPharmcareIPD_main (tsDRP_InterventionPres)
    - DRPforInterventionVSOutcome — ucPharmcareIPD_main (tsDRP_InterventionOut)
    - DRPforProcessVSOutcomeByWard — ucPharmcareIPD_main (tsDRP_Process)
    - NoOfPatient — ucPharmcareOPD_main (tsNoPatient_IPD)
    - DRPfound — ucPharmcareOPD_main (tsDRPfound_IPD)
    - PreventableDRPfound — ucPharmcareOPD_main (tsPreventableDRPfound_IPD)
    - CauseofDRPfound — ucPharmcareOPD_main (tsCauseofDRPfound_IPD)
    - InterventionLevelofDRPfound — ucPharmcareOPD_main (tsInterventionLevelofDRPfound_IPD)
    - InterventionofDRPfound — ucPharmcareOPD_main (InterventionofDRPfound_IPD)
    - AcceptanceofDRPfound — ucPharmcareOPD_main (tsAcceptanceofDRPfound_IPD)
    - StatusofDRPfound — ucPharmcareOPD_main (tsStatusofDRPfound_IPD)
    - DRPmanifest — ucPharmcareOPD_main (tsDRPmanifest_IPD)
    - Process — ucPharmcareOPD_main (tsProcess_IPD)
    - ClinicalActivity — ucPharmcareOPD_main (tsClinicalActivity_IPD)
  - ห้องยา OPD
    - Workload ของ Pharmacist ตาม GrOfCare — ucPGrOfCare (tsWPGrOfCare_OPD)
    - NoOfPatient — ucPharmcareOPD_main (tsNoPatient)
    - DRPfound — ucPharmcareOPD_main (tsDRPfound)
    - PreventableDRPfound — ucPharmcareOPD_main (tsPreventableDRPfound)
    - CauseofDRPfound — ucPharmcareOPD_main (tsCauseofDRPfound)
    - InterventionLevelofDRPfound — ucPharmcareOPD_main (tsInterventionLevelofDRPfound)
    - InterventionofDRPfound — ucPharmcareOPD_main (tsInterventionofDRPfound)
    - AcceptanceofDRPfound — ucPharmcareOPD_main (tsAcceptanceofDRPfound)
    - StatusofDRPfound — ucPharmcareOPD_main (tsStatusofDRPfound)
    - DRPmanifest — ucPharmcareOPD_main (tsDRPmanifest)
    - Process — ucPharmcareOPD_main (tsProcess)
    - ClinicalActivity — ucPharmcareOPD_main (tsClinicalActivity)
  - รายงานสรุปการทำ Pharmcare — ucPharmSummary (tsPharmcareSummary)

- Sticker ยา — ucStickerMain (tsStickerDrug)

- Workload — ucWorkload (tsWorkload)

- ใบเบิก
  - ห้องยา IPD — ucUD (ผ่าน ButtonColor และ StatusBT) (tsIPD)
  - ห้องยา D/C — ucUD (ผ่าน ButtonColor และ StatusBT) (tsDC)
  - ห้องยา ER — ucUD (ผ่าน ButtonColor และ StatusBT) (tsER_IPD)
  - ห้องยา ER (OPD) **[ซ่อนใน Designer]** — ucUD (ผ่าน ButtonColor และ StatusBT) (tsER_OPD)
  - ห้องเตรียมยาอาคารเภสัชกรรม — ucUD (ผ่าน ButtonColor และ StatusBT) (tsIV)
  - ห้องยาเสพติดและ Fixed Stock — ucUD (ผ่าน ButtonColor และ StatusBT) (tsRAddict)
  - ห้องยาเตรียมอาคารรังสี — ucUD (ผ่าน ButtonColor และ StatusBT) (tsIVRAD)
  - ห้องยา OPD อาคารรังสี — ucUD (ผ่าน ButtonColor และ StatusBT) (tsOPDRAD)
  - ห้องยา OPD1 ชั้น 1 — ucUD (ผ่าน ButtonColor และ StatusBT) (tsOPD11)
  - ห้องยา OPD1 ชั้น 2 — ucUD (ผ่าน ButtonColor และ StatusBT) (tsOPD12)
  - ห้องยา IPD UD รังสี — ucUD (ผ่าน ButtonColor และ StatusBT) (tsIPDUD)
  - ห้องยา OPD2 ชั้น 2 — ucUD (ผ่าน ButtonColor และ StatusBT) (tsOPD22)
  - ห้องยา OPD หัวใจ — ucUD (ผ่าน ButtonColor และ StatusBT) (tsOPDH)
  - รพ.ขอนแก่น2 — ucUD (ผ่าน ButtonColor และ StatusBT) (ts_KK2)

- การใช้ยาของผู้ป่วย
  - การใช้ยาของผู้ป่วยใน — ucDgvIPDDrugUse (tsIPDDrugUse)
  - การจ่ายยาแยกแต่ละรายการ — ucOrderDrugUse (tsOrderDrugUse)
  - การจ่ายยาแยกตามสิทธิ์ — ucOrderRight (tsOrderRight)
  - มูลค่าการจ่ายยา — ucOrderCost (tsOrderCost)
  - มูลค่าการจ่ายยา (ยาราคาแพง) — ucOrderCostly (tsOrderCostly)
  - มูลค่าการจ่ายยาแยกตามหอผู้ป่วย — ucOrderCostByWard (tsOrderCostByWard)
  - จำนวนใบสั่งยาและขนานยา
    - รวม — ucOrderCpres (tsSummaryPres)
    - รายชั่วโมง — ucOrderHCpres (tsHCpres)

- รายการยา HAD,TDM,LAB และเคมีบำบัด
  - ยา HAD — ucPatientByWard (tsHAD)
  - ยา TDM — ucPatientByWard (tsTDM)
  - ยาเคมีบำบัด — ucPatientByWard (tsChem)
  - ผล LAB — ucPatientByWard (tsLab)

- การเฝ้าระวังการใช้ยา
  - การทำ Medreconcile
    - คิดเป็นต่อคน — ucSurveillanceMain (tsPerMR)
    - การทำ Medreconcile ตาม ICD-10 — ucSurveillanceMain (tsMR_ICD10)
    - จำนวน Pt. ตาม ICD-10 — ucSurveillanceMain (tsPtICD10)
  - การเฝ้าระวัง Drug Interaction
    - คิดเป็นต่อคน,ต่อครั้ง — ucSurveillanceMain (tsPerDI)
    - คู่ยา — ucSurveillanceMain (tsGroupDI)
    - Ward + คู่ยา — ucSurveillanceMain (tsSumDI)
  - การเฝ้าระวังการเกิด ADR ซ้ำ
    - คิดเป็นต่อคน,ต่อครั้ง — ucSurveillanceMain (tsPerADR)
    - สรุป — ucSurveillanceMain (tsSumADR)

- รายงานหน่วยผลิต
  - IV
    - รายงานปริมาณการใช้ยา, ค่ายา — ucReportUseMedicinectx (tsUseMedicinectx)
    - รายงานจำนวนครั้งการให้ยา แยกตามขนาดยา — ucReportUseMedicinectxBydosage (tsUseMedicinectxbydose)
    - รายงานปริมาณการให้ยา แยกตาม Ward — ucReportUseMedicinectxByWard (tsUseMedicinectxbyward)
    - ทะเบียนรายชื่อผู้ป่วย — ucReportUseMedicineBypatient (tspatientctx)
    - Workload — ucWorkload (tsWorkloadIV)
  - Chemo
    - รายงานสรุปยาผลมยาฉีดที่ให้ทางหลอดเลือดดำ **[ซ่อนใน Designer]** — ucReport (btnsumdrugchemo)
    - รายงานสรุปน้ำเกลือที่ผสมยาฉีด **[ซ่อนใน Designer]** — ucsumdrugusechemo (btnsumdrugdiluentchemo)
    - รายงานทะเบียนผู้ป่วยแยกตามห้องตรวจ/หอผู้ป่วย — ucReportPatientchemoByWard (tsPatientchemobyward)
    - รายงานทะเบียนยาแยกตามห้องตรวจ/หอผู้ป่วย — ucReportUseMedicinechemoByWard (tsUseMedicinechemobyward)
    - การจ่ายยาแยกแต่ละรายการ — ucOrderDrugUseChemo (การจายยาแยกแตละรายการToolStripMenuItem)
    - รายงานปริมาณการใช้ยา, ค่ายา — ucReportUseMedicinechemo (ToolStripMenuItem1)
    - รายงานจำนวนครั้งการให้ยา แยกตามขนาดยา — ucReportUseMedicinectxBydosagechemo (ToolStripMenuItem2)
    - รายงาน Time In-Out (เวลาเฉลี่ย) — ucReportTimeInOut (tsTimeInOut)
    - Workload — ucReportTimeInOut (tsWorkloadChemo)
    - Waiting Time — ucReportTimeInOut (tsWaitingTime)
    - CheckOut Time — ucReportCheckOutTime (tsCheckOutTime)
  - TPN
    - รายงานการเตรียม IV แยกตามขนาด — ucReportReplacementSolution (tsReplacementSolutionIVByStrength)
    - รายงานการเตรียม IV แยกตาม Ward — ucReportReplacementSolution (tsReplacementSolutionIVByWard)
    - รายงานการเตรียม TPN — ucReportReplacementSolution (tsReplacementSolutionTPN)
    - รายงานการเตรียม TPN แยกตามจำนวนคน/จ่าย — ucReportReplacementSolution (tsReplacementSolutionTPNByDisp)
    - Workload + เวลาเฉลี่ย — ucReportCheckTimeInOut (tsWorkloadTimeInOut)
    - รายชื่อผู้ที่ใช้ TPN แยกตาม Ward — ucReportSumUseMedicineTPN (tsSumUseMedicineTPN)

- แบบบันทึกการเตรียมยา — ucRPrepareGProduction (tsRPrepareGProduction)

- การคืนยา — ucRDrugReturn (tsReturnDrug)

- ยาเสพติดและวัตถุออกฤทธิ์ต่อจิตประสาท — ucRAddict (tsAddict)

- มูลค่ายาคงคลัง — ucRRemainStock (tsRemainStock)

## หน้าย่อยภายในกลุ่ม

### IV Admixture

- รวมหอผู้ป่วย — ucReportSendmixTotal
- ส่งรวมหอผู้ป่วยแล้ว — ucReportSendmaxTotalComp
- ส่งหอผู้ป่วยแล้ว — ucReportSendmixComp
- แยกหอผู้ป่วย — ucReportSendmix

### Sticker ยา

- ใบเซ็นต์รับยา — ucReportMedDocSign
- Sticker ยารวม — ucReportMedDocTotal
- Sticker ยากลับบ้าน — ucReportMedDocHome
- Sticker ยา ส่งแล้ว — ucReportMedDocComp
- Sticker ยา — ucReportMedDoc

### Nurse Station

- Scan ใบสั่งยา — ucScanOrder **[ซ่อน]**
- TEST MARs — ucEMedicationsNew **[ซ่อน]**
- Form A4 MARs — ucMARsForm
- Setting Printer — ucSettingPrinter
- MARs สำหรับรถเข็น — ucMedicationRecord
- MARs New Label Success — ucNurseLabelSucc, ucSettingPrinter
- MARs All Label — ucNurseAllLabel, ucSettingPrinter
- Foot Note — ucFootnote, ucSettingPrinter
- A4 MARs — ucEMedicationsNew
- MARs New Label — ucNurse, ucSettingPrinter

### ตัวเลือกรูปแบบรายงานในหน้าเดียว

- แบบบันทึกการเตรียมยา: แยกหน่วย / รวมหน่วย
- การคืนยา: มูลค่ายาคืนที่ใช้ต่อ / เหตุผลการคืนยา / รายการคืนยาแยก Ward
- ยาเสพติดและวัตถุออกฤทธิ์ต่อจิตประสาท: การเบิกยาเสพติดและวัตถุออกฤทธิ์ต่อจิตประสาท / สรุปเบิกคลังยา
- มูลค่ายาคงคลัง: แบบแยกรายการยา / แบบรวม
- รายงานสรุปการทำ Pharmcare: เลือก IPD / OPD
- Report > Med Transfer: รายงานการบรรจุยาเข้ารถเข็น แยกจากหน้า Med Transfer ที่ใช้ทำงาน
- Workload: กลุ่มหลักใช้โหมด workloadIPD; เมนูรายงานหน่วยผลิต > IV > Workload ใช้โหมด workloadIV

## ข้อสังเกตสำหรับเว็บปัจจุบัน

- อัปเดตหลังเริ่มพัฒนา: Report > ADR เปิดหน้า ADR และประวัติ ADR ได้แล้ว พร้อมดาวน์โหลด PDF ดู [รายละเอียดที่ทำแล้ว](REPORT-ADR.md)
- Report > IV Admixture เปิดได้ครบ 4 หน้าย่อย พร้อมตัวเลือก IV/ยาเตรียมเฉพาะราย และ PDF แบบดูข้อมูลเท่านั้น ดู [รายละเอียดที่ทำแล้ว](REPORT-IV-ADMIXTURE.md)
- Report > Med Transfer เปิดรายงานการบรรจุยาเข้ารถเข็น เลือกวัน/วอร์ด และแสดง/ดาวน์โหลด PDF ตาม RPT เดิมแล้ว ดู [รายละเอียดที่ทำแล้ว](REPORT-MED-TRANSFER.md)
- Report > Pharmcare > รายงานสรุปการทำ Pharmcare เปิดเลือกช่วงวันที่/IPD/OPD ดูตารางครบ 43 คอลัมน์ และ Export PDF/Excel (.xlsx) ได้แล้ว ดู [รายละเอียดที่ทำแล้ว](REPORT-PHARMCARE-SUMMARY.md) หน้าย่อยอื่นใน Pharmcare ยังไม่ได้พัฒนา
- Report > Workload เปิดฟอร์มช่วงวันที่/เลือกผู้ใช้งาน ดู CrossTab และดาวน์โหลด PDF พร้อมโลโก้เดิมได้แล้ว ยอดรวมจากฐานปัจจุบันและ BACKUP เทียบ SQL กับ Windows แล้วตรงกัน ดู [รายละเอียดที่ทำแล้ว](REPORT-WORKLOAD.md)
- Report > ใบเบิก > ห้องยา IPD เปิดเลือกช่วงวันที่/ประเภทใบเบิกได้ครบ 4 แบบ พร้อม PDF โลโก้และช่องลงชื่อเดิม เทียบ SQL กับ Windows แล้วตรงกัน ดู [รายละเอียดที่ทำแล้ว](REPORT-REQUISITION-IPD.md)
- Report > ใบเบิก > ห้องยา D/C เปิดฟอร์มเดียวกับ Windows ครบ 4 แบบ ใช้รายการยากลับบ้านที่พิมพ์แล้วจากห้องยา 001/005 พร้อม PDF เลข DC และโลโก้/ช่องลงชื่อเดิม เทียบ SQL ครบทั้ง 4 แบบแล้วตรงกัน ดู [รายละเอียดที่ทำแล้ว](REPORT-REQUISITION-DC.md)
- Report > ใบเบิก > ห้องยา ER มีฟอร์มครบ 4 แบบ แปลงรหัส/รวมยอดตาม ER() และ PDF หลักพร้อมรายการแจ้งรหัสยาที่ไม่มีใน Unitdose แล้ว เทียบ SQL เฉพาะฝั่ง MSSQL ผ่าน ส่วน MySQL OPD เขียนเตรียมไว้โดยยังไม่เชื่อมตรวจจริง และระบุว่ายอดยังไม่ครบทั้งบนเว็บ/PDF ดู [รายละเอียดที่ทำแล้วและสถานะ MySQL](REPORT-REQUISITION-ER.md)
- Report > ใบเบิก > ห้องยา ER (OPD) **นำออกจากเว็บและ API แล้วตามคำขอผู้ใช้ 23 ต.ค.** ลิงก์เดิมกลับ IPD ส่วนเมนูในรายการ Windows ด้านบนยังเก็บเป็นข้อมูลอ้างอิงต้นฉบับ ดู [ประวัติ](REPORT-REQUISITION-ER-OPD.md)
- Report > ใบเบิก > ห้องเตรียมยาอาคารเภสัชกรรม มีฟอร์ม 4 แบบ/คอลัมน์/PDF ชื่อห้องและเลข IV ตาม native IV() แล้ว ใช้ MSSQL prescription ที่ IVStatus IS NOT NULL เทียบ SQL ทุกแถวทั้ง 4 ประเภทตรงกัน ไม่มีส่วน MySQL ดู [รายละเอียดที่ทำแล้ว](REPORT-REQUISITION-IV.md)
- Report > ใบเบิก > ห้องยาเสพติดและ Fixed Stock มีฟอร์ม 4 แบบ/คอลัมน์/PDF ชื่อห้อง “ห้องจ่ายยาเสพติด และ Fixed Stock” และเลข AD ตาม btnAddict แล้ว ใช้ MSSQL ห้องยา 018 เทียบ SQL กับ native ตรงกันทั้ง 4 แบบ รวมข้อมูลจริงชั้น 4 จำนวน 2 รายการในวันที่ 2026-10-23 และ PDF หลายหน้าจำลอง ไม่มีส่วน MySQL ดู [รายละเอียดและผลตรวจ](REPORT-REQUISITION-FIXED-STOCK.md) ห้องยาอื่นในกลุ่มใบเบิกยังไม่ได้พัฒนา
- Report > ใบเบิก > ห้องยาเตรียมอาคารรังสี มีฟอร์ม 4 แบบ/คอลัมน์/PDF ชื่อห้องและเลข IVRAD ตาม btnIVRAD แล้ว ใช้ MSSQL prescriptiondetail ห้องยา 006 เทียบ SQL ทุกฟิลด์ตรงกับ Windows ทั้ง 4 ประเภท รวมข้อมูลจริงชั้น 4 จำนวน 7 รายการวันที่ 2026-10-23 ไม่มีส่วน MySQL ดู [รายละเอียดและผลตรวจ](REPORT-REQUISITION-IVRAD.md) ห้องยาอื่นในกลุ่มใบเบิกยังไม่ได้พัฒนา
- Report > ใบเบิก > ห้องยา OPD อาคารรังสี มีฟอร์ม 4 แบบ/คอลัมน์/PDF เลข OPDRAD พร้อมรายการรหัสยาที่ขาดตาม native OPD() แล้ว เตรียม MySQL location OPD42 โดยไม่เชื่อมตรวจจริง รองรับช่วงเดือน/หลายเดือนด้วย aggregate หนึ่งคำสั่งและแปลงข้อมูลแบบชุด ดู [รายละเอียด/สถานะข้อมูลและผลตรวจ](REPORT-REQUISITION-OPDRAD.md)
- front/src/header/IpdHeader.jsx มี Report 14 ชื่อระดับบน ปัจจุบัน ADR, IV Admixture, Med Transfer, Pharmcare (เฉพาะรายงานสรุป), Workload และ ใบเบิก (ห้องยา IPD, D/C, ER, ห้องเตรียมยาอาคารเภสัชกรรม, ห้องยาเสพติดและ Fixed Stock, ห้องยาเตรียมอาคารรังสี และห้องยา OPD อาคารรังสี) มี path แล้ว กลุ่มรายงานอื่นยังไม่มีเส้นทางเปิดหน้ารายงาน
- ยังขาดชื่อระดับบน ยาเสพติดและวัตถุออกฤทธิ์ต่อจิตประสาท และ มูลค่ายาคงคลัง
- มีชื่อไม่ตรง Windows: การใช้งานของผู้ป่วย → การใช้ยาของผู้ป่วย; ขายยานอก HAD,TDM,LAB และเคมีบำบัด → รายการยา HAD,TDM,LAB และเคมีบำบัด; การป้องกันการใช้ยา → การเฝ้าระวังการใช้ยา; ขายส่งและผลิต → รายงานหน่วยผลิต
- front/src/App.jsx เปิด ADR, ประวัติ ADR, IV Admixture, Report Med Transfer, รายงานสรุปการทำ Pharmcare, Workload และใบเบิกห้องยา IPD/D/C/ER/ห้องเตรียมยาอาคารเภสัชกรรม/ห้องยาเสพติดและ Fixed Stock/ห้องยาเตรียมอาคารรังสี/ห้องยา OPD อาคารรังสี ผ่าน session เดิมแล้ว การมีชื่อกลุ่มอื่นในหัวเว็บยังไม่ถือว่าหน้ารายงานนั้นพร้อมใช้

## ข้อจำกัดของผลตรวจ

- เป็นการยืนยันรายการเมนู ปุ่มเปลี่ยนหน้า และการผูก handler จากซอร์ส ไม่ยืนยันว่าทุก query หรือไฟล์ Crystal Report ทำงานได้จริง
- เมนูซ่อนระบุจาก Visible=False ใน Designer ไม่ใช่การตรวจสิทธิ์ของผู้ใช้ทุกตำแหน่งขณะรัน
- ยังไม่ได้ไล่ popup ทุกตัวในแต่ละฟอร์ม หรือทดสอบข้อมูลจริงรายงานทั้งหมด
- Nurse Station มีทั้งหน้าดูข้อมูลและหน้าที่เกี่ยวกับเครื่องพิมพ์ หากทำเว็บแบบดูข้อมูลต้องแยกขอบเขตนี้ออกเมื่อพัฒนา

แหล่งอ้างอิงหลัก: [เมนู Report](<C:/Users/fAm NoteBook/Desktop/Unidose hospital/Interface_ver852_scan_checkout_4-7-2026/Interface/frmMain.Designer.vb:610>) และ [โค้ดเปิดรายงาน](<C:/Users/fAm NoteBook/Desktop/Unidose hospital/Interface_ver852_scan_checkout_4-7-2026/Interface/frmMain.vb:679>)
