# IHOS DUE แบบดูข้อมูล — ปรับคอลัมน์ 19 ตุลาคม 2026

คงแท็บ IHOS DUE ทางขวาของรายละเอียดผู้ป่วย เมนูและกรอบเดิม ดูข้อมูลอย่างเดียว ไม่รวมกับ DUE ในหน้า ME/DRP ใช้ AN ปัจจุบัน ไม่กรองตามวันที่รอบยา

## คอลัมน์และค่าตาม Windows

อ้างอิง Dispense/ucAddOrderdispense.vb ฟังก์ชัน jsondue/getdrugname และ dgvDue ใน Designer:

| ลำดับ | หัวคอลัมน์ | ข้อมูล / ความกว้างเดิม |
|---|---|---|
| 1 | datetime | ค่าจาก API โดยตรง / 150px |
| 2 | สถานะ | แปลจาก status / 100px |
| 3 | ชื่อยา | ms_drug.orderitemENname / 200px |
| 4 | confirm_inp_id | ค่าจาก API / 100px |
| 5 | confirm | ว่างตาม jsondue / 120px |
| 6 | confirm_date | ค่าจาก API / 150px |
| 7 | confirm_note | ข้อความพิจารณาเต็ม / 100px |
| 8 | request_note | ข้อความคำขอเต็ม / 250px |

- รหัสยาใน Designer คือ Column1 ที่ Visible=False จึงซ่อน drugcode จากตารางและหัวรายละเอียด; inp_type ที่ jsondue ส่งเป็นค่าพิเศษไม่ได้เป็นคอลัมน์ที่กำหนดใน Designer จึงไม่แสดง ทั้งสองค่ายังคงอยู่ใน API เดิม
- หน้านี้แสดง 8 คอลัมน์ตามลำดับเดิม ไม่มีหัวคอลัมน์ภาษาไทยที่เพิ่มแทนชื่อ field ของต้นฉบับ
- status ว่าง/null = รออนุมัติ, 1 = อนุมัติ, 2 = ไม่อนุมัติ รหัสอื่นแสดงช่องว่างตาม jsondue ที่เริ่ม status label เป็นสตริงว่าง ส่วน API ยังคงรหัสดิบและ statusText แบบระบุไม่ทราบสถานะไว้ให้ผู้ใช้อื่น เช่น Medication Profile ไม่มีการเปลี่ยนพฤติกรรมของ API/Medication Profile ในรอบนี้
- confirm เว้นว่างเสมอตาม Rows.Add เดิม ไม่สร้างชื่อจาก confirm_inp_id
- ข้อมูลที่ไม่มีค่ารวมชื่อยาที่ไม่พบ master แสดงว่าง ไม่เติมขีดหรือ placeholder ลงช่องข้อความ
- แสดงวันเวลาที่ API บันทึกตรง ๆ ไม่แปลง timezone/รูปแบบวันที่ และไม่ใช้รอบยา 08:00
- คงลำดับ/จำนวนจากต้นทาง ไม่เรียงหรือรวมรายการใหม่ ตารางห่อข้อความในแถวสูง 30px ตาม native เลื่อนแนวนอน/แนวตั้งได้ ไม่เพิ่มสีสถานะที่ต้นฉบับไม่ได้กำหนด
- คงกรอบรายละเอียดเดิมสำหรับอ่านข้อความคำขอ/ผลพิจารณาเต็มใน textarea แบบ readOnly เลือกแถวไม่เรียก API เพิ่ม เปลี่ยนชุดข้อมูลแล้วล้างการเลือกเก่า

## แหล่งข้อมูลและ MySQL

แหล่งนี้เป็น **hospital HTTPS API + MSSQL ชื่อยา ไม่ใช่ MySQL**: GET https://interface.kkh.go.th/v1/pharmacy/restricted-drug ส่งเฉพาะ AN และ header x-api-key ตาม Windows ใช้ response.data เป็นรายการ

ชื่อยาใช้ MSSQL ms_drug.orderitemENname ตาม orderitemcode คง batch lookup ที่เตรียมไว้ สูงสุด 500 parameters ต่อ query แทน query ต่อรายการ เก็บรหัสไม่ซ้ำเพื่อ lookup ครั้งเดียวแล้วคืนชื่อไปยังทุกแถวเดิม ไม่ fallback ชื่อ TH ถ้าฐานล้มเหลวแสดง error ไม่สร้างชื่อสมมติ

ไม่มี MySQL ที่ต้องเพิ่มในเส้นทางนี้ โค้ด MySQL ของส่วนอื่นยังคงเตรียมไว้ตามเดิมสำหรับเครือข่ายโรงพยาบาล ตาม [DATABASE-CONNECTIVITY.md](DATABASE-CONNECTIVITY.md)

## API และการตั้งค่า

GET /api/ipd/patients/:an/ihos-due?wardCode=...&orderdate=... ตรวจ JWT และ admission/active ward ก่อนใช้ AN ที่ backend ตรวจแล้ว ไม่รับ HN override ไม่มี route อนุมัติ แก้ไข เพิ่ม ลบ หรือฮาร์ดแวร์

ใช้ IHOS_DUE_API_KEY จาก back/.env ซึ่งถูก Git ignore ไม่ฝัง key ใน frontend/source/เอกสาร ตัวอย่างชื่อ setting อยู่ใน back/.env.example และต้องเก็บ database/JWT settings เดิมไว้

ปลายทางกำหนดตายตัวฝั่ง backend ไม่รับ URL/key จาก client ปิด redirect มี timeout 6 วินาที จำกัด response 2MiB คงการตรวจ TLS ไม่บันทึก key/token/clinical response ใน log

แยกรายการว่างจริง (data:[]), ไม่ได้ตั้งค่า, แหล่งเข้าไม่ถึง และ response ผิด/AN ไม่ตรง ข้อผิดพลาดไม่คืนรายการว่างหรือข้อมูลสมมติทดแทน ปุ่มโหลดใหม่/ลองใหม่อ่าน IHOS DUE แยกจากหน้าหลัก

## ผลตรวจรอบนี้

- Tests backend **147 กรณีผ่าน** รวม status/response validation/AN mismatch/credential handling/lookup/JWT/ward/HN override/ปิด write เดิม และกรณีใหม่: 8 คอลัมน์ native, hidden fields, ความกว้าง, สถานะว่าง/1/2/รหัสอื่น, confirm ว่าง, วันเวลาดิบ, null/ศูนย์ และข้อความยาวหลายบรรทัด
- Production build และ ESLint ไฟล์ที่แก้ผ่าน
- ทดสอบ MSSQL batch lookup จริงโดยจำลองเฉพาะ hospital response: 3 แถว รหัสซ้ำได้ชื่อเดียวกัน ชื่อตรง EN ใน master และรหัสไม่พบ master คืนชื่อว่าง ผ่านครบ ไม่ใช่รายการจริงจาก IHOS
- เรียก hospital API จริงด้วย AN จากฐานที่ backend อ่านได้: ได้ IHOS_DUE_UNAVAILABLE ประมาณ 5.0 วินาที จึงยังไม่รับรองรูปแบบ response/key/รายการจริงกับ Windows และยังไม่ปิด P16
- Browser fixture 4 แถว: header ครบ 8 ช่อง ไม่แสดง drugcode/inp_type ค่าว่างไม่เป็นขีด รหัสสถานะอื่นเป็นว่างตาม native อ่านคำขอยาว 683 ตัวอักษรและส่วนท้ายครบใน textarea readOnly
- เปลี่ยนไปแถวว่างแล้วล้างข้อความทั้งสองช่อง ไม่มี placeholder กรณีไม่มีรายการแสดงข้อความเฉพาะ กรณี error แสดง alert แยกกัน ลองใหม่กลับมา 4 แถวและไม่ค้างการเลือกเก่า

ภาพหลักฐานเป็นข้อมูลสมมติทั้งหมด ไม่มีการเขียนข้อมูลธุรกิจ ไม่ commit/push ไม่เปลี่ยนการเชื่อม MySQL ของหน้าอื่น
