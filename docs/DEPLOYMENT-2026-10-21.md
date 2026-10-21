# Deployment — 21 ตุลาคม 2026

- Ubuntu: `192.168.222.206` (`pharmcare`)
- โปรเจกต์บนเซิร์ฟเวอร์: `/home/hitrix/pharmcare`
- URL: `https://phramcare.kkh.go.th/login`
- Release/images: `20261021T051156Z`
- Compose project: `pharmcare`
- Containers: `pharmcare-frontend-1`, `pharmcare-backend-1` — healthy
- Ubuntu Nginx: `/etc/nginx/sites-available/pharmcare` เปิดผ่าน `sites-enabled/pharmcare`
- เส้นทาง: Ubuntu Nginx `:80` → `127.0.0.1:8080` → frontend; `/api` และ `/dose` → backend `:3000`
- DNS และ HTTPS ใช้ตัวกลางโรงพยาบาลเดิม ไม่มีการเปลี่ยน DNS หรือใบรับรอง

## ผลตรวจ

- Backend tests ผ่าน 196/196 ทั้ง Windows และ Linux image (Node 22)
- Frontend production build ผ่าน และไฟล์ JS ที่โดเมนส่งกลับมี SHA256 ตรงกับไฟล์ที่ build ในเครื่อง
- ไม่พบ `http://localhost:3000` ใน production bundle และไม่เผยแพร่ sourcemaps
- MSSQL และ MySQL ผ่าน `SELECT 1` จากคอนเทนเนอร์ ไม่มี migration หรือแก้ข้อมูลธุรกิจ
- HTTPS `/login`, `/ipd`, `/healthz` และ `/api/login-options` ตอบ 200
- `/api/auth` ตอบ 401 เมื่อไม่มี session; ไฟล์ asset ที่ไม่มีอยู่ตอบ 404
- Backend รัน UID 1000 (`node`), ไม่พบ `.env` ภายใน image
- รูปยาที่ mount อ่านได้ ใช้ 7 ไฟล์ที่แนบมาก่อน

ยังไม่ได้ทดสอบ login ด้วยบัญชีบุคลากรหรือการแสดงข้อมูลผู้ป่วยจริง ผลตรวจนี้เป็นการยืนยัน deployment, routing และการเชื่อมต่อ ไม่ใช่การรับรองฟังก์ชันทางคลินิกครบทุกหน้า

## การเข้าถึงจากเครื่องผู้ใช้ผ่าน VPN

HTTPS ของโดเมนทดสอบจาก Ubuntu ผ่าน แต่จาก Windows เครื่องผู้ใช้ DNS ของโดเมนยังไม่คืน A record และเส้นทางไปตัวกลาง `10.0.4.44` รวมถึง DNS `10.0.4.115`, `10.0.4.124` ยังออก Wi-Fi (`172.20.10.1`) ไม่ผ่าน VPN การเรียก HTTP ไป Ubuntu โดยตรงจาก Windows ก็หมดเวลา ต้องให้เครือข่าย VPN รองรับตัวกลางผ่าน TCP 443 และ DNS ภายในผ่าน UDP/TCP 53 ด้วย ไม่ได้แก้ DNS หรือ routing ของ Windows ในงานนี้

## รูปยาเดิม

config เดิมเป็นไดรฟ์ `D:` บน Windows โดยไม่ได้ระบุชื่อเครื่อง/SMB share ไม่พบ mount รูปยาบน Ubuntu และทดสอบ TCP 445 ของเครื่อง Windows/MSSQL ที่ตั้งค่าไว้ (`192.168.0.144`) แล้วหมดเวลา จึงใช้รูป bundled ตามที่ผู้ใช้อนุญาต ไม่ได้ mount หรือเปลี่ยน Windows file sharing

## สำรองและการเปลี่ยนของเดิม

สำรองก่อนลบคอนเทนเนอร์ `supreme` เดิม:

`/web_data/pharmcare-backups/20261021T051156Z-12359`

มีไฟล์ images เก่า (`legacy-images.tar.gz`), container definitions และ Nginx config เดิม เก็บเฉพาะ root เพราะ definitions อาจมี private configuration ลบเฉพาะคอนเทนเนอร์ `nginx`, `frontend`, `backend` ของ project `supreme` และ image tags ที่ใช้งาน ไม่ลบ volumes หรือฐานข้อมูล

deployment state: `/var/lib/pharmcare-deploy` — มี resolved compose พร้อม private environment จึงให้ root อ่านเท่านั้น

ระหว่างติดตั้งครั้งแรก การตรวจ HTTP หลัง reload Nginx เกิดก่อน worker ใช้ config ใหม่ ตัวติดตั้งคืน config/containers ให้อัตโนมัติ ปรับขั้นตอนให้รอสถานะ HTTP ที่คาดหวังแล้วติดตั้งซ้ำสำเร็จ มี backup รอบแรกเก็บไว้ที่ `20261021T051156Z-7211` ด้วย

## อัปเดตครั้งถัดไป

ส่งโค้ดใหม่ขึ้น `/home/hitrix/pharmcare` ให้ครบ เก็บ `back/.env` แล้วรัน:

```bash
cd /home/hitrix/pharmcare
sudo bash deploy/install.sh
```

ดูรายละเอียดตัวติดตั้งและตัวเลือกที่ [deploy/README.md](../deploy/README.md)
