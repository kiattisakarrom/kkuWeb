# # 👉 Stage 1: Build React app ด้วย Node.js 
# FROM node:18-alpine AS builder

# WORKDIR /app

# # คัดลอกไฟล์ package และติดตั้ง dependencies
# COPY package*.json ./
# RUN npm install

# # คัดลอก source code ทั้งหมดเข้าไปใน image
# COPY . .

# # สั่ง build Vite
# RUN npm run build

# # 👉 Stage 2: Serve ด้วย nginx
# FROM nginx:alpine

# # คัดลอกไฟล์ที่ build แล้วจาก stage แรก
# COPY --from=builder /app/dist /usr/share/nginx/html

# # optional: แก้ index.html ให้รองรับ SPA
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

# # 👉  ใช้ htpps ด้วย nginx chatgpt
# FROM node:18-alpine AS builder
# WORKDIR /app
# # คัดลอกไฟล์ package และติดตั้ง dependencies
# COPY package*.json ./
# RUN npm install
# # คัดลอก source code ทั้งหมดเข้าไปใน image
# COPY . .
# # สั่ง build Vite
# RUN npm run build
# # 👉 Stage 2: Serve ด้วย nginx
# FROM nginx:alpine
# # คัดลอกไฟล์ที่ build แล้วจาก stage แรก
# COPY --from=builder /app/dist /usr/share/nginx/html
# # optional: แก้ index.html ให้รองรับ SPA
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]


# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
