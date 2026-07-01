# TÀI LIỆU ĐẶC TẢ CHI TIẾT API ENDPOINTS

Dưới đây là tài liệu mô tả chi tiết các API được xây dựng trong lớp Backend của dự án. Tất cả các yêu cầu gửi dữ liệu dạng POST/PUT đều sử dụng định dạng JSON (`Content-Type: application/json`).

---

## 1. YÊU CẦU CHUNG VỀ XÁC THỰC
Với các API yêu cầu đăng nhập, bạn cần gửi kèm JWT Token trong header của HTTP Request theo định dạng:
```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 2. API XÁC THỰC (AUTHENTICATION)

### 2.1 Đăng ký tài khoản (Register)
* **Endpoint:** `/api/auth/register`
* **Method:** `POST`
* **Access:** Public
* **Request Body:**
```json
{
  "username": "user123",
  "password": "mysecretpassword",
  "email": "user123@example.com",
  "full_name": "Trần Văn A",
  "phone": "0987654321",
  "address": "123 Đường Láng, Đống Đa, Hà Nội"
}
```
* **Response thành công (201 Created):**
```json
{
  "message": "Đăng ký tài khoản thành công!"
}
```
* **Response thất bại (409 Conflict):**
```json
{
  "message": "Tên đăng nhập hoặc Email đã tồn tại trên hệ thống."
}
```

### 2.2 Đăng nhập (Login)
* **Endpoint:** `/api/auth/login`
* **Method:** `POST`
* **Access:** Public
* **Request Body:**
```json
{
  "username": "admin",
  "password": "123"
}
```
* **Response thành công (200 OK):**
```json
{
  "message": "Đăng nhập thành công!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@techstore.com",
    "role_name": "admin"
  }
}
```
* **Response thất bại (401 Unauthorized):**
```json
{
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác."
}
```

---

## 3. API SẢN PHẨM & DANH MỤC (PRODUCTS & CATEGORIES)

### 3.1 Lấy danh sách sản phẩm
* **Endpoint:** `/api/products`
* **Method:** `GET`
* **Access:** Public
* **Query Parameters (Tùy chọn):**
  - `category_id` (số nguyên): Lọc sản phẩm theo danh mục.
  - `search` (chuỗi): Tìm kiếm sản phẩm theo tên.
  - `limit` (số nguyên): Số lượng sản phẩm trên một trang.
  - `page` (số nguyên): Số thứ tự trang cần lấy (mặc định là 1).
* **Response thành công (200 OK):**
```json
[
  {
    "id": 1,
    "product_name": "Laptop ASUS ROG Zephyrus G14",
    "description": "CPU AMD Ryzen 9...",
    "price": "39990000.00",
    "image_url": "https://images.unsplash.com...",
    "stock_quantity": 15,
    "category_id": 1,
    "store_id": 1,
    "created_at": "2026-07-01T10:48:43.000Z",
    "category_name": "Laptop",
    "store_name": "Tech Store Q1"
  }
]
```

### 3.2 Lấy chi tiết sản phẩm
* **Endpoint:** `/api/products/:id`
* **Method:** `GET`
* **Access:** Public
* **Response thành công (200 OK):**
```json
{
  "id": 1,
  "product_name": "Laptop ASUS ROG Zephyrus G14",
  "description": "CPU AMD Ryzen 9...",
  "price": "39990000.00",
  "image_url": "https://images.unsplash.com...",
  "stock_quantity": 15,
  "category_id": 1,
  "store_id": 1,
  "created_at": "2026-07-01T10:48:43.000Z",
  "category_name": "Laptop",
  "store_name": "Tech Store Q1"
}
```
* **Response thất bại (404 Not Found):**
```json
{
  "message": "Không tìm thấy sản phẩm yêu cầu."
}
```

### 3.3 Lấy danh sách danh mục
* **Endpoint:** `/api/categories`
* **Method:** `GET`
* **Access:** Public
* **Response thành công (200 OK):**
```json
[
  {
    "id": 1,
    "category_name": "Laptop",
    "description": "Máy tính xách tay văn phòng, gaming, đồ họa"
  }
]
```

---

## 4. API THÔNG TIN CÁ NHÂN (PROFILE)

### 4.1 Lấy thông tin cá nhân
* **Endpoint:** `/api/profile`
* **Method:** `GET`
* **Access:** Đăng nhập (Yêu cầu Token)
* **Response thành công (200 OK):**
```json
{
  "id": 2,
  "username": "user",
  "email": "user@techstore.com",
  "role_id": 2,
  "full_name": "Nguyễn Văn Khách Hàng",
  "phone": "0912345678",
  "address": "789 Đường 3/2, Quận 10, TP. HCM"
}
```

### 4.2 Cập nhật thông tin cá nhân
* **Endpoint:** `/api/profile`
* **Method:** `PUT`
* **Access:** Đăng nhập (Yêu cầu Token)
* **Request Body:**
```json
{
  "full_name": "Nguyễn Văn Khách Hàng Mới",
  "phone": "0900000000",
  "address": "111 Cách Mạng Tháng 8, Quận 3, TP. HCM",
  "email": "user_new@techstore.com"
}
```
* **Response thành công (200 OK):**
```json
{
  "message": "Cập nhật thông tin cá nhân thành công!"
}
```

---

## 5. API ĐƠN HÀNG (ORDERS)

### 5.1 Gửi đơn đặt hàng (Checkout)
* **Endpoint:** `/api/orders`
* **Method:** `POST`
* **Access:** Đăng nhập (Yêu cầu Token)
* **Request Body:**
```json
{
  "shipping_address": "111 Cách Mạng Tháng 8, Quận 3, TP. HCM",
  "items": [
    {
      "product_id": 8,
      "quantity": 2
    },
    {
      "product_id": 11,
      "quantity": 1
    }
  ]
}
```
* **Response thành công (201 Created):**
```json
{
  "message": "Đặt hàng thành công!",
  "order_id": 3,
  "total_amount": 8970000
}
```
* **Response thất bại (400 Bad Request - Ví dụ hết hàng):**
```json
{
  "message": "Sản phẩm \"Chuột không dây Logitech G Pro X Superlight\" không đủ số lượng tồn kho (Còn lại: 1, Đặt mua: 2)."
}
```

### 5.2 Xem danh sách đơn hàng đã đặt
* **Endpoint:** `/api/orders`
* **Method:** `GET`
* **Access:** Đăng nhập (Yêu cầu Token)
* **Response thành công (200 OK):**
```json
[
  {
    "id": 1,
    "customer_id": 2,
    "total_amount": "34880000.00",
    "status": "Completed",
    "shipping_address": "789 Đường 3/2, Quận 10, TP. HCM",
    "created_at": "2026-07-01T10:48:43.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 8,
        "quantity": 1,
        "price": "3190000.00",
        "product_name": "Chuột không dây Logitech G Pro X Superlight",
        "image_url": "https://images.unsplash.com..."
      }
    ]
  }
]
```

---

## 6. API QUẢN TRỊ (ADMIN ONLY)

### 6.1 Lấy toàn bộ sản phẩm quản lý
* **Endpoint:** `/api/admin/products`
* **Method:** `GET`
* **Access:** Admin (Yêu cầu Admin Token)
* **Response tương tự:** `/api/products` nhưng sắp xếp mặc định theo ID mới nhất và đầy đủ trường thông tin.

### 6.2 Thêm sản phẩm mới
* **Endpoint:** `/api/admin/products`
* **Method:** `POST`
* **Access:** Admin (Yêu cầu Admin Token)
* **Request Body:**
```json
{
  "product_name": "Chuột Corsair M65 RGB Ultra",
  "description": "Chuột gaming cao cấp cảm biến 26.000 DPI.",
  "price": 2190000,
  "image_url": "https://images.unsplash.com...",
  "stock_quantity": 20,
  "category_id": 5,
  "store_id": 1
}
```
* **Response thành công (201 Created):**
```json
{
  "message": "Thêm sản phẩm mới thành công!",
  "product_id": 12
}
```

### 6.3 Sửa sản phẩm
* **Endpoint:** `/api/admin/products/:id`
* **Method:** `PUT`
* **Access:** Admin (Yêu cầu Admin Token)
* **Request Body tương tự POST `/api/admin/products`**
* **Response thành công (200 OK):**
```json
{
  "message": "Cập nhật sản phẩm thành công!"
}
```

### 6.4 Xóa sản phẩm
* **Endpoint:** `/api/admin/products/:id`
* **Method:** `DELETE`
* **Access:** Admin (Yêu cầu Admin Token)
* **Response thành công (200 OK):**
```json
{
  "message": "Xóa sản phẩm thành công!"
}
```

### 6.5 Xem tất cả đơn hàng hệ thống
* **Endpoint:** `/api/admin/orders`
* **Method:** `GET`
* **Access:** Admin (Yêu cầu Admin Token)
* **Response thành công (200 OK):** Trả về mảng chứa toàn bộ đơn hàng của tất cả khách hàng cùng thông tin liên hệ và các mặt hàng của từng đơn.

### 6.6 Cập nhật trạng thái đơn hàng
* **Endpoint:** `/api/admin/orders/:id`
* **Method:** `PUT`
* **Access:** Admin (Yêu cầu Admin Token)
* **Request Body:**
```json
{
  "status": "Shipped" // 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'
}
```
* **Response thành công (200 OK):**
```json
{
  "message": "Đã cập nhật trạng thái đơn hàng sang: Shipped"
}
```

### 6.7 Xem thống kê Dashboard
* **Endpoint:** `/api/admin/dashboard`
* **Method:** `GET`
* **Access:** Admin (Yêu cầu Admin Token)
* **Response thành công (200 OK):**
```json
{
  "revenue": 34880000,
  "orders": 2,
  "products": 11,
  "customers": 1,
  "orderStatusStats": [
    { "status": "Completed", "count": 1 },
    { "status": "Pending", "count": 1 }
  ],
  "topSellingProducts": [
    {
      "id": 2,
      "product_name": "MacBook Air M3 13 inch",
      "sold_quantity": 1,
      "total_sales": "27990000.00",
      "price": "27990000.00",
      "image_url": "https://images.unsplash.com..."
    }
  ],
  "revenueByCategory": [
    { "category_name": "Laptop", "revenue": "27990000.00" }
  ],
  "recentOrders": [
    {
      "id": 2,
      "total_amount": "13490000.00",
      "status": "Pending",
      "created_at": "2026-07-01T10:48:43.000Z",
      "full_name": "Nguyễn Văn Khách Hàng"
    }
  ]
}
```

---

## 7. API HEALTH CHECK

### 7.1 Kiểm tra hoạt động Server
* **Endpoint:** `/api/health`
* **Method:** `GET`
* **Access:** Public
* **Response thành công (200 OK):**
```json
{
  "status": "OK",
  "message": "Server đang hoạt động bình thường.",
  "database": "Connected",
  "timestamp": "2026-07-01T10:49:15.000Z"
}
```
