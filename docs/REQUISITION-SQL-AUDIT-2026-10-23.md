# ผลตรวจแผน SQL และดัชนีของใบเบิก — 23 ตุลาคม 2026

**ยังทำให้เร็วขึ้นได้ โดยจุดหลักคือการลดการอ่านตารางรายการยาทั้งก้อนและการย้อนอ่านตาราง ไม่ใช่เพิ่ม timeout อีก** เสนอทดสอบดัชนีครอบคลุมรายงาน 2 ตัวบนฐานสำเนาก่อน ยังไม่ได้สร้างดัชนี เปลี่ยน schema/data/statistics/config ของฐาน หรือเปลี่ยน SQL ที่เว็บใช้งานจริงในงานตรวจรอบนี้ และไม่ตรวจ MySQL

## ขอบเขตและหลักฐาน

- อ่าน sys.columns/indexes/index_columns/partitions/allocation_units/stats/stats_columns และ dm_db_stats_properties ของ prescriptiondetail, prescription, ms_drug, drugname
- เก็บ actual execution plan ด้วย session SET STATISTICS XML/IO/TIME และ SELECT ของเว็บตามเดิม ไม่ใช้ estimated cost เพียงอย่างเดียว
- ช่วงหลัก 2026-09-01 ถึง 2026-09-30 ครบ 4 ประเภทของ 6 aggregate MSSQL = 24 กรณี รวม MSSQL master/mapping ที่ใช้ร่วมกันใน ER และ ER (OPD)
- เพิ่มทดสอบ IPD 2026-07-01 ถึง 2026-09-30 และ Fixed Stock 2026-10-01 ถึง 2026-10-22; วันที่ตาม native 08:00–07:59:00 โดยตรึงนาฬิกาเข้า branch หลัง 08:00 เหมือนกันทุกคำสั่งที่เทียบ
- เก็บทั้งหมด 67 actual plans รวมรอบซ้ำ/คำสั่งทดลอง เรียกตามลำดับ ไม่ยิง query หนักพร้อมกัน ไม่ล้าง cache ไม่เปลี่ยน isolation หรือใช้ NOLOCK
- แฟ้มหลักฐานอยู่ `../tmp/requisition-sql-audit/`: metadata.json, *.sqlplan, plans-summary.json, verification.json และ equivalence-ipd-floor4-2026-07-01-2026-09-30.json
- ไฟล์บันทึกจำนวน/เวลา/digest/แผน ไม่มี raw result rows หรือ credentials ไม่โหลด MySQL module/เปิด MySQL source flags

## พบอะไรในแต่ละหน้า

ค่าด้านล่างเป็น actual plan / STATISTICS IO รอบแรกของชั้น 4 เดือน ก.ย. เว้นแถวที่ระบุอย่างอื่น **logical reads เป็นการอ่านหน้า 8KB ใน buffer ไม่ใช่จำนวนแถวหรือจำนวนครั้งอ่านดิสก์จริง**

| หน้า | ข้อมูลที่อ่าน/ดัชนีปัจจุบัน | ปัญหาที่พบ | แนวทาง |
| --- | --- | --- | --- |
| ห้องยา IPD | prescriptiondetail, ห้อง 001 | Clustered Index Scan อ่านประมาณ 5.80 ล้านแถว ได้ผล 605 แถว; 510,439 logical reads รอบแรก และประมาณ 527–530k รอบถัดไป; Sort ก่อนรวม 167,854 แถว spill ไป tempdb ประมาณ 2,017 หน้า | Candidate A + ตรวจการรวมกลุ่ม/ค่าประมาณแถว |
| ห้องยา D/C | prescriptiondetail, ห้อง 001/005 | Scan ประมาณ 5.80 ล้านแถว; 530,015 reads; ผล 452 แถว; Sort spill 242 หน้า | Candidate A; หากยังหนักค่อยทดสอบดัชนีเฉพาะ printed/home แทนการสร้างซ้ำทันที |
| ห้องยา ER | prescriptiondetail, ห้อง 004/printstatus=1 | Scan ประมาณ 5.80 ล้านแถว; 530,016 reads; raw MSSQL aggregate 506 แถว; Sort spill 44 หน้า | Candidate A; master/mapping ยังไม่ใช่จุดหลัก |
| ห้องเตรียมยาอาคารเภสัชกรรม | prescription, IVStatus IS NOT NULL | INDEXIV1 seek วันที่ อ่าน 433,751 index rows เหลือ IV 52,619 แถว แต่ย้อน Clustered Index Seek/lookup 52,619 ครั้ง เพราะขาดชื่อยา/จำนวน; รวม 221,579 reads | Candidate B แบบ covering/filtered |
| ห้องยาเสพติดและ Fixed Stock | prescriptiondetail, ห้อง 018 | ก.ย. ไม่มีผลแต่ยัง Scan 5.80 ล้านแถว / 530,016 reads; ต.ค. 1–22 ไม่มีผลเช่นกัน แต่แผนเลือก seek ตามรหัสยาแล้ว lookup 210,148 ครั้ง / รวม 869,284 reads ตาม STATISTICS IO และ SQL ใช้ประมาณ 19.7 วินาทีในรอบนั้น | Candidate A สำคัญแม้กรณีไม่มีรายการ; ไม่ควรบังคับแผนเดียวทุกช่วง |
| ห้องยาเตรียมอาคารรังสี | prescriptiondetail, ห้อง 006 | Scan ประมาณ 5.80 ล้านแถว / 530,016 reads เพื่อผล 70 แถว | Candidate A ซึ่งเริ่มด้วยห้องยา |
| ห้องยา ER (OPD) เฉพาะ MSSQL | อ่าน master/mapping ร่วมกับ ER | ms_drug 7,729 แถว / 491 reads / 506 ms; drugname 2,755 แถว / 53 reads / 79 ms; query ไม่มีตัวกรอง จึงเป็น scan ที่เหมาะกับการอ่านทุกแถวในงานนี้ | ยังไม่เพิ่ม index ใหม่ให้สองตารางนี้; **ไม่ตรวจแหล่ง OPD MySQL/ยอดรายงานเต็ม** |

ตัวเลข ER 506 เป็นผลก่อนแปลง/รวมรหัสยาและก่อนรวม OPD ไม่ใช่จำนวนสุดท้ายใน PDF ส่วน Fixed Stock ยังไม่มี nonempty monthly result ในช่วงที่ตรวจ จึงยืนยันแผนกรณีว่างได้ แต่ยังไม่อ้างว่าทดสอบรายเดือนที่มีข้อมูลครบแล้ว

ประเภท รพ.ผลิตเอง/ยาฆ่าเชื้อ/ยาเสพติดบางหน้ามี master จำนวนน้อย จึงเลือก index `prescriptiondetailorderitemcod(orderitemcode, ordercreatedate)` + lookup แทน scan ตัวอย่าง IPD ใช้ 40,550 / 2,890 / 32,215 reads ตามลำดับ การปรับที่ช่วยชั้น 4 จึงอาจไม่ได้ช่วยทุกประเภท

## เหตุใดมีดัชนีวันที่แล้วจึงยังช้า

- prescriptiondetail มีประมาณ 5.8 ล้านแถว / clustered storage ประมาณ 4 GB
- ordercreatedateindex เริ่มด้วย ordercreatedate และมี orderitemcode/name/qty แต่ **ไม่มี departmentcode, ordertype, sendmachine, printstatus** ที่รายงานใช้กรอง จึงต้อง lookup หรือเปลี่ยนไป scan ทั้งตาราง
- index_01 แม้ INCLUDE คอลัมน์เกือบครบ แต่เริ่มด้วย `(an,totalprice)` และมีขนาดประมาณ 4.4 GB จึงไม่ได้เป็นดัชนีสำหรับช่วงห้องยา/วันที่
- prescriptiondetailorderitemcod เริ่มด้วยรหัสยา/วันที่ แต่ INCLUDE เพียงจำนวน ขาดชื่อยา/ห้องยา/สถานะ จึงยังมี lookup เมื่อประเภทมีหลายรหัส
- prescription.INDEXIV1 เริ่มด้วย `(ordercreatedate,orderitemcode,IVStatus)` แต่ INCLUDE เพียง wardcode/wardname ขาด orderitemname/orderqty ของรายงาน
- **ไม่พบ CAST ครอบคอลัมน์ ordercreatedate** พารามิเตอร์แปลงเป็น datetime ส่วนคอลัมน์เป็น datetime อยู่แล้ว จึงไม่ควรแก้ด้วยตัดเวลา/เปลี่ยนเป็น CONVERT(varchar,date) ที่คอลัมน์
- แผน IPD รอบแรกมี PAGEIOLATCH_SH และ IO_COMPLETION มาก ไม่มี LCK_* ในแผนที่เก็บและ GrantWaitTime=0 จึงมีหลักฐานเรื่อง I/O และ sort spill มากกว่าเรื่องรอ connection/ล็อกในรอบนี้ ค่ารอรวมข้าม parallel workers ไม่ใช่ wall time

## ดัชนีที่ควรนำไปทดสอบต่อ (ยังไม่สร้าง)

ร่าง SQL อยู่ [requisition-index-candidates.sql](sql/requisition-index-candidates.sql) **ทุกคำสั่งอยู่ใน comment จึงไม่เปลี่ยนฐานแม้เปิดรันไฟล์โดยไม่แก้ comment**

1. **Candidate A — prescriptiondetail(departmentcode, ordercreatedate)** INCLUDE orderitemcode, orderitemname, orderqty, ordertype, sendmachine, printstatus ใช้ร่วมกัน IPD/D/C/ER/Fixed Stock/อาคารรังสี เริ่มด้วยเงื่อนไขห้องยา แล้ว seek ช่วงวันที่ และกรองสถานะจาก leaf ได้ ไม่ต้องสร้างแยกหนึ่งดัชนีต่อหน้า
2. **Candidate B — prescription(ordercreatedate, orderitemcode)** INCLUDE orderitemname, orderqty, IVStatus; filter `WHERE IVStatus IS NOT NULL` สำหรับอาคารเภสัชกรรม ลดการอ่าน non-IV และตัด lookup ที่เกิดเพราะข้อมูลรายงานไม่ครบใน INDEXIV1

ทั้งสองเป็น nonunique index ไม่แก้ JOIN/WHERE/SUM/กลุ่ม/สูตรแพ็ก ไม่ย้ายไปใช้ชื่อยา master ไม่รวม/ลบรหัสซ้ำ อย่างไรก็ดี ยังไม่ได้สร้างจริงหรือจำลอง hypothetical index บนฐาน จึง **ไม่มีตัวเลขยืนยันว่าจะเร็วขึ้นกี่เท่า และยังไม่ยืนยันข้อความแสดงทุกตัวอักษรหลังเปลี่ยนแผน** ต้องเทียบผลจริงบนฐานสำเนาก่อน

แผนมี missing-index estimated impact สูง แต่ไม่ใช้ตัวเลขนั้นอ้างเป็นความเร็วที่วัดได้ และไม่สร้างทุกคำแนะนำซึ่งซ้อนกัน แนวทางนี้สอดคล้องกับ [ข้อจำกัด missing-index suggestions ของ Microsoft](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/tune-nonclustered-missing-index-suggestions)

## ทดลองทางเลือก SQL โดยไม่แก้เว็บ/ฐานจริง

### บังคับใช้ดัชนีวันที่เดิม: ไม่แนะนำ

IPD เดือน ก.ย. ทดสอบ `WITH (INDEX(ordercreatedateindex))` อ่าน 1,779,045 pages เทียบกับแผนเดิมประมาณ 530k และทำ lookup 434,631 ครั้ง ผลข้อมูลเท่ากัน แต่เวลารอบ cache อุ่นประมาณ 4.99 วินาที จึงไม่ใช่การแก้ด้วยใส่ index hint ตามชื่อดัชนีที่มีอยู่

### HASH GROUP: เร็วขึ้นบางกรณี แต่ยังไม่ผ่านข้อกำหนดผลเหมือนเดิมทุกตัวอักษร

- ทดลองเฉพาะคำสั่ง audit `OPTION (HASH GROUP, RECOMPILE)` แทนของเดิม โดยคง WHERE/JOIN/SUM/ORDER BY/สูตรเดิม ไม่เปลี่ยน service ที่เว็บใช้
- เดือน ก.ย. เปรียบเทียบจำนวนแถวและ SHA-256 ของ multiset ทุก raw field (คงจำนวนแถวซ้ำ) ครบ **24/24 กรณีตรงกัน** ไม่ใช่เทียบเพียงยอดรวม
- IPD ชั้น 4 วัดแบบสลับแผนขณะ cache อุ่น 3 คู่: เดิม 3.719/3.084/3.408 วินาที; HASH GROUP 1.435/1.285/2.036 วินาที ค่ากลาง **3.408 → 1.435 วินาที** ไม่พบ sort spill ในแผนทดลอง อย่างไรก็ดี logical reads ยังประมาณ 530k เพราะยัง scan ตาราง และขอ memory grant เพิ่มจาก 23,744 KB เป็น 42,400 KB
- ไม่อ้างว่า 22 วินาทีรอบแรก → 1 วินาทีทั้งหมดเป็นผลจาก hint: รอบแรกมีการอ่านดิสก์/read-ahead มาก รอบหลังได้ประโยชน์จาก cache และภาระระบบต่างกัน
- ตรวจเพิ่ม IPD 1 ก.ค.–30 ก.ย.: ทั้งสองได้ **851 แถว** และยอด/field อื่นตรงกัน แต่ **orderitemname 6 แถวต่างเฉพาะตัวพิมพ์ใหญ่–เล็ก** ยืนยันด้วยรัน query เดิม 2 รอบ และ HASH GROUP 2 รอบ ผลแต่ละแบบคงเดิมในรอบตรวจ จึงไม่ใช่หลักฐานว่า query ใหม่ตรงทุก field
- คอลัมน์ชื่อยาใช้ `Thai_CI_AS` ซึ่งถืออักษรใหญ่–เล็กเท่ากัน สอดคล้องกับการที่ GROUP BY รวมรูปสะกดต่าง case เป็นกลุ่มเดียว แล้วแผน aggregate เลือกข้อความตัวแทนต่างกัน ([Microsoft: collation and case sensitivity](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support)) การอธิบายตัวแทนเป็นข้อวิเคราะห์จากผล/แผน ไม่ใช่เหตุผลให้เปลี่ยนชื่อยาหรือใช้ UPPER/LOWER ทั้งรายงาน
- การทดลองจึง **ยังไม่แนะนำให้เปิดใช้ HASH GROUP จริงหรือใช้กับทุกหน้า** ต้องกำหนดเกณฑ์ข้อความตัวแทนให้ตรงต้นฉบับและตรวจช่วงอื่นก่อน การเปลี่ยนดัชนีก็อาจเปลี่ยนแผน/ข้อความตัวแทนเช่นกัน จึงต้องผ่านเงื่อนไขเทียบผลนี้ด้วย

## สถิติและสภาพแวดล้อม

- SQL Server 2017 `14.0.1000.169`, Standard, database compatibility 100; auto create/update stats เปิด แต่ read committed snapshot ปิด ข้อมูลนี้เป็นสภาพที่อ่านพบ **ไม่ได้เปลี่ยนค่าใด**
- สถิติวันที่ของ prescriptiondetail แบบ auto เพิ่งปรับ 22 ต.ค. ขณะที่สถิติ ordercreatedateindex ปรับ 1 ต.ค. และสถิติ departmentcode ปรับ 2 ต.ค. มี modification ประมาณ 329k จึงควรประเมินสถิติเฉพาะตัว ไม่สรุปว่าสถิติทุกตัวเก่าหรือสั่ง FULLSCAN ทั้งฐาน
- ms_drug.sendStore/sendF3F4 stats ปรับ 6/14 ต.ค. ตามลำดับ แต่แผนชั้น 4 ประเมิน master ประมาณ 619 แถว เทียบจริง 1,750 และประเมิน input ที่ต้อง sort ต่ำกว่าจริง มีความเป็นไปได้เรื่องความสัมพันธ์ของคอลัมน์/estimator; การเพิ่ม composite stats หรือปรับ compatibility ต้องทดสอบแยก ไม่ใช่เปลี่ยนทั้งฐานในงานนี้
- INDEXIV1 stats ปรับ 22 ต.ค. แล้ว แต่ปัญหา lookup ยังอยู่ แสดงว่าปรับ stats อย่างเดียวไม่เติมคอลัมน์ที่ index ขาด

## งานที่ควรทำถัดไปและเกณฑ์ยอมรับ

1. ทดสอบ Candidate A/B บนฐานสำเนาที่แยกจากใช้งานจริง วัด reads/CPU/spill/memory/เวลาและต้นทุนพื้นที่/การเขียน รวม workload Windows เดิม ไม่ลบหรือแทนดัชนีเดิมจากชื่อคล้ายกัน
2. เทียบทุก raw field/จำนวนแถวซ้ำ/ข้อความตัวแทน/ลำดับตามชื่อเดิม และผล CInt/Pack ของรายงาน ครบ 4 ประเภท วันเดียว/เดือน/หลายเดือน ทั้ง branch ก่อน/หลัง 08:00 รวมกรณีไม่มีข้อมูลและข้อมูล master ผิดปกติ
3. เฉพาะเมื่อผ่านทั้งประสิทธิภาพและผลลัพธ์ จึงพิจารณานำดัชนี/SQL ที่เลือกไปใช้จริง การเพิ่มดัชนีจะไม่รับประกันข้อความทุกตัวอักษรโดยไม่ทดสอบเพราะประเด็น case ข้างต้น

รอบนี้เพิ่มเพียงสคริปต์ audit/สรุปผล/ร่างดัชนีแบบ comment ตรวจ syntax ของสคริปต์และตรวจหลักฐานออฟไลน์ผ่านแล้ว ไม่มี application change ใหม่ ไม่ commit/deploy ไม่เชื่อม MySQL
