FROM nginx:alpine

# Thiết lập thư mục làm việc trong container của Nginx
WORKDIR /usr/share/nginx/html

# Xóa các file mặc định của Nginx
RUN rm -rf ./*

# Sao chép toàn bộ mã nguồn tĩnh của Frontend vào thư mục phân phối của Nginx
COPY . .

# Expose port 80 mặc định của Nginx
EXPOSE 80

# Khởi chạy Nginx ở chế độ background off để container hoạt động liên tục
CMD ["nginx", "-g", "daemon off;"]
