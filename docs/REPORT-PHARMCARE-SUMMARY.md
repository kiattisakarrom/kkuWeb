# Report > Pharmcare > รายงานสรุปการทำ Pharmcare

ตรวจและพัฒนาเมื่อ 2026-10-21 เปิดที่ `/ipd/reports/pharmcare-summary` ผ่าน session เดิม เป็นรายงานดูข้อมูลเท่านั้น

## ต้นฉบับ Windows

อ้างอิง `ctx/Pharmcare/ucPharmSummary.vb`, `ucPharmSummary.Designer.vb`, `ctx/class/clsPharmcares.vb:Get_PharmcareSummary` และ master caches ที่โหลดใน `frmMain.vb` ของโปรเจกต์ `Interface_ver852_scan_checkout_4-7-2026/Interface`

- แผงซ้ายเลือกวันที่เริ่ม/สิ้นสุด ค่าเริ่มต้นวันนี้ทั้งคู่ เลือก IPD เป็นค่าเริ่มต้น หรือ OPD แล้วกด OK จึงโหลดข้อมูล
- ปุ่ม OK และ Export อยู่ข้างกัน ตารางด้านขวาแสดงจำนวนรายการ เลือกแถว เลื่อนแนวนอน/แนวตั้ง และเรียงตามหัวคอลัมน์ได้
- ไม่พบข้อมูลแสดงหน้าต่าง “ระบบแจ้งเตือน / ไม่พบข้อมูล”
- ต้นฉบับ Export เป็น Excel ผ่าน ClosedXML ไม่มี Crystal Report หรือโลโก้สำหรับหน้านี้ เว็บมีปุ่ม Export (PDF) และ Export Excel (.xlsx) แยกกัน

## ตารางและแหล่งข้อมูล

เก็บ 43 คอลัมน์ ชื่อ ลำดับ และความกว้างตาม Designer ใน `back/assets/reports/pharmcare-summary/columns.json` และ schema ฝั่งหน้าเว็บ ชื่อซ้ำ เช่น DRP, รหัส, รหัสยา ยังคงไว้โดยแยก key ภายใน

ลำดับ: วันที่, HN, AN, ชื่อผู้ป่วย, เพศ, Admit, รหัส, หอผู้ป่วย, NewCase, CriteriaOfCare, GroupOfCare, GroupOfPt, DRP, การจำหน่าย, LOS, D/C, F/U, ClinicalOutcome, Pharmacist, หน่วยงาน, Time, Process, No, DRP, รหัสยา, Drug Cause, รหัสยา, Drug Dispense, Severity, ปัญหาที่เกิด, Preventable, รหัส, Cause, รหัส, ActionTake, รหัส, Acceptance, รหัส, Outcome, ผู้เกี่ยวข้อง, ผู้รายงาน, Pharmacist Note, Plan

- ทั้ง IPD และ OPD ของรายงานนี้ใช้ MSSQL: `ms_drpdetail INNER JOIN ms_drpheader ON OrderNo` และ `LEFT JOIN ms_patient ON header.HN=patient.hn` ชื่อผู้ป่วยจาก `patientnameTH`
- เงื่อนไข `TypeOfPt` และ `detail.OrderCreatedate BETWEEN from AND to` ตรงต้นฉบับ ไม่เพิ่มเงื่อนไขห้องยา/วอร์ด/การ Admit ปัจจุบัน ไม่รวมกลุ่มหรือตัดรายการซ้ำ
- ตรวจ metadata จริงแล้ว `OrderCreatedate` เป็นชนิด `date` จึงรวมวันสิ้นสุดครบ เรียงวันที่สร้างจากน้อยไปมาก วันที่แสดงเป็น yyyy-MM-dd และ null เป็นช่องว่าง
- แปลงชื่อจาก master 17 จุดใน SQL เดียวด้วย OUTER APPLY TOP 1 เพื่อไม่เพิ่มจำนวนแถวเมื่อ master มีรหัสซ้ำ: วอร์ด, CriteriaOfCare, GroupOfCare, GroupOfPt, ClinicalOutcome, ผู้บันทึกหัวรายการ, หน่วยงาน, ปัญหา DRP, ยาสาเหตุ, ยาที่จ่าย, ปัญหาที่เกิด, Cause, ActionTake, Acceptance, Outcome, ผู้เกี่ยวข้อง, ผู้รายงาน
- รักษาขอบเขต master caches ของ Windows: ผู้ใช้ไม่รวม `0201`, หน่วยงานไม่รวม `000`, ยาเฉพาะ `ISNULL(GeneralChemo,'N')='N'` และใช้ `orderitemENname` ไม่เติมชื่อไทยหรือรหัสเมื่อไม่มีชื่อ
- ค่า Sex, NewCase, DRP, Encashment, LOS, Time, Process, No, Severity และ Preventable คงค่าที่ต้นฉบับแสดง ไม่แปลรหัสเพิ่มเติม
- ไม่มีคำสั่งแก้ไขฐานข้อมูล ไม่มี MySQL หรือการสั่งฮาร์ดแวร์ในรายงานนี้

## ความเร็วและ PDF

- เรียก API หนึ่งครั้งต่อการค้นหา ไม่โหลดอัตโนมัติเมื่อเปลี่ยนตัวกรอง และยกเลิกคำขอเก่าเพื่อไม่ให้ผลเก่าทับตัวกรองใหม่
- ตารางเก็บข้อมูลครบ แต่แสดง DOM เฉพาะแถวใกล้หน้าจอเพื่อลดภาระเมื่อมีหลายพันแถว การเรียงและ Export ใช้ข้อมูลทั้งหมด ไม่ใช่เฉพาะแถวที่เห็น
- PDF ขนาด A3 แนวนอน ฝังฟอนต์ Sarabun แบ่งคอลัมน์เป็น 5 ส่วน ครบ 43 คอลัมน์ แต่ละส่วนซ้ำวันที่/HN/AN/ชื่อผู้ป่วยและเลขแถวเพื่อเชื่อมข้อมูลข้ามส่วน ข้อความยาวขึ้นบรรทัด/ข้ามหน้าได้ พร้อมหัวตารางซ้ำและเลขหน้า
- Export อ่านข้อมูลใหม่จากฐานตามตัวกรองเดิม รับเฉพาะตัวกรองและการเรียง ไม่รับเซลล์ข้อมูลจาก client ใช้ snapshot ตรวจการเปลี่ยนข้อมูลครบทุกเซลล์รวมแถวซ้ำ หากเปลี่ยนจะตอบ 409 ให้ค้นหาใหม่ก่อน Export
- API ต้องมี session เช่นรายงานอื่น และกำหนด no-store

## Export Excel

- ปุ่ม Export Excel (.xlsx) เพิ่มใต้ปุ่ม OK/PDF ใช้ `/api/reports/pharmcare-summary/xlsx` พร้อมการตรวจ session, ตัวกรอง, snapshot และลำดับเดียวกับ PDF
- ส่งออกทุกแถวครบ 43 คอลัมน์ลง worksheet/table ชื่อ `Pharmcare` ตาม Windows ไม่จำกัดเฉพาะแถวที่ render หรือแถวที่เลือก
- ใช้ชื่อ `DataGridViewColumn.Name` ตาม native Export ซึ่งต่างจากชื่อที่แสดงบนหัวตารางบางคอลัมน์ เช่น `DC`, `FU`, `Problem`, `รหัสยา1`, `DrugCause`, `CauseCd`, `PharmacistNote` เก็บใน `excel-headers.json` โดยลำดับเดิม
- ค่าทุกเซลล์เป็นข้อความตาม DataTable ต้นฉบับ จึงเก็บศูนย์นำหน้าของ HN/AN ค่าว่าง ศูนย์ และข้อความภาษาไทยหลายบรรทัด รวมถึงข้อความที่ขึ้นต้นด้วย `=` โดยไม่เปลี่ยนเป็นสูตร
- ใช้ ExcelJS สร้าง XLSX จริง พร้อมหัวตารางกรองได้ ตรึงแถวแรก และความกว้างที่อ่านได้ ไม่มีการเขียนไฟล์ลง server หรือแก้ข้อมูลฐาน
- ทดสอบเพิ่มเป็น 232/232 ข้อ: เปิด workbook กลับมาตรวจครบ 70 แถว x 43 คอลัมน์และชนิดข้อมูล ทดสอบ API auth/invalid payload/stale/empty/sort และ PDF เดิมผ่าน พร้อม frontend lint/build ผ่าน
- ทดสอบกดปุ่มดาวน์โหลดจริงวันที่ 2026-10-21 ได้ `Pharmcare-Summary.xlsx` ใน Downloads เปิดตรวจแล้วมี 52 รายการ 43 คอลัมน์ หัวคอลัมน์ตรงต้นฉบับและค่าเป็นข้อความ

## ผลตรวจ

- Backend regression ผ่าน 231/231 ข้อ รวม 8 ข้อของรายงานนี้ ครอบคลุม schema, native SQL/master restrictions, ค่าว่าง/ศูนย์/แถวซ้ำ, sorting/snapshot, auth/validation, stale/empty export และโครง PDF 5 ส่วน
- ESLint ไฟล์หน้าเว็บที่เปลี่ยนและ production build ผ่าน
- ลองข้อมูล MSSQL จริงช่วง 2026-10-01 ถึง 2026-10-21: IPD 1,092 แถว ใช้เวลาประมาณ 901 ms; OPD 46 แถว ประมาณ 195 ms ทั้งคู่มี 43 ฟิลด์ และ Export ตอบ 200 application/pdf (เวลานี้เป็นผลทดลองครั้งเดียว ไม่ใช่ SLA)
- ทดสอบ browser ผ่านเมนู Report > Pharmcare: ค่าเริ่มต้น IPD/วันที่วันนี้ ไม่โหลดก่อน OK; IPD แสดง 1,092 รายการแต่ DOM ประมาณ 36 แถวพร้อมเลื่อน; เรียง HN ได้; สลับ OPD ล้างผลเก่าและปิด Export จนค้นหาใหม่ จากนั้นได้ 46 รายการ; วันไม่มีข้อมูลแสดง modal ถูกต้อง
- PDF ข้อมูลจำลอง 2 แถวมี 5 หน้า ตรวจภาพหน้าแรก/ท้ายแล้ว; ชุดจำลอง 60 แถวมี 15 หน้า ตรวจครบ 2,340 markers ของคอลัมน์ไม่ซ้ำ ข้อความท้าย Note/Plan อยู่ครบ และไม่มีตัวอักษรนอกขอบกระดาษ
- PDF ข้อมูลจริงตรวจในหน่วยความจำเท่านั้น ตัวอย่างที่เก็บเพื่อให้ดูเป็นข้อมูลจำลอง ภาพหน้าจอที่เก็บไม่มีข้อมูลผู้ป่วย

การเปลี่ยนแปลงอยู่ในเครื่อง ยังไม่ได้ commit หรือ deploy รายงาน Pharmcare หน้าย่อยอื่นยังอยู่นอกขอบเขตงานนี้
