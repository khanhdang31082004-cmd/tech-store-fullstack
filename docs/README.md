# Đồ án: Website Bán Máy Tính và Thiết Bị Công Nghệ

Dự án này là hệ thống website thương mại điện tử chuyên cung cấp các mặt hàng công nghệ (Laptop, Điện thoại, PlayStation, Bàn phím cơ, Chuột gaming, Màn hình, Tai nghe, SSD) được xây dựng theo chuẩn kiến trúc 3 tầng (3-Tier Architecture) hoàn chỉnh.

---

## 🌐 Môi trường Cloud (Dự án nộp)

Hệ thống hiện đang được deploy và chạy thực tế trên môi trường Cloud:

- **Frontend (Vercel):** [https://tech-store-fullstack-plum.vercel.app](https://tech-store-fullstack-plum.vercel.app)
- **Backend API (Railway):** [https://tech-store-fullstack-production.up.railway.app](https://tech-store-fullstack-production.up.railway.app)
- **Health Check API:** [https://tech-store-fullstack-production.up.railway.app/api/health](https://tech-store-fullstack-production.up.railway.app/api/health)
- **Products API:** [https://tech-store-fullstack-production.up.railway.app/api/products](https://tech-store-fullstack-production.up.railway.app/api/products)
- **Database (Railway MySQL):** (Đã kết nối trực tiếp với Backend)

File cơ sở dữ liệu chính thức: `database/MASTER_DATABASE.sql`.

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

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML, CSS, JavaScript (Vanilla), TailwindCSS (via CDN), Fetch API, deploy trên Vercel.
- **Backend:** Node.js, Express.js, `mysql2/promise`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, deploy trên Railway.
- **Database:** MySQL (trên Railway).

---

## 📋 Danh sách API Endpoints chính

| Method | Endpoint | Quyền truy cập | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Đăng ký tài khoản User mới |
| **POST** | `/api/auth/login` | Public | Đăng nhập hệ thống, trả về JWT Token |
| **GET** | `/api/products` | Public | Lấy danh sách sản phẩm |
| **GET** | `/api/products/:id` | Public | Lấy chi tiết thông tin của 1 sản phẩm |
| **GET** | `/api/categories` | Public | Lấy danh sách toàn bộ danh mục |
| **GET** | `/api/profile` | Đăng nhập | Lấy thông tin cá nhân |
| **PUT** | `/api/profile` | Đăng nhập | Cập nhật thông tin cá nhân |
| **POST** | `/api/orders` | Đăng nhập | Gửi đơn đặt hàng mới |
| **GET** | `/api/orders` | Đăng nhập | Xem danh sách đơn hàng đã đặt |
| **GET** | `/api/admin/products` | Admin | Lấy danh sách sản phẩm (Admin) |
| **POST** | `/api/admin/products` | Admin | Thêm mới một sản phẩm |
| **PUT** | `/api/admin/products/:id`| Admin | Sửa thông tin sản phẩm |
| **DELETE**| `/api/admin/products/:id`| Admin | Xóa sản phẩm |
| **GET** | `/api/admin/orders` | Admin | Xem toàn bộ đơn hàng (Admin) |
| **PUT** | `/api/admin/orders/:id` | Admin | Cập nhật trạng thái đơn hàng |
| **GET** | `/api/admin/dashboard`| Admin | Xem số liệu tổng hợp doanh thu |
| **GET** | `/api/health` | Public | Kiểm tra kết nối server & database |

---

## 💻 Chạy local để kiểm thử

Nếu cần chạy dự án ở môi trường Local (máy tính cá nhân), bạn thực hiện theo các bước sau:

### 1. Database (MySQL)
1. Tạo database `tech_store` trong MySQL.
2. Import file `database/MASTER_DATABASE.sql`.

### 2. Backend
1. Cấu hình file `.env` dựa trên `.env.example`.
2. Chạy `npm install`.
3. Chạy `npm start` (hoặc `npm run dev`). Backend sẽ chạy ở `http://localhost:5000`.

### 3. Frontend
1. Cập nhật `API_BASE_URL` trong file JS về `http://localhost:5000` (nếu cần đổi từ cloud sang local).
2. Dùng Live Server mở `index.html` (thường ở `http://localhost:5500` hoặc `http://127.0.0.1:5500`).

*(Lưu ý: Các thiết lập Docker trong dự án cũng có thể được dùng cho môi trường Local bằng lệnh `docker compose up --build`)*
