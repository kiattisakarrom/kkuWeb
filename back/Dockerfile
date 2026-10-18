# # ใช้ Node.js runtime เป็นอิมเมจฐาน
# FROM node:16

# # ตั้งค่าไดเรกทอรีทำงานในคอนเทนเนอร์
# WORKDIR /app

# # คัดลอก package.json และ package-lock.json (หรือ yarn.lock) ก่อน
# COPY package*.json ./

# # ติดตั้งแพ็คเกจที่ต้องการ
# RUN npm install

# # คัดลอกโค้ดแอปพลิเคชันที่เหลือ
# COPY . .

# # เปิดพอร์ตที่แอปพลิเคชันใช้
# EXPOSE 3000

# # กำหนดคำสั่งในการรันแอปพลิเคชัน
# CMD ["node", "index.js"]


# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]


