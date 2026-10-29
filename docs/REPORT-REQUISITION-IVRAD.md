# Report > ใบเบิก > ห้องยาเตรียมอาคารรังสี

พัฒนา 23 ตุลาคม 2026 เปิดที่ `/ipd/reports/requisition-ivrad` ผ่าน session เดิม ดูข้อมูลและดาวน์โหลด PDF เท่านั้น ไม่สร้างใบเบิกหรือตัดสต็อก

## เทียบ Windows

- ชื่อ/ลำดับเมนูตาม `frmMain.Designer.vb:tsIVRAD` วางหลังห้องยาเสพติดและ Fixed Stock
- `frmMain.vb:tsIVRAD_Click` กำหนด StatusBT=`btnIVRAD` แล้ว `ucUD.btnOK_Click` เรียก **IPD()** ใช้ `ucUD.Designer` และ `Report/Sendmix/crpRequisitionNew.rpt`
- วันที่เริ่ม/สิ้นสุดเป็นวันนี้ ตัวเลือกครบ 4 แบบ ค่าเริ่มต้นส่งใบเบิกชั้น 4 กด OK จึงโหลด เปลี่ยนเงื่อนไขซ่อนผลเก่าและยกเลิกคำขอ ไม่โหลดอัตโนมัติ

## ข้อมูล

หน้านี้ใช้ **MSSQL เท่านั้น** ตาม `clsRequisition.getUsageDrug` ไม่มีส่วน MySQL จึงไม่เพิ่มการเชื่อมต่อหรือค่า MySQL ใหม่ และไม่ได้ตรวจข้อมูล MySQL

- `prescriptiondetail pt LEFT JOIN ms_drug mdr` โดย `departmentcode='006'` ตาม btnIVRAD ไม่ใช้ตาราง prescription ของรายงานอาคารเภสัชกรรม
- ไม่เพิ่มเงื่อนไข printstatus, sendmachine, ordertype, IVStatus, unused, void หรือ hold ซึ่ง Windows ไม่ได้กรองในสาขานี้
- รพ.ผลิตเอง: sendStore=1/sendF3F4=0; ยาฆ่าเชื้อ: 1/2; ชั้น 4: 1/1; ยาเสพติด: sendStore=2 ไม่กรอง sendF3F4
- ช่วงเวลา Asia/Bangkok ก่อน 08:00 ใช้วันก่อนวันที่เริ่ม 08:00 ถึงวันที่สิ้นสุด 07:59:00 ตั้งแต่ 08:00 ใช้วันที่เริ่ม 08:00 ถึงวันถัดจากวันที่สิ้นสุด 07:59:00
- รวม SUM(CAST(orderqty AS DEC(10,2))) แยกรหัส/ชื่อยาเดิม/ข้อมูล master ตาม native เรียงชื่อยา ไม่เปลี่ยนเป็นชื่อ master หรือยุบ master ซ้ำก่อน join
- ใช้ VB CInt ปัดครึ่งเข้าจำนวนคู่/ตรวจ Int32 ก่อนคำนวณ Ceiling(CInt(qty)/CInt(pack)) x pack ถ้า pack ว่างใช้จำนวนเต็ม ถ้าเป็นศูนย์คง Infinity/NaN ตาม native
- ชื่อยาใช้รายการเดิม หน่วยใช้ master.orderunitcode กลุ่ม drugform ว่างใช้ “อื่นๆ” เลขลำดับต่อเนื่อง รวมท้ายเป็นจำนวนแถว
- เลขใบเบิก **IVRAD** + ddMMyyyy ของวันพิมพ์ปัจจุบัน ชื่อห้อง “ห้องยาเตรียมอาคารรังสี”
- อ่าน query เดียวพร้อม bound parameters ไม่โหลด master ทั้งตารางที่รายงานไม่ได้ใช้

## PDF และ API

- A4 แนวตั้ง ใช้ renderer/assets ใบเบิกร่วมตาม RPT เดียวกัน มีโลโก้/โรงพยาบาล/ที่อยู่หน้าแรก ชื่อห้อง/เลขใบเบิก/วันที่พิมพ์และหัวคอลัมน์ซ้ำทุกหน้า
- ลำดับ, INV_Code, รหัสยา, รายการยา, min Stock (ว่าง), ใช้ไป, Rate/วัน (ว่าง), ขอเบิก, หน่วย ตามแบบเดิม ไม่สร้างค่าสต็อกหรืออัตราเพิ่ม
- ช่องลงชื่อผู้ขอเบิก/ผู้อนุมัติ/ผู้จ่าย/ผู้รับ เลขหน้าและยอดรวม ฝังฟอนต์ไทย รองรับชื่อยาหลายบรรทัด
- ไม่พบข้อมูลแจ้ง “ระบบแจ้งเตือน / ไม่พบข้อมูล” แล้วแสดงแบบพิมพ์ว่างต่อ ตาม native
- POST `/api/reports/requisition-ivrad/pdf` รับเฉพาะ `{from,to,kind}` ต้องมี session ใช้ no-store ไม่รับ rows/override ห้องจาก client ส่ง X-Report-Rows/X-Report-Pages
- ดาวน์โหลด `IVRAD-Requisition-Report.pdf` จาก Blob ที่แสดง ไม่ query ซ้ำ ไม่ต้องติดตั้ง Crystal ที่ runtime

## ผลตรวจ

- Backend **283/283 ผ่าน** รวม IVRAD 5 tests: query/filter/เวลา/การแปลงข้อมูล/validation/PDF/auth/read-only API; targeted frontend ESLint และ production build ผ่าน
- เทียบ query กับ StringBuilder ของ Windows ผ่าน `tools/check-requisition-ipd-native.cjs` โหมด `ivrad` วันที่ 2026-10-23 ด้วยเวลาปัจจุบัน ผล raw fields ตรงกันทั้ง 4 ประเภท: ชั้น 4 จำนวน **7 แถว** อีก 3 ประเภทไม่มีรายการ ยอดจริงเปลี่ยนได้ตามเวลาและข้อมูล
- PDF จำลอง 6 แถว 1 หน้า และ 120 แถว 5 หน้า ชื่อครบ 120 ปลายชื่อยาวครบ 4 จุด เลข IVRAD ทุกหน้า ไม่มีอักขระนอกกระดาษ ตรวจภาพหน้าแรก/กลาง/ท้ายแล้ว
- Browser เปิดจากเมนูตามลำดับ Windows ค่าเริ่มต้นวันนี้/ชั้น 4 ถูกต้อง แสดง PDF ข้อมูลจริง 7 รายการ พร้อมโลโก้ เลข IVRAD23102026 ชื่อห้องเต็มและช่องลงชื่อ
- เปลี่ยนตัวกรองซ่อนผลและปิดดาวน์โหลดเก่าจนกด OK ทดสอบยาเสพติดไม่มีข้อมูล แสดงข้อความและ PDF ว่าง 1 หน้า ปิดข้อความแล้วกลับชั้น 4 โหลดข้อมูลจริงได้

ทำใน local ยังไม่ได้ commit หรือ deploy ไม่มีการติดต่อ MySQL หรือสั่งฮาร์ดแวร์
