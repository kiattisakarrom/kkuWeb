# LAB ย้อนหลังแบบดูข้อมูล — ปรับคอลัมน์ 19 ตุลาคม 2026

คงปุ่ม LAB และกรอบรายละเอียดผู้ป่วยเดิม หน้า LAB ย้อนหลังมีช่วงวัน รายการวันที่ทางซ้าย ผลตรวจทางขวา และช่องอ่านข้อความเดิม ไม่มีสร้าง แก้ไข ลบ นำเข้า พิมพ์ หรือบันทึกค่าคลินิก

แท็บ LAB Result สรุป 7 วันทางขวาของหน้าผู้ป่วยยังใช้ MSSQL แยกจากหน้าประวัติ MySQL นี้ ไม่ใช้สรุปมาแทนข้อมูลประวัติเมื่อ MySQL เข้าไม่ถึง

## คอลัมน์และการแสดงตาม Windows

อ้างอิง Dispense/frmShowLab.vb, frmShowLab.Designer.vb และ Dispense/cls/clsShowlabresults.vb:

| ลำดับ | หัวคอลัมน์ | ข้อมูล | ความกว้างเดิม |
|---|---|---|---|
| 1 | lab_name | lab_name | 120px |
| 2 | ผล | result | 120px |
| 3 | ว่าง | ไอคอนตาม type_result | 40px |
| 4 | unit | unit | 110px |
| 5 | minresult | minresult | 80px |
| 6 | maxresult | maxresult | 80px |
| 7 | date_res | date_res | 120px |
| 8 | time_res | time_res | 120px |
| 9 | remark | remark | 60px |
| 10 | result_obj | result_obj | 250px |
| 11 | ชื่อ | name | 200px |

- ซ่อน lab_no, rax_no, type, hn, lab_code, type_obj, detail, date_result, lastupdate, ref ตาม Designer ไม่แสดงเป็นคอลัมน์เพิ่ม ข้อมูลที่ API เคยคืนยังคงไว้ตามเดิม
- ใช้ไอคอนต้นฉบับตาม My Project/Resources.resx: H = ลูกศรขึ้นสีเขียวจาก Img/Upload.png, L = ลูกศรลงสีแดงจาก Img/Download (2).png คัดลอกเป็น front/img/lab-high.png และ lab-low.png ไม่มีการวาดหรือเปลี่ยนไอคอนใหม่ ค่าว่าง/รหัสอื่นไม่แสดงไอคอน
- คอลัมน์ไอคอนไม่เพิ่มข้อความ H/L หรือหัวคอลัมน์ H/L ที่ Windows ไม่แสดง แต่มี alt/aria-label สำหรับการเข้าถึง ไม่คำนวณ H/L จาก min/max หรือผลตรวจเอง
- ไม่เพิ่มสีแดง/น้ำเงินให้ตัวเลขผลตรวจที่ต้นฉบับไม่กำหนด
- ค่าที่ไม่มีแสดงว่าง ไม่ใส่ขีดหรือ placeholder ผล 0 ยังเป็น 0 ข้อความเช่น <5, >100, 001.230 หรือจำนวนยาวไม่แปลงเป็นเลข/ปัดเศษ
- result_obj ห่อและแสดงข้อความทั้งหมดที่ API ส่งมาในตารางตาม AutoSizeRowsMode และ WrapMode ของ Windows ไม่ตัดเหลือสองบรรทัด ช่องอื่นใช้ค่าที่บันทึกตรง ๆ พร้อม tooltip เมื่อถูกจำกัดความกว้าง
- รายการวันที่ทางซ้ายใช้หัววันที่ล่าสุด และแสดง yyyy-MM-dd ที่ได้จากการจัดกลุ่มตาม native ไม่เปลี่ยนเป็น dd/MM/yyyy
- คงกรอบเลือกผลตรวจและ textarea readOnly เดิมเพื่ออ่าน/คัดลอกรายงานและ remark เต็ม ไม่รวม detail ที่ Windows ซ่อนเข้าไปในหมายเหตุอีก

## MySQL ที่เตรียมไว้

- ใช้ MySQL view_lab_result ตามต้นฉบับ โดย HN จาก backend รวมผลจากทุก AN/การมารักษาครั้งก่อน ไม่ใช้ MSSQL ms_labresult แทน
- ค่าเริ่มช่วงวันเป็นวันนี้ตามเวลาไทยย้อนหลัง 7 วันถึงวันนี้ จึงครอบคลุมได้ 8 วันปฏิทิน ไม่อิงวันที่รอบยา
- วันเริ่ม 00:00:00 ถึงวันสิ้นสุด 23:59:00 ตาม Windows อย่างเคร่งครัด ไม่ขยายเป็น 23:59:59 รายการหลัง 23:59:00 ของวันที่เปิดไม่อยู่ใน query รายวัน แม้วันนั้นอาจปรากฏจาก query ช่วงวัน
- วันที่แสดงล่าสุดก่อนอย่างชัดเจนด้วย ORDER BY date DESC; Windows เดิม GROUP BY โดยไม่กำหนด ORDER BY จึงไม่ได้รับประกันลำดับวันที่ ผลรายวันเรียง lab_code เช่นเดิม และมี date_result/lab_no/rax_no เป็นตัวตัดสินเมื่อรหัสซ้ำ
- result_obj ใช้ CAST(... AS CHAR(10000) CHARACTER SET tis620) เช่น native ข้อความเต็มที่แสดงจึงหมายถึงเต็มภายในขอบเขตการแปลง 10,000 ตัวอักษรนี้ ไม่อ้างว่าเป็นข้อมูลต้นฉบับที่ยาวกว่านั้นทั้งหมด
- เก็บ DECIMAL/BIGINT เป็นข้อความ ไม่เปลี่ยน null เป็นศูนย์ คง date_res/time_res และข้อความไทยตามค่าที่ต้นทางส่ง

ใช้ pool MySQL เดิมที่เปิดเมื่อเรียกประวัติ LAB จำกัด 3 connections, connect timeout 8 วินาที/query timeout 10 วินาที หนึ่ง query สำหรับรายการวันและหนึ่ง query สำหรับผลของวันที่เลือก ไม่มี query ต่อแถว การเลือกอ่านข้อความจาก response ไม่เรียกฐานเพิ่ม กรอง date_result โดยตรง ไม่ใช้ function ครอบคอลัมน์ใน WHERE

ใช้ environment MySQL เดิมตาม [DATABASE-CONNECTIVITY.md](DATABASE-CONNECTIVITY.md) ไม่เพิ่ม credential ใน source และไม่ต่อ MySQL จริงในรอบนี้ตามคำขอให้เตรียมไว้ก่อน ไม่มี fixture หรือ MSSQL สรุปทดแทนในระบบจริง

## API และการอ่านอย่างเดียว

- GET /api/ipd/patients/:an/lab-history/dates?wardCode=...&orderdate=...&from=...&to=...
- GET /api/ipd/patients/:an/lab-history/results?wardCode=...&orderdate=...&from=...&to=...&date=...

คง JWT/ห้องยา/current AN/active ward ตรวจวันจริง/ช่วงกลับด้าน/array/วันที่นอกช่วงก่อนอ่าน ไม่รับ HN override ใช้ placeholders กับ HN/วันทุกค่า ปิด write methods ไม่เปลี่ยน schema/index

โหลดเมื่อเลือกวัน ไม่เลือกวันแรกให้อัตโนมัติตาม Windows ใช้ cancel/request-key เดิมเพื่อป้องกันผลวันเก่า เปลี่ยนวัน/ช่วงค้นหาแล้วล้างรายละเอียดเดิม จำ view=lab-history, labFrom, labTo, labDate ใน URL และคงตัวกรองรายการผู้ป่วยเมื่อกลับ

## ผลตรวจรอบนี้

- ชุดทดสอบ **150 กรณีผ่าน** รวม MySQL bindings/field/cutoff/leap/max date/results/null/0/ข้อความยาว/auth/scopes/arrays/นอกช่วง/empty-outage/ปิด write เดิม และเพิ่ม 11 คอลัมน์ native, hidden metadata, ความกว้าง, H/L จากค่าที่บันทึกเท่านั้น และรักษาข้อความ/วันที่/ตัวเลขตามต้นทาง
- Production build และ ESLint ไฟล์ที่แก้ผ่าน ไอคอนที่คัดลอกจาก native โหลดได้ทั้ง H และ L ใน browser
- Browser fixture ใช้ component/hook จริงกับ API จำลอง: เลือกวันที่แล้วได้ 3 แถวครบ 11 ช่อง ไม่มี HIDDEN metadata ในตาราง H/L แสดงรูปไอคอน ไม่มีรูปสำหรับ N คง 0 และ 001.20 ช่อง null ว่าง
- รายงาน 298 ตัวอักษรมีส่วนท้ายครบในตารางและ textarea แบบ readOnly ช่องหมายเหตุมีเฉพาะ remark ไม่รวม detail ที่ซ่อน
- เปลี่ยนแถวไปผลว่างล้างรายงาน เปลี่ยนวันไม่มีผลแยกจากวัน MySQL error กลับวันเดิมได้ 3 แถวโดยไม่ค้างการเลือก ช่วงกลับด้านถูกปฏิเสธ ค้นหาช่วงใหม่ไม่มีรายการแล้วล้างผล/รายละเอียดเก่า
- ไม่ได้เรียก MySQL จริงในรอบนี้ ยังต้องเทียบข้อมูลจริงเมื่อเข้าเครือข่ายโรงพยาบาล โดยเฉพาะชื่อ field, tis620/ภาษาไทย, รหัสซ้ำ ขอบเวลา 00:00/23:59:00/23:59:01 และประวัติหลาย AN จึงยังไม่ปิด P12 เป็นการรับรอง parity ของข้อมูลจริงทั้งหมด

ภาพหลักฐานเป็นข้อมูลสมมติ ไม่มีการเขียนข้อมูลธุรกิจ ไม่มี scanner/print/import และไม่ commit/push
