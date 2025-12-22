# --- GIAI ĐOẠN 1: BUILD (Dùng Node.js) ---
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package.json trước để tận dụng cache của Docker
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code vào
COPY . .

# Thực hiện build (Tạo ra thư mục /dist hoặc /build)
RUN npm run build

# --- GIAI ĐOẠN 2: RUN (Dùng Nginx) ---
FROM nginx:alpine AS production-stage

# Copy file đã build từ giai đoạn 1 sang thư mục web của Nginx
# LƯU Ý: Nếu bạn dùng Vite, thư mục đích là /app/dist
# Nếu bạn dùng Create-React-App cũ, thư mục đích là /app/build
# Hãy kiểm tra dự án của bạn xem nó tạo ra 'dist' hay 'build' nhé!
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx mình vừa tạo ở Bước 1 vào trong Docker
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]