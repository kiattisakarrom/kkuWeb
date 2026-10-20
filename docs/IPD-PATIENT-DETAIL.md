# รายละเอียดผู้ป่วยแบบดูข้อมูล — 18 ตุลาคม 2026

อัปเดต 19 ต.ค. 2026: เติมข้อมูลด้านบน/ANC, ค่าคลินิกแบบแสดงผล, Protocol ของรายการยา และคอลัมน์/สี/สถานะ Medication Profile เพิ่ม ดู [ผลเทียบล่าสุดและข้อจำกัด](IPD-PROFILE-PARITY.md) ซึ่งแทนข้อจำกัดของส่วนนี้ในบันทึกเก่าด้านล่าง

ดับเบิลคลิกหรือกด Enter ที่ผู้ป่วยใน `/ipd` เปิด `/ipd/patients/:an` โดยใช้โครง `Profile/FrmProfile.jsx` เดิม: กรอบผู้ป่วย/ข้อมูลส่วนตัวด้านบน LAB และ Note DRP ทางขวา Medication Profile ด้านล่าง เมนูหลักและ footer ยังคงอยู่

ปุ่มกลับและ Ctrl+E คืนวอร์ด วันที่ สถานะ AN ค้นหา และตัวกรองใบสั่งยาเดิม รวมกรณี refresh หน้ารายละเอียด บริบทตัวกรองอยู่ใน URL ไม่เก็บแถวข้อมูลผู้ป่วยไว้ใน localStorage

## ข้อมูลที่เชื่อมแล้ว

- Summary ตาม AN: HN/AN ชื่อตามภาษา เพศ วันเกิด อายุ Admit ห้อง/เตียง วอร์ด สิทธิ์ ที่อยู่ แพทย์ และจำนวนใบสั่งยาของวัน/ทั้งหมดใน AN ตาม join ใน `clsShowdata.showDataPatient`
- ค่าทางคลินิกจาก `ms_patientlabresult` ล่าสุดที่บันทึกใน AN/HN พร้อม lastmodified แสดง null เป็นขีด ไม่คำนวณ BSA/renal/ANC ใหม่ และไม่รันงานเพิ่มหรืออัปเดต lab แบบ Windows เมื่อเปิดหน้า
- Medication Profile อ่าน `ms_medicationprofile` และ master วิธีใช้/หน่วย/ความถี่/เวลา แสดงจำนวนจ่าย ราคา หมายเหตุ Off/Hold, MRC และจำนวนใบยาในรอบตาม meditemindex จริง ไม่เรียก checkdispense หนึ่งครั้งต่อยาและไม่ใช้ meditemindex คงที่
- เปลี่ยน IPD/IV/Chemo/TPN ส่ง AN เดิมและเปลี่ยนข้อมูลตารางจริง; เงื่อนไข sendmix/sendchemo/sendtpn ตาม native
- รอบยา 08:00 ถึง 07:59:00 วันถัดไปตาม source; วันปัจจุบันก่อน 08:00 เริ่มรอบวันก่อน พร้อม cutoff enddate ตาม native เลือกวันย้อนหลังได้โดยแสดงวันเริ่มรอบชัดเจน
- โหมดแสดง Off อ่านทุกวันและทุกห้องใน AN ตาม branch `cbshowoffdrug` เดิม จึงปิดตัวกรองห้องในโหมดนี้และอธิบายบนหน้าจอ
- LAB จาก `ms_labresult` ย้อนหลัง 7 วันของ HN ตามหน้าหลัก native คงผล/หน่วย/H-L/ค่าปกติ/หมายเหตุ ไม่แปลงผลที่ไม่มีเป็นศูนย์
- Note DRP ประวัติ HN (รวม AN อื่นตาม native) ชื่อยา/ผู้บันทึกและข้อความจริง ปัจจุบันแปลชื่อปัญหา Process สาเหตุ การแก้ไขและผลลัพธ์จาก master พร้อมคงรหัสดิบแล้ว ดู [ME/DRP](IPD-ME-DRP.md)
- ประวัติแพ้ยาจาก `ms_adr`/`ms_adrgeneric` ของ HN ที่ backend หาให้ ข้อผิดพลาดแสดง error และลองใหม่ ไม่สรุปว่าไม่แพ้ยาเมื่อโหลดไม่ได้

## API และขอบเขต

GET `/api/ipd/patients/:an` และ `/medications`, `/labs`, `/notes`, `/allergies` ต้องมี JWT viewer เดิมและ wardCode ที่ถูกต้อง Server ตรวจ AN ยังอยู่ใน active ward นั้นผ่าน bedmove status 0 และหา HN จาก admission เอง ไม่รับ HN override จาก client ห้องยาใช้ค่าจาก JWT

เมื่อ AN ไม่อยู่ในวอร์ด/ย้ายวอร์ดแล้วคืน 404 ไม่อ่าน subresource ต่อ พารามิเตอร์ใช้ SQL bindings ตรวจ enum/date/array ก่อน SQL ทุก route เขียนเดิมยังปิดไว้

## ผลตรวจ

- `npm test` ผ่าน 26 กรณี รวมสิทธิ์ AN/วอร์ด HN override, subresources, ตัวกรองยา และขอบรอบ 08:00/ปีใหม่/leap day
- Build และ ESLint เฉพาะไฟล์ที่แก้ผ่าน
- ฐานข้อมูลจริง: เปิด AN ตัวอย่างได้ถูกวอร์ด/ชื่อ/ห้อง API summary ตัวอย่างประมาณ 81–486 ms; อ่านยาใน admission ที่มีข้อมูลได้ 2 แถว โหมด Off 2 แถวประมาณ 197 ms ตัวกรอง IPD 2 แถว IV/Chemo/TPN ไม่มีรายการตามข้อมูลตัวอย่าง เวลานี้เป็น request ตัวอย่าง ไม่ใช่ SLA
- แก้ query นับใบยาจาก subquery ต่อแถวเป็น aggregate ของ AN/HN/รอบเดียว แล้ว join กลับ ไม่แก้ index/schema
- Browser ทดสอบดับเบิลคลิก เปลี่ยน IV/Off/Note DRP กลับหน้ารายการและ refresh แล้วคง AN ค้นหา/วอร์ด มี timeout ระหว่างรอบหนึ่งและปุ่มลองใหม่กู้คืนได้ ไม่แสดงข้อมูลว่างแทน error
- ภาพตรวจรูปแบบใช้ข้อมูลสมมติทั้งหมด แยก API ทดสอบชั่วคราวจากฐานจริง ไม่บันทึกชื่อ HN/AN หรือข้อมูลสุขภาพจริงลงภาพ

หน้ารายการสั่งยาเชื่อมเพิ่มแล้ว ดู [การเลือกวันที่/ใบสั่งยาและผลตรวจ](IPD-PRESCRIPTION-HISTORY.md) และเพิ่ม [Medical Reconcile แบบอ่าน](IPD-MEDICAL-RECONCILE.md) โดย Unitdose/MRC ตรวจข้อมูลจริงแล้ว ส่วน OPD เตรียมโค้ดพร้อม รอตรวจข้อมูลจริงเมื่อ backend เข้าเครือข่ายภายในโรงพยาบาลตาม [ข้อกำหนด MySQL](DATABASE-CONNECTIVITY.md) เพิ่ม [Drug Profile ช่วงวันแบบอ่าน](IPD-DRUG-PROFILE.md), [ME/DRP พร้อม Pharmacist Note/Plan ของรายการ DRP](IPD-ME-DRP.md) และ [หน้า Note แยกจาก `ms_note`](IPD-PHARMACIST-NOTES.md) และ [แท็บ IHOS DUE แบบอ่านจาก hospital API](IPD-IHOS-DUE.md) แล้ว โดย IHOS DUE ยังรอเทียบรายการจริงเมื่อเข้าถึง API ได้ เพิ่ม [หน้า LAB ย้อนหลังเลือกช่วงวันและวันที่ตรวจจาก MySQL](IPD-LAB-HISTORY.md) แล้ว โดยรอตรวจข้อมูลจริงภายในเครือข่าย เพิ่ม [หน้าประวัติ ADR / แพ้ยาเต็มจากกรอบเดิม](IPD-ALLERGY-HISTORY.md) แล้ว ขอบเขตนี้ไม่ใช่ parity ทุกหน้าของ Windows
