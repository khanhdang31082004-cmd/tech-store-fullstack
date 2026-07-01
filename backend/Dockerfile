FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (nếu có) vào container
COPY package*.json ./

# Cài đặt dependencies cho production (bỏ qua devDependencies để tối ưu dung lượng)
RUN npm ci --only=production

# Sao chép toàn bộ mã nguồn backend vào container
COPY . .

# Mở cổng port của backend
EXPOSE 5000

# Khởi chạy server API
CMD ["npm", "start"]
