# Đồ án: Website Bán Máy Tính và Thiết Bị Công Nghệ

Dự án này là hệ thống website thương mại điện tử chuyên cung cấp các mặt hàng công nghệ (Laptop, Điện thoại, PlayStation, Bàn phím cơ, Chuột gaming, Màn hình, Tai nghe, SSD) được xây dựng theo chuẩn kiến trúc 3 tầng (3-Tier Architecture) hoàn chỉnh.

---

## 🏗️ Kiến trúc 3 tầng (3-Tier Architecture)

1. **Frontend Layer (Giao diện người dùng):**
   - Công nghệ: HTML5, CSS3, JavaScript thuần, TailwindCSS CDN, Fetch API.
   - Chức năng: Tìm kiếm sản phẩm, lọc theo danh mục, giỏ hàng local, đăng ký/đăng nhập, trang cá nhân cập nhật thông tin và trang Dashboard quản trị cho Admin.

2. **Backend/API Layer (Lớp xử lý nghiệp vụ):**
   - Công nghệ: Node.js, Express.js, JWT (Json Web Token), bcryptjs (mã hóa mật khẩu), CORS.
   - Chức năng: Cung cấp API bảo mật cho Frontend, xử lý đăng ký, đăng nhập cấp token JWT, phân quyền truy cập Admin/User, bảo vệ dữ liệu giỏ hàng/đơn hàng, tính toán doanh thu Dashboard.

3. **Database Layer (Lớp cơ sở dữ liệu):**
   - Công nghệ: MySQL 8.x.
   - Cấu trúc gồm 8 bảng quan hệ ràng buộc khóa ngoại (Foreign Key) chặt chẽ: `roles`, `stores`, `users`, `customers`, `categories`, `products`, `orders`, `order_details`.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML, CSS, JavaScript (Vanilla), TailwindCSS (via CDN), Fetch API.
- **Backend:** Node.js, Express.js, `mysql2/promise` (Driver kết nối MySQL), `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`.
- **Database:** MySQL.
- **Containerization:** Docker & Dockerfile.

---

## 🔑 Tài khoản Demo mặc định

Các tài khoản dưới đây đã được mã hóa mật khẩu bằng bcrypt và chèn sẵn trong cơ sở dữ liệu:

- **Tài khoản Admin (Quản trị viên):**
  - **Username:** `admin`
  - **Password:** `123456`
- **Tài khoản User (Khách hàng mẫu):**
  - **Username:** `user`
  - **Password:** `123456`

---

## 🚀 Hướng dẫn chạy dự án dưới Local

### 1. Thiết lập Database (MySQL)
1. Mở phần mềm quản lý MySQL của bạn (như XAMPP, phpMyAdmin, MySQL Workbench, hoặc qua CLI).
2. Tạo một database mới tên là `tech_store`:
   ```sql
   CREATE DATABASE tech_store DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import (nhập) dữ liệu từ file [database.sql](../database/database.sql) vào database `tech_store` vừa tạo.

### 2. Thiết lập & Chạy Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Tạo file `.env` từ file `.env.example` và điều chỉnh các thông tin cấu hình phù hợp (đặc biệt là thông tin đăng nhập MySQL của bạn):
   ```bash
   cp .env.example .env
   ```
3. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
4. Khởi chạy API Server:
   - **Chế độ phát triển (Tự reload khi sửa code):** `npm run dev`
   - **Chế độ sản xuất:** `npm start`
5. Khi chạy thành công, API sẽ hoạt động tại địa chỉ: `http://localhost:5000`
   - Kiểm tra trạng thái kết nối DB: `http://localhost:5000/api/health`

### 3. Thiết lập & Chạy Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../frontend
   ```
2. Mở file `app.js` hoặc bất cứ file js nào có biến `API_BASE_URL` và đảm bảo biến này đang trỏ về đúng địa chỉ backend của bạn (mặc định: `http://localhost:5000`).
3. Khởi chạy file `index.html` bằng công cụ như **Live Server** trong VS Code để tránh lỗi CORS khi truy cập qua giao thức `file://`.
4. URL Frontend mặc định khi chạy Live Server thường là `http://localhost:5500` hoặc `http://127.0.0.1:5500`.


---

## 🐳 Hướng dẫn chạy dự án bằng Docker Compose (Khuyên dùng)

Hệ thống đã được cấu hình Docker hóa toàn diện. Chỉ với một câu lệnh duy nhất, toàn bộ hệ thống (Frontend, Backend, Database MySQL) sẽ tự động khởi tạo, liên kết mạng nội bộ, tự động tạo cơ sở dữ liệu `tech_store` và nhập sẵn bảng biểu cùng dữ liệu mẫu.

### Yêu cầu trước khi chạy
- Máy tính của bạn đã cài đặt **Docker** và **Docker Desktop** (hoặc Docker Compose CLI).

### Các bước chạy hệ thống
1. Đảm bảo Docker Desktop đã được mở và chạy bình thường dưới máy.
2. Mở terminal tại thư mục gốc của dự án (`chuyen de 1`) và chạy lệnh sau:
   ```bash
   docker compose up --build
   ```
3. Chờ Docker build các image và khởi chạy các container. Khi màn hình hiện thông báo `Kết nối MySQL Database thành công!` và server backend báo chạy ở port `5000` là quá trình khởi tạo hoàn tất.

### Kiểm tra các cổng kết nối
Sau khi chạy Docker Compose thành công, bạn có thể truy cập hệ thống qua các địa chỉ sau:
- **Giao diện Frontend (Nginx):** [http://localhost:8080](http://localhost:8080)
- **API Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Cơ sở dữ liệu MySQL:** Host `localhost`, Cổng truy cập ngoài `3307` (Tài khoản root / Mật khẩu: 123456).

---

## ☁️ Hướng dẫn Deploy dự án lên Cloud

### 1. Deploy Database MySQL lên Cloud (Aiven / PlanetScale)
- Đăng ký tài khoản miễn phí trên [Aiven.io](https://aiven.io/) hoặc [Tidbcloud.com](https://pingcap.com/).
- Tạo một Instance MySQL miễn phí.
- Kết nối tới Database Cloud qua CLI hoặc DBeaver và chạy nội dung file `database.sql` để dựng bảng và chèn dữ liệu mẫu.
- Lấy chuỗi thông tin kết nối (Host, User, Password, Port, Database name) để chuẩn bị điền vào cấu hình Backend.

### 2. Deploy Backend lên Render
1. Đăng tải mã nguồn của bạn lên một repository trên GitHub (ví dụ: `github-username/tech-store`).
2. Truy cập [Render.com](https://render.com/), đăng nhập bằng GitHub.
3. Nhấp vào **New +** -> Chọn **Web Service**.
4. Kết nối tới repository chứa dự án của bạn.
5. Thiết lập thông số:
   - **Name:** `tech-store-api`
   - **Root Directory:** `backend` (Cực kỳ quan trọng để Render biết tìm file code backend ở đâu)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Nhấp vào mục **Advanced** -> Chọn **Add Environment Variable** để điền các biến môi trường sau:
   - `PORT` = `5000`
   - `DB_HOST` = `<Địa chỉ IP/Host MySQL Cloud của bạn>`
   - `DB_PORT` = `<Cổng kết nối MySQL Cloud, ví dụ: 3306>`
   - `DB_USER` = `<Tài khoản MySQL Cloud>`
   - `DB_PASSWORD` = `<Mật khẩu MySQL Cloud>`
   - `DB_NAME` = `<Tên Database trên Cloud>`
   - `JWT_SECRET` = `<Chuỗi ký tự bảo mật bất kỳ của bạn>`
   - `FRONTEND_URL` = `<URL sau khi deploy Frontend trên Vercel>` (ví dụ: `https://tech-store-frontend.vercel.app`)
7. Bấm **Deploy Web Service** và chờ Render hoàn thành build. API Server của bạn sẽ có dạng: `https://tech-store-api.onrender.com`.

### 3. Deploy Frontend lên Vercel
1. Truy cập [Vercel.com](https://vercel.com/), kết nối tài khoản GitHub của bạn.
2. Bấm **Add New** -> Chọn **Project**.
3. Chọn Repository chứa mã nguồn.
4. Ở phần thiết lập cấu hình:
   - **Framework Preset:** Chọn `Other` (vì đây là dự án HTML/JS thuần).
   - **Root Directory:** Chọn thư mục `frontend`.
5. Bấm **Deploy**.
6. Khi quá trình hoàn tất, Vercel sẽ cung cấp một URL miễn phí dạng: `https://xxxx.vercel.app`.
7. **Lưu ý quan trọng:** Trước khi deploy hoặc sau khi deploy xong, bạn hãy cập nhật URL Backend (`API_BASE_URL` trong file javascript của frontend) thành URL API trên Render (`https://tech-store-api.onrender.com`). Đồng thời quay lại thiết lập cấu hình `FRONTEND_URL` trên Render để khớp với URL Vercel vừa nhận để giải quyết triệt để lỗi CORS.

---

## 📋 Danh sách API Endpoints chính

| Method | Endpoint | Quyền truy cập | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Đăng ký tài khoản User mới |
| **POST** | `/api/auth/login` | Public | Đăng nhập hệ thống, trả về JWT Token |
| **GET** | `/api/products` | Public | Lấy danh sách sản phẩm (hỗ trợ search, filter) |
| **GET** | `/api/products/:id` | Public | Lấy chi tiết thông tin của 1 sản phẩm |
| **GET** | `/api/categories` | Public | Lấy danh sách toàn bộ danh mục hàng hóa |
| **GET** | `/api/profile` | Đăng nhập | Lấy thông tin cá nhân của người dùng hiện tại |
| **PUT** | `/api/profile` | Đăng nhập | Cập nhật thông tin cá nhân của người dùng |
| **POST** | `/api/orders` | Đăng nhập | Gửi đơn đặt hàng mới |
| **GET** | `/api/orders` | Đăng nhập | Xem danh sách đơn hàng đã đặt của cá nhân |
| **GET** | `/api/admin/products` | Admin | Lấy danh sách sản phẩm phục vụ quản lý |
| **POST** | `/api/admin/products` | Admin | Thêm mới một sản phẩm công nghệ |
| **PUT** | `/api/admin/products/:id`| Admin | Sửa thông tin sản phẩm có sẵn |
| **DELETE**| `/api/admin/products/:id`| Admin | Xóa sản phẩm ra khỏi hệ thống |
| **GET** | `/api/admin/orders` | Admin | Xem danh sách đơn hàng của toàn hệ thống |
| **PUT** | `/api/admin/orders/:id` | Admin | Cập nhật trạng thái đơn hàng (Shipped, Cancelled...) |
| **GET** | `/api/admin/dashboard`| Admin | Xem số liệu tổng hợp doanh thu, biểu đồ |
| **GET** | `/api/health` | Public | Kiểm tra kết nối server & database |
