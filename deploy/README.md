# ติดตั้งบน Ubuntu ด้วย Docker และ Nginx เดิม

โดเมน: `https://phramcare.kkh.go.th`

```text
HTTPS → ตัวกลางโรงพยาบาล → Ubuntu Nginx :80
                              → 127.0.0.1:8080 → frontend (ไฟล์ที่ build แล้ว)
                                                   /api, /dose → backend:3000
```

ไม่เปิดพอร์ต API สู่เครือข่าย ไม่ใช้ Vite dev server และไม่เปิดคอนเทนเนอร์แย่งพอร์ต 80/443 กับ Nginx บน Ubuntu ชุด HTTPS/DNS ของโรงพยาบาลยังใช้เส้นทางเดิม

## สิ่งที่ต้องมี

- Ubuntu พร้อม Docker Engine, Docker Compose v2, Nginx, curl และ Python 3
- ใช้ได้ทั้ง `docker compose` และ `docker-compose` รุ่น v2 ที่มีอยู่บนเครื่องนี้
- เซิร์ฟเวอร์เข้าถึง Docker Hub, npm และ Debian packages เพื่อ build images
- เชื่อมต่อฐาน MSSQL และ MySQL ตาม config ที่ใช้จริงได้

## ติดตั้งครั้งแรก

นำโค้ดทั้งโปรเจกต์ไปไว้ เช่น `/home/hitrix/pharmcare` โดยไม่ต้องนำ `node_modules`, `dist` หรือ `.git` ไปด้วย ต้องนำไฟล์ใหม่ที่ยังไม่ commit ไปด้วยหากต้องการ deploy งานล่าสุด

```bash
cd /home/hitrix/pharmcare
cp back/.env.example back/.env  # เฉพาะกรณียังไม่มี .env
nano back/.env
chmod 600 back/.env
sudo bash deploy/install.sh --replace-legacy
```

กรอก MSSQL และ `JWT_SECRET` ใน `back/.env` ส่วน MySQL ใช้กับ OPD/LAB และ `IHOS_DUE_API_KEY` ใช้กับ IHOS DUE เก็บ secret เฉพาะ backend ห้ามใส่ใน Vite หรือ commit เข้า Git ตัว `.dockerignore` ป้องกัน `.env` ไม่ให้เข้า image

ตัวติดตั้งจะ build images, ทดสอบฐานข้อมูลด้วย `SELECT 1`, รอ health checks, ทดสอบ login-options, สำรอง Nginx แล้วค่อย reload ให้ใช้โปรเจกต์ใหม่ หากขั้นตอนก่อนเสร็จล้มเหลวจะพยายามคืน config และคอนเทนเนอร์รุ่นก่อน

`--replace-legacy` สำรองรายละเอียดและ images ก่อนลบเฉพาะคอนเทนเนอร์ชื่อ `nginx`, `frontend`, `backend` ที่มี Compose project label เป็น `supreme` ไม่ลบฐานข้อมูล ไม่ใช้ `prune` และไม่ลบ volumes หากพบ named volume จะหยุดให้ตรวจข้อมูลก่อน

## อัปเดตครั้งถัดไป

อัปโหลดโค้ดใหม่ให้ครบ เก็บ `back/.env` บนเซิร์ฟเวอร์ไว้ แล้วรัน:

```bash
cd /home/hitrix/pharmcare
sudo bash deploy/install.sh
```

แต่ละครั้งใช้ image tag ตามเวลา UTC ปัจจุบัน ข้อมูล deployment ที่มี secret อยู่ใน `/var/lib/pharmcare-deploy` (root เท่านั้น) สำรองอยู่ใน `/web_data/pharmcare-backups` หรือ `/var/backups/pharmcare` หากไม่มี `/web_data`

## รูปยา

ค่าเริ่มต้นใช้ 7 ไฟล์ใน `back/assets/checkout-drugs` แบบ read-only ไดรฟ์ `D:` ของ Windows ใช้บน Ubuntu ไม่ได้ ถ้ามีชุดภาพครบให้ระบุโฟลเดอร์ Linux:

```bash
sudo bash deploy/install.sh --drug-images /web_data/drug-pictures
```

ใช้ `--drug-images` เดิมทุกครั้งที่อัปเดต ไฟล์ต้องอ่านได้โดย UID 1000 ภายใน backend และต้องไม่มีข้อมูลผู้ป่วยปะปนในโฟลเดอร์รูปยา

## ตรวจหลังติดตั้ง

```bash
sudo docker-compose -p pharmcare -f /var/lib/pharmcare-deploy/compose.current.yml ps
sudo docker-compose -p pharmcare -f /var/lib/pharmcare-deploy/compose.current.yml logs --tail 50 backend
curl -I https://phramcare.kkh.go.th/login
```

หากเครื่องใช้ plugin ให้เปลี่ยน `docker-compose` เป็น `docker compose`

`/healthz` ตรวจเฉพาะว่าบริการตอบกลับได้ ไม่ยืนยันฐานข้อมูล ส่วนตัวติดตั้งตรวจฐานข้อมูลจริงและหน้า login-options แยกต่างหาก ไม่มีการทดสอบบันทึก แก้ไข หรือสร้างข้อมูลธุรกิจ

## สำรอง / คืนค่าก่อนติดตั้งครั้งแรก

ตำแหน่ง backup จะแสดงเมื่อเสร็จ มี `legacy-images.tar.gz`, `legacy-containers.json` (มี config ส่วนตัว ต้องให้ root อ่านเท่านั้น) และไฟล์ Nginx เก่าภายใต้ `nginx/`

หากต้องย้อนกลับหลังติดตั้งสำเร็จ ให้หยุด Compose project `pharmcare`, คืน Nginx จาก backup แล้วค่อย `nginx -t` และ reload ส่วน images เก่านำกลับได้ด้วย `gzip -dc legacy-images.tar.gz | docker load` ก่อนเรียก compose เดิมที่ `/home/hitrix/supreme/docker-compose.yml` ควรเลือกให้มี Nginx เพียงชุดเดียวรับพอร์ต 80 เพื่อไม่ให้ชนกันอีก
