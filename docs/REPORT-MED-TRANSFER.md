# Report > Med Transfer

เส้นทาง `/ipd/reports/med-transfer` ในเมนู Report ของโครง IPD เดิม.
เป็น **รายงานการบรรจุยาเข้ารถเข็น** ตาม `Medtransfer/ucReport.vb` และ Designer,
`Medtransfer/class/clstr_prescription_pharmacy.vb:get_Medcomplete/showPatientwardwait`
และ `Report/Medtransfer/PharmacyReport.rpt` ใน Windows source ที่ผู้ใช้ให้มา.
เป็นคนละหน้ากับงาน Med Transfer `/ipd/med-transfer`.

## ฟอร์มและข้อมูล

- หัวข้อรายงานอยู่กลางฟอร์ม; เลือกวันที่, หอผู้ป่วย และกดค้นหา.
- เริ่มด้วยวันที่ปัจจุบันและหอแรกตามลำดับรหัสตัวเลขเหมือน SelectedIndex=0 ของ Windows.
  อ่านหอทั้งหมดจาก `ms_ward`, รวมที่ยกเลิก/ไม่มีรายการ ไม่กรองห้องยาหรือ active ward.
- เมื่อเข้าหน้าครั้งแรกยังไม่แสดงรายงาน จนกดค้นหาตาม native Load handler.
- อ่าน `packagemaster` เฉพาะวอร์ดที่เลือกและ `medtransferdatetime IS NOT NULL`.
  กรอง **ordercreatedate** ในรอบ 08:00:00–07:59:00 รวมขอบเขต.
- Native ใช้เวลาปัจจุบันตัดสินรอบ: ก่อน 08:00 ให้เริ่มวันก่อนวันที่เลือก;
  ตั้งแต่ 08:00 ให้เริ่มวันที่เลือก แม้เลือกวันย้อนหลัง. เว็บคงเงื่อนไขนี้ไว้.
  ไม่มีข้อความรอบเวลาเพิ่มเติมบนหน้าจอ.
- INNER JOIN `ms_users` ด้วย medtransferuserid, ผู้บรรจุเป็น firstname + lastname
  ของผู้ที่บันทึก ไม่ใช่ผู้ใช้เว็บปัจจุบัน. ค่า concat เป็น NULL แสดงว่างตาม native.
- GROUP BY ใบสั่งยา/ชื่อ/HN/AN/ชื่อวอร์ด/รถเข็น/ชื่อผู้บันทึก และเรียงเลขใบสั่งยาขึ้น.
  ไม่ยุบแถวที่เลขใบสั่งยาเหมือนกันแต่รถหรือผู้บรรจุต่างกัน.
- ไม่เติมตัวกรอง Off/Hold, checkout, จำนวนยา, ประเภทใบสั่งยา หรือห้องยา.
- คอลัมน์ตาม RPT: **No., เลขที่ใบสั่งยา, HN, AN, ชื่อผู้ป่วย, หอผู้ป่วย,
  ผู้บรรจุยา, รถเข็น**. No. นับต่อเนื่องทั้งรายงานตาม RecordNumber.

## ตัวอย่างและ PDF

- ใช้ report viewer ในหน้าเว็บ: หน้าแรก/ก่อนหน้า/ถัดไป/สุดท้าย, ใส่เลขหน้า,
  พอดีหน้า/ความกว้าง และซูม 50–200%. ดาวน์โหลด PDF แทนพิมพ์จริง.
- สร้าง PDF **ครั้งเดียวต่อการค้นหา** แล้วใช้ Blob เดียวกันสำหรับแสดงตัวอย่าง
  และดาวน์โหลด จึงไม่เปลี่ยนข้อมูล/รอบเมื่อกดดาวน์โหลด และไม่มี query เพิ่มเมื่อเปลี่ยนหน้า/ซูม.
- PDF A4 แนวนอน 842x595 pt, ใช้โลโก้/หัวกระดาษจาก ReportHeader ของ RPT เดิม,
  ระยะขอบ/ตำแหน่งคอลัมน์ตาม metadata, หัวตารางซ้ำทุกหน้า,
  วันที่/เวลาสร้างรายงานและเลขหน้าใน footer. ข้อความไทยฝัง Sarabun.
- ข้อความยาวตัดบรรทัดและต่อหน้าเพื่อเก็บข้อมูลครบ ไม่ตัดทิ้งตามความสูงช่องเดิม.
- PDF ว่างยังมีหัวกระดาษและคอลัมน์; เว็บแจ้งไม่พบข้อมูลตามเงื่อนไข.
- ใช้ PDF.js แบบ lazy load เพื่อให้แสดง PDF ได้โดยไม่พึ่ง plug-in ของ browser;
  worker และเอกสารอยู่ในแอป ไม่มีการส่ง PDF ไปบริการภายนอก.
  ตั้ง MIME `.mjs` ของ worker เป็น application/javascript ใน frontend Nginx
  เพื่อรองรับการเสิร์ฟ production; ยังไม่ได้ทดสอบ deploy รอบนี้.
- เปลี่ยนวันที่/วอร์ดซ่อนผลเก่า ยกเลิกคำขอ และคืนหน่วยความจำ Blob/worker/canvas.

## API และการอ่านอย่างเดียว

- GET `/api/reports/med-transfer/wards` ไม่รับตัวกรองเพิ่ม.
- POST `/api/reports/med-transfer/pdf` รับเฉพาะ `{date, wardCode}`.
  ไม่รับชื่อคนไข้/รถ/ผู้บรรจุจาก client; query ด้วย SQL parameters.
- ต้องผ่าน JWT/session IPD เดิม. Response PDF เป็น attachment และ no-store,
  มี X-Report-Pages/X-Report-Rows ให้ viewer ใช้ (expose ผ่าน CORS).
- ไม่มีการบันทึก medtransferdatetime, UPDATE/INSERT/DELETE, เครื่องพิมพ์ หรือ Robot.
  เส้นทางต้นฉบับนี้ใช้ MSSQL ทั้งหมด ไม่มี MySQL query เพิ่ม.
- ทรัพยากรแบบพิมพ์ใน `back/assets/reports/med-transfer/` สร้างจากตารางว่าง;
  ไม่มีข้อมูลผู้ป่วย. Server ไม่ต้องติดตั้ง Crystal/Windows runtime.

## ผลตรวจ 21 ตุลาคม 2026

- Backend ผ่าน **223/223 tests**, รวม Med Transfer report 7 tests.
  Frontend targeted ESLint และ production build ผ่าน.
- ฐานจริงคืนหอผู้ป่วย 177 รายการ และ API PDF ตอบ 200 application/pdf.
  ขณะตรวจไม่พบแถว packagemaster ที่ medtransferdatetime IS NOT NULL ในฐานที่เชื่อมอยู่
  จึงยังไม่มีผลรายงานจริงแบบมีรายการ; ไม่สร้างข้อมูลเพื่อทดสอบ.
- ข้อมูลสมมติ 100 รายการ/5 หน้า รวมชื่อยาวต่อข้ามหน้า:
  ตรวจภาพหน้าแรก/หน้ากลาง, สกัดเลขใบสั่งยาได้ครบ 100 ไม่ซ้ำ,
  ชื่อยาวส่วนท้ายอยู่ครบ, หัวคอลัมน์ทุกหน้า และไม่มีอักษรนอกกระดาษ.
- Browser เปิดผ่านเมนู Report, เลือกหอแรก, กดค้นหา, แสดงหัวรายงาน/โลโก้/8 คอลัมน์
  และสถานะไม่มีข้อมูลพร้อมปุ่ม PDF. ตัวแสดงแบบ canvas ทำงานใน IAB จริง.
- ทำในเครื่อง local ยังไม่ได้ deploy เซิร์ฟเวอร์โรงพยาบาล.
