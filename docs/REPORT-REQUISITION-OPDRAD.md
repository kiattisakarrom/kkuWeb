# Report > ใบเบิก > ห้องยา OPD อาคารรังสี

พัฒนา 23 ตุลาคม 2026 เปิด `/ipd/reports/requisition-opdrad` ผ่าน session เดิม ดูข้อมูล/ดาวน์โหลด PDF ไม่สร้างใบเบิก ไม่แก้ฐาน ไม่ส่งเครื่องพิมพ์หรือ Robot

## ตรงกับ Windows

- ชื่อเมนู `frmMain.Designer.vb:tsOPDRAD.Text` = “ห้องยา OPD อาคารรังสี” วางหลังห้องยาเตรียมอาคารรังสี
- `frmMain.vb:tsOPDRAD_Click` → StatusBT=`btnOPDRAD` → `ucUD.btnOK_Click` เรียก **OPD()** ไม่ใช่ IPD()/IV()
- ใช้ฟอร์ม ucUD.Designer / `Report/Sendmix/crpRequisitionNew.rpt` ร่วม วันที่เริ่ม/สิ้นสุดวันนี้ ค่าเริ่มต้นส่งใบเบิกชั้น 4
- ครบ 4 ตัวเลือก: รพ.ผลิตเอง/ยาฆ่าเชื้อใต้ส่งใบเบิกชั้น 3, ส่งใบเบิกชั้น 4, ยาเสพติด กด OK จึงโหลด เปลี่ยนเงื่อนไขซ่อน PDF และยกเลิกคำขอเก่า ไม่โหลดอัตโนมัติ
- เลขใบเบิก **OPDRAD + ddMMyyyy ของวันพิมพ์** ชื่อห้อง **ห้องยา OPD อาคารรังสี** ไม่ใช้เลข ER/IVRAD หรือวันที่ค้นหา

## แหล่งข้อมูลและวิธีรวมยอด

- MySQL `view_pharmacy_opd_drug_item` เฉพาะ `location='OPD42' AND inv_type != '9' AND Date BETWEEN ? AND ?`
- ใช้วันที่ตามปฏิทินทั้งช่วง **ไม่มีรอบ 08:00** ไม่รวม prescription/prescriptiondetail หรือห้อง ER ไม่เพิ่มสถานะ/ordertype/การกรอง zzzzzz
- `IFNULL(SUM(CAST(no AS DEC(10,2))),0)` GROUP BY drugcode ตาม getDrugOPD คง drugname/unit ของ native ไม่แก้ SQL mode หรือเปลี่ยนการจัดกลุ่ม
- แปลงรหัสด้วย MSSQL drugname.mc_id → Sum_MCID แถวแรก ถ้าไม่พบ/ปลายทางว่างใช้รหัสเดิม จากนั้นเลือก ms_drug แถวแรกที่รหัสและประเภทตรง ไม่กรอง unused
- รพ.ผลิตเอง sendStore=1/sendF3F4=0; ยาฆ่าเชื้อ 1/2; ชั้น 4 1/1; ยาเสพติด sendStore=2 ไม่กรอง sendF3F4
- ใช้ชื่อ orderitemENname/หน่วย orderunitcode/Inventorycode/ISNULL(pack,0) จาก master ตาม native **เก็บแต่ละรหัสต้นทางแยกแถว** แม้สอง alias แปลงเป็นยาเดียวกัน ไม่รวมแบบ ER()
- จำนวนใช้ไป VB CInt ปัดครึ่งเข้าจำนวนคู่/ตรวจ Int32 แล้ว Ceiling(CInt(qty)/CInt(pack)) x pack; pack ว่างใช้จำนวนเต็ม ศูนย์คง Infinity/NaN ตาม native
- drugform ว่างเป็น “อื่นๆ” เรียงชื่อยา แล้วจัดกลุ่ม drugform ใน PDF เลขลำดับต่อเนื่อง ยอดท้ายเป็นจำนวนแถว
- ไม่พบ master หลังแปลงรหัส: dialog รหัสยา/ชื่อยา/จำนวน และ PDF รายการยา เก็บซ้ำตามต้นทาง รหัสที่มีอยู่แต่คนละประเภทไม่ถือว่าหาย

## รองรับรายเดือน/หลายเดือนและความเร็ว

- อ่าน aggregate ทั้งช่วงด้วย **1 MySQL query** ไม่วนยิงทีละวัน/รายการ ไม่ตัดจำนวนวันหรือ LIMIT
- เมื่อมีแถวต้นทาง อ่าน MSSQL master/mapping **2 queries ต่อการค้นหา** แบบคู่ขนาน ใช้ Map lookup แทนค้นตารางซ้ำ ไม่มี N+1 queries
- ปรับตัวแปลง OPD ที่ใช้ร่วมกับ ER (OPD) ให้ประกอบข้อมูลทั้งชุดและจัดรูปแบบเลขใบเบิก/วันพิมพ์ครั้งเดียว คงการปัด/แพ็กแยกต่อแถวทุกช่อง
- Benchmark ข้อมูลจำลอง 6,000 แถว: วิธีเดิมจัดวันที่ต่อแถว 1,332 ms → วิธีชุด 194 ms; deepEqual ทุก field ผ่าน **เป็นเวลาแปลงข้อมูลเท่านั้น ไม่ใช่ความเร็ว SQL จริง**
- ใช้ requisitionMssqlSource แยก pool จากหน้าผู้ป่วย timeout 120 วินาที, MySQL query timeout 120 วินาที/connect 8 วินาที; หน้าเว็บและ Nginx ทั้ง 2 ชั้นรอเฉพาะใบเบิก 300 วินาทีตามที่แก้ไว้
- ทดสอบช่วงเดือน ก.ย. และ 3 เดือน ก.ค.–ก.ย. ก่อน/หลัง 08:00 ด้วย source จำลอง 6,000 แถว ไม่เปลี่ยนวัน ไม่เพิ่มจำนวน queries ตามแถว
- ไม่ใช้ HASH GROUP/index hint/เปลี่ยนสูตรเพื่อเร่งข้อมูล ไม่สร้างหรือแก้ดัชนีจริง ข้อมูลรายการของหน้านี้อยู่ MySQL จึง **ยังยืนยันเวลา SQL รายเดือนจริงหรือแผน MySQL ไม่ได้** ต้องตรวจเมื่อเปิดแหล่งข้อมูลภายหลัง

## MySQL เตรียมไว้โดยไม่เชื่อมตรวจ

- `REPORT_REQUISITION_OPDRAD_ENABLED=false` หรือไม่กำหนด: ไม่เรียก MySQL และไม่อ่าน master/mapping ของรายงานนี้ ไม่ probe และไม่สร้าง connection ตอน import
- flag แยกจาก ER ทั้งสองตัว ไม่เปิดรายงานอื่นตาม ใช้ credentials SERVER/USER/PASSWORD/DATABASE_HOSPITALKKH ฝั่ง backend เดิม
- แสดงสถานะยังไม่เปิดข้อมูลและปิดดาวน์โหลด ไม่สร้าง PDF ยอดศูนย์ปลอมหรือแจ้งไม่พบข้อมูลแทนฐานที่ยังไม่ได้อ่าน
- ถ้าเปิดแล้วอ่านไม่ได้ แสดงแหล่งข้อมูลอ่านไม่ได้ ไม่มี PDF; ถ้าอ่านสำเร็จแต่ต้นทางว่าง แจ้ง “ระบบแจ้งเตือน / ไม่พบข้อมูล” แล้ว PDF ว่าง 1 หน้า
- ถ้าต้นทางมีแถวแต่ไม่ตรงประเภทที่เลือก แสดง PDF ว่างโดยไม่แจ้งไม่พบข้อมูล ตาม OPD()
- เปิดภายหลังโดยตั้ง `REPORT_REQUISITION_OPDRAD_ENABLED=true` ใน back/.env แล้ว restart backend เมื่อพร้อมเข้าถึง MySQL งานนี้ไม่ได้เพิ่ม/เปิด flag ใน .env จริงและไม่ได้เชื่อม MySQL

## PDF และ API

- POST `/api/reports/requisition-opdrad/preview` รับเฉพาะ `{from,to,kind}` ต้องมี session/no-store ไม่รับ rows/location/flag เปิดฐานจาก client
- คืน pdf/pages/rows/missingDrugs/missingPdf/message/sourceReady/sourceWarning จากการค้นหาเดียวกัน ดาวน์โหลดไม่ query ซ้ำ
- `OPDRAD-Requisition-Report.pdf`: A4 แนวตั้ง โลโก้โรงพยาบาล/ที่อยู่หน้าแรก เลข OPDRAD/ชื่อห้อง/วันที่พิมพ์/หัวคอลัมน์ทุกหน้า รวมจำนวนแถวและช่องลงชื่อ 4 ส่วนเดิม
- คอลัมน์ลำดับ, INV_Code, รหัสยา, รายการยา, min Stock ว่าง, ใช้ไป, Rate/วันว่าง, ขอเบิก, หน่วย ตาม RPT ไม่เติมข้อมูลสต็อก/อัตราขึ้นเอง
- `OPDRAD-Unmapped-Drugs.pdf`: US Letter ตาม crpRequisitionDrug.rpt มีโลโก้ Drug Report/วันที่/เลขหน้า/ลำดับ/รหัส/ชื่อยา แทน Print ใน frmMessageDrug
- ใช้ renderer/assets/font ไทยร่วมกับใบเบิกเดิม ไม่ต้องติดตั้ง Crystal ตอนรัน

## ผลตรวจ

- `tools/check-requisition-opdrad-native.cjs` เทียบ StringBuilder getDrugOPD/dispatch/location/prefix/ชื่อห้อง/เมนูแบบ offline ผ่าน ไม่มีฐานที่ติดต่อ
- Backend regression **294/294 ผ่าน** รวม OPDRAD 7 tests และ ER (OPD) เดิม ตรวจ aliases/first mapping/master/4 ประเภท/CInt/empty/unavailable/month/quarter/auth/read-only/PDF และ error timeout ทั้ง 8 หน้า
- Frontend targeted ESLint และ production build ผ่าน
- PDF จำลอง 6 แถว 1 หน้า; 120 แถว 7 หน้า ชื่อครบ 120/ปลายชื่อยาวครบ 4 จุด/เลข OPDRAD ทุกหน้า; missing 90 แถว 4 หน้า ชื่อครบ 90/ปลายชื่อยาวครบ 3 จุด ไม่มีข้อความนอกกระดาษ ตรวจภาพหน้าแรก/กลาง/ท้ายและโลโก้แล้ว
- Browser เว็บจริงเปิดจากเมนูตามลำดับ Windows ค่าเริ่มต้นวันนี้/ชั้น 4 ถูกต้อง เลือกย้อนหลัง 3 เดือนแล้วแสดงสถานะยังไม่เปิด MySQL ไม่มี PDF/ไม่พบข้อมูลปลอม
- Browser production build กับ server จำลองเฉพาะ localhost ไม่ใช้ฐานจริง: ตรวจ dialog รหัสยาขาด 2 คอลัมน์/จำนวน 2, PDF จำลอง 120 แถว 4 หน้า, เปลี่ยนหน้าสุดท้าย/ซูม/กรณีไม่มีข้อมูล ตรวจแล้ว

ทำใน local ไม่ commit/deploy ไม่ติดต่อ MySQL หรือฮาร์ดแวร์ ผลรายเดือนจริงยังรอแหล่ง MySQL

อัปเดต 23 ต.ค. หลังผู้ใช้ถอดหน้า ER (OPD): ส่วนกลาง OPD ย้ายเป็น `services/reportRequisitionOpd.js` และ `routes/opdRequisitionRoutes.js` แล้ว OPDRAD ยังคงฟอร์ม/แหล่ง OPD42/สูตร/PDF/flag เดิมครบ ผล regression หลังย้ายผ่าน
