# ME/DRP แบบอ่าน — ปรับคอลัมน์ 19 ตุลาคม 2026

คงกรอบรายละเอียดผู้ป่วยและหน้า ME/DRP เดิม: เลือกเหตุการณ์ทางซ้าย แท็บ DRP / DUE / Side Effect / ME และกรอบอ่านข้อความเต็มทางขวา ไม่มีการเพิ่ม แก้ไข ลบ บันทึก พิมพ์ หรือสั่งฮาร์ดแวร์

## คอลัมน์และข้อมูล

อ้างอิง Pharmcare/frmDRP.Designer.vb และ frmDRP.vb: ShowDataDRPdetail, ShowDataDUE, showsideeffectdetail, showget_meerror พร้อม clsdrp/clsDRPNote.vb และ clsme.vb

- ซ้ายแสดง OrderNo ตาม dgvOrderDate ไม่เพิ่ม AN/ประเภท/DRP เป็นคอลัมน์ AN และหอของเหตุการณ์ยังอยู่ในกรอบสรุปเดิม ประวัติ HN ครอบคลุมทุก AN เรียง OrderNo ย้อนหลัง
- DRP แสดง **29 คอลัมน์ข้อมูล** เรียงตาม Windows: Date, Time, Process, No, รหัส/DRP, รหัสยา/DrugCause, รหัสยา/DrugDispense, รหัส/เกิด, Severity, รหัส/Preventable, รหัส/Cause, รหัส/ActionTake, รหัส/Acceptance, รหัส/Outcome, UserID1/ผู้เกี่ยวข้อง, UserID2/ผู้รายงาน, Pharmacist Note, Plan
- Date ของ DRP ใช้ yyyy-MM-dd; Process แสดง ProcessCd ตาม Rows.Add ไม่แทนด้วยชื่อ Process; No แสดงค่าที่บันทึก ไม่สร้างลำดับใหม่
- รหัสและคำอธิบายเป็นคนละคอลัมน์ ค่าที่ไม่พบเป็นช่องว่าง ไม่เติมขีดหรือคำอธิบายสมมติ
- Preventable: 0 = ป้องกันได้, 1 = ป้องกันไม่ได้ ค่าอื่นแสดงว่างทั้งรหัสและคำอธิบายตาม Select Case เดิม เก็บรหัสดิบใน response
- ชื่อยาจาก EN ตาม dtDrugPhar.ItemArray(2) ไม่ fallback TH ในหน้า ME/DRP; ผู้เกี่ยวข้อง/ผู้รายงานใช้ fullname และ fallback username เฉพาะ fullname เป็น null ตาม Windows ไม่แทนชื่อที่บันทึกเป็นข้อความว่าง
- ช่องเลือกเพื่อแก้/ลบ, สถานะบันทึก และ DRPItemNo ที่ Windows ซ่อน ไม่แสดงเป็นคอลัมน์ข้อมูลใน viewer
- Side Effect แสดง **SE Date, Side Effect, Grade, Detail & Management, Admin Date** ไม่แสดงคอลัมน์ลบหรือรหัสที่ซ่อน
- DUE ใน Windows เป็นฟอร์ม เว็บคงตาราง/รายละเอียดเดิมและแสดง 18 ช่องครบ: DrugDUE, Doctor, Indication, Empiric, Document, Start, Combine, Interventionl, Dosage, InterventionD, DurationUse, ADR, NScor, Outcome, DrugAmount, Value, DUEPha, DUEform ไม่เติมค่าตั้งต้นของฟอร์มสร้างรายการ
- ME ใน Windows เป็นฟอร์ม เว็บคงตาราง/รายละเอียดเดิมและแสดง 10 ช่องครบ: รหัสข้อมูล, วันที่เกิด Error, User Error, ขั้นตอนที่เกิด Error, ที่ถูกต้อง, ที่ผิด, ประเภทของการเกิด, ชนิดของการเกิด, ระดับความรุนแรง, ผู้บันทึก ใช้ fullname ตาม query เดิม
- DUE/ME เปิดอ่านแถวแรกเมื่อเลือกเหตุการณ์ตาม Windows และยังเลือกอ่านแถวอื่นได้ เพื่อไม่ทิ้งประวัติหลายรายการ ต่างจาก Windows ที่ ShowDataDUE/showget_meerror อ่านเฉพาะแถวแรก
- เก็บศูนย์และข้อความหลายบรรทัดครบ ตารางย่อข้อความยาวพร้อม tooltip อ่านเต็มจากกรอบรายละเอียดเดิม เลื่อนแนวนอนเพื่อดูคอลัมน์ที่เหลือได้
- กรอบข้อมูลเหตุการณ์แสดงค่าที่บันทึกและชื่อ master ตามฟอร์ม รวมเพศจาก ms_drpheader.Sex; ซ่อนรหัส master และ Lastmodified ที่ฟอร์มไม่แสดง ไม่เปลี่ยนข้อมูลผู้ป่วยด้านบนของหน้าหลัก

## ข้อแก้บัคเดิมที่ยังคงไว้

clsme.get_meerror นำ metypeerrorcode ไป join ms_medetail เป็น medetail2 และใช้ ms_me เป็น medetail3 ทำให้ชื่อประเภท/ชนิดสลับแหล่งกับตัวเลือกในฟอร์ม เว็บยังใช้ **ms_me ตาม metypeerrorcode** สำหรับประเภท และ **ms_medetail ตาม metypedetailcode ที่อยู่ในประเภทนั้น** สำหรับชนิด ตาม master ที่ใช้เลือกจริง ไม่คัดลอกการ join ผิดนี้

รหัส Side Effect ที่ Windows เติมวันที่แทนรหัสเป็นคอลัมน์ซ่อน เว็บเก็บ sideeffectcode จริงใน response จึงไม่ได้อ้างว่าข้อความที่ผิดใน Windows จะถูกทำซ้ำทุกช่อง

## แหล่งข้อมูลและ MySQL

ประวัติที่บันทึกของ IPD ใช้ MSSQL: ms_drpheader, ms_drpdetail, ms_due, ms_sideeffecterror, ms_meerror และ master ตามต้นฉบับ โหลดเมื่อเลือกเหตุการณ์/แท็บ การเลือกแถวไม่เรียกฐานข้อมูลเพิ่ม

MySQL get_PharmaCare2 ของ Windows ใช้ค้นข้อมูลผู้ป่วย OPD ห้อง 009 ก่อนเริ่มฟอร์มสร้างรายการและต่อด้วย addms_patient ซึ่งเป็นงานเขียน จึงไม่เรียกใน viewer IPD นี้ ไม่เพิ่มการเชื่อม MySQL ที่ไม่เกี่ยวกับประวัติ โค้ดอ่าน OPD ที่เตรียมในส่วน Medical Reconcile/LAB/Allergy ยังคงเดิมและรอเครือข่ายโรงพยาบาลตาม [ข้อกำหนด MySQL](DATABASE-CONNECTIVITY.md)

Note/Plan ในหน้า ME/DRP เป็นของ ms_drpdetail คนละแหล่งกับหน้าปุ่ม Note ซึ่งอ่าน ms_note การปรับ EN/fullname เฉพาะหน้า ME/DRP ไม่เปลี่ยน fallback ของแท็บสรุป Note DRP เดิม

## API และขอบเขตการอ่าน

- GET /api/ipd/patients/:an/pharmcare/events
- GET /api/ipd/patients/:an/pharmcare/events/:orderNo/:resource โดย resource เป็น drp, due, side-effects, me

คง JWT/current AN/active ward และ HN ที่ backend resolve ตรวจเจ้าของ OrderNo ก่อนอ่านและย้ำใน query ใช้ SQL parameters ไม่รับ HN override ไม่เพิ่ม mutation endpoints และไม่แก้ schema/index ใช้ OUTER APPLY TOP 1 แปล master เพื่อไม่ให้รหัสซ้ำเพิ่มแถว เก็บรายการจริงทุกแถว ไม่ตัดประวัติครั้งก่อน

จำ pcEvent/pcTab/pcItem ใน URL เปลี่ยนเหตุการณ์/แท็บล้างรายละเอียดเก่า และแยก error จากไม่มีรายการ

## ผลตรวจรอบนี้

- Tests backend **142 กรณีผ่าน** รวม auth/scopes/read-only เดิม และกรณีใหม่: ลำดับ 29 คอลัมน์ DRP, ช่องครบทั้ง 4 แท็บ, ISO date, blank/null, ศูนย์, ข้อความหลายบรรทัด และ Preventable 0/1/ค่าอื่น
- Production build และ ESLint ไฟล์ที่แก้ผ่าน
- MSSQL จริง: ตัวอย่าง 1 เหตุการณ์มี DRP 1 แถว, DUE 1 แถว, ME/Side Effect ว่าง อ่านผ่านทุก query และมี Sex ใน header; อีกตัวอย่างพบ ME 1 แถว และ Side Effect 1 แถว อ่าน query ผ่านทั้งสองแหล่ง ไม่ใช่การเปิด Windows เทียบภาพสดทุกช่อง
- สรุป Note DRP เดิมยังอ่านได้ 1 แถวโดยใช้ fallback เดิมแยกจาก viewer
- เวลาอ่านตัวอย่าง: DRP พร้อม header 174 ms, DUE 93 ms, Side Effect 98 ms, ME 102 ms เป็นค่าตัวอย่าง ไม่ใช่ SLA
- Browser fixture สมมติ: DRP 2 แถวครบ 29 ช่อง, DUE 18 ช่อง, Side Effect มี Admin Date, ME 2 แถวครบ Correct/Wrong/ประเภท/ชนิด/ระดับ/ผู้เกี่ยวข้อง/ผู้บันทึก อ่านรายละเอียดและหลายบรรทัดได้
- เปลี่ยนเหตุการณ์แล้ว ME error ไม่ค้างข้อมูลเก่า สลับ DRP ของอีกเหตุการณ์แสดงไม่มีรายการและยอด 0 แยกจาก error ที่ยอดเป็นขีด; กลับเหตุการณ์เดิมอ่าน Note/Plan ได้

ภาพหลักฐานทั้งหมดเป็นข้อมูลสมมติ ไม่มีข้อมูลผู้ป่วยจริงในหลักฐานหน้าจอ
