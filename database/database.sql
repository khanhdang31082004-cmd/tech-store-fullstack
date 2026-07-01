-- =========================================================================
-- ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
-- FILE SCRIPT: database.sql - Khởi tạo cấu trúc bảng và dữ liệu mẫu
-- =========================================================================

-- Khởi tạo Database cho hệ thống Tech Store với bảng mã UTF-8 hỗ trợ tiếng Việt đầy đủ
CREATE DATABASE IF NOT EXISTS `tech_store` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tech_store`;

-- ---------------------------------------------------------
-- 1. BẢNG roles (Phân quyền người dùng: admin hoặc user)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: Tự động tăng
  `role_name` VARCHAR(50) NOT NULL UNIQUE -- Tên vai trò (admin, user) - Phải duy nhất
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 2. BẢNG stores (Thông tin các chi nhánh cửa hàng)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID cửa hàng
  `store_name` VARCHAR(100) NOT NULL, -- Tên cửa hàng
  `address` VARCHAR(255) NOT NULL, -- Địa chỉ chi nhánh
  `phone` VARCHAR(20) DEFAULT NULL -- Số điện thoại chi nhánh
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 3. BẢNG users (Tài khoản đăng nhập hệ thống)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID tài khoản
  `username` VARCHAR(50) NOT NULL UNIQUE, -- Tên đăng nhập (duy nhất)
  `password` VARCHAR(255) NOT NULL, -- Mật khẩu (sẽ được mã hóa bcrypt ở Backend)
  `email` VARCHAR(100) NOT NULL UNIQUE, -- Địa chỉ email (duy nhất)
  `role_id` INT NOT NULL, -- Khóa ngoại: Liên kết đến bảng vai trò (roles)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo tài khoản tự động
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE -- Khóa ngoại ràng buộc
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 4. BẢNG customers (Thông tin cá nhân chi tiết của khách hàng)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID khách hàng
  `user_id` INT NOT NULL UNIQUE, -- Khóa ngoại: Liên kết 1-1 với tài khoản đăng nhập (users)
  `full_name` VARCHAR(100) NOT NULL, -- Họ và tên khách hàng
  `phone` VARCHAR(20) DEFAULT NULL, -- Số điện thoại khách hàng
  `address` VARCHAR(255) DEFAULT NULL, -- Địa chỉ nhận hàng mặc định
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE -- Khóa ngoại ràng buộc
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 5. BẢNG categories (Danh mục sản phẩm: Laptop, Điện thoại...)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID danh mục
  `category_name` VARCHAR(100) NOT NULL UNIQUE, -- Tên danh mục (duy nhất)
  `description` TEXT DEFAULT NULL -- Mô tả danh mục sản phẩm
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 6. BẢNG products (Thông tin sản phẩm công nghệ chi tiết)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID sản phẩm
  `product_name` VARCHAR(150) NOT NULL, -- Tên sản phẩm thiết bị
  `description` TEXT DEFAULT NULL, -- Mô tả chi tiết thông số kỹ thuật sản phẩm
  `price` DECIMAL(15, 2) NOT NULL, -- Giá bán (kiểu số thực lưu trữ chính xác tiền tệ)
  `image_url` VARCHAR(500) DEFAULT NULL, -- Đường dẫn hình ảnh minh họa sản phẩm
  `stock_quantity` INT NOT NULL DEFAULT 0, -- Số lượng tồn kho (mặc định bằng 0)
  `category_id` INT DEFAULT NULL, -- Khóa ngoại: Thuộc danh mục nào (categories)
  `store_id` INT DEFAULT NULL, -- Khóa ngoại: Nằm ở chi nhánh nào (stores)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL, -- Nếu xóa danh mục, sản phẩm thành NULL
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL -- Nếu xóa cửa hàng, sản phẩm thành NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 7. BẢNG orders (Thông tin đơn đặt hàng của khách hàng)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID đơn hàng
  `customer_id` INT NOT NULL, -- Khóa ngoại: Thuộc về khách hàng nào (customers)
  `total_amount` DECIMAL(15, 2) NOT NULL, -- Tổng số tiền của toàn đơn hàng
  `status` ENUM('Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled') DEFAULT 'Pending', -- Trạng thái đơn đặt hàng
  `shipping_address` VARCHAR(255) NOT NULL, -- Địa chỉ giao hàng cụ thể
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE -- Xóa khách hàng xóa luôn đơn hàng
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 8. BẢNG order_details (Chi tiết các mặt hàng có trong đơn)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính
  `order_id` INT NOT NULL, -- Khóa ngoại: Thuộc đơn hàng nào (orders)
  `product_id` INT NOT NULL, -- Khóa ngoại: Sản phẩm nào được mua (products)
  `quantity` INT NOT NULL, -- Số lượng mua sản phẩm đó
  `price` DECIMAL(15, 2) NOT NULL, -- Đơn giá của sản phẩm tại thời điểm mua hàng
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE, -- Xóa đơn hàng xóa luôn chi tiết
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE -- Xóa sản phẩm xóa luôn chi tiết
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =========================================================================

-- 1. Chèn dữ liệu vai trò (Roles)
INSERT INTO `roles` (`id`, `role_name`) VALUES 
(1, 'admin'), -- Quyền Quản trị viên
(2, 'user');  -- Quyền Khách hàng bình thường

-- 2. Chèn dữ liệu cửa hàng (Stores)
INSERT INTO `stores` (`id`, `store_name`, `address`, `phone`) VALUES 
(1, 'Tech Store Q1', '123 Nguyễn Huệ, Quận 1, TP. HCM', '0281234567'),
(2, 'Tech Store Cầu Giấy', '456 Cầu Giấy, Quận Cầu Giấy, Hà Nội', '0241234567');

-- 3. Chèn dữ liệu tài khoản (Users)
-- Chú thích: Tài khoản demo admin/user sử dụng mật khẩu dạng plain text '123456' để dễ dàng kiểm thử
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role_id`) VALUES 
(1, 'admin', '123456', 'admin@techstore.com', 1), -- Tài khoản admin (mật khẩu: 123456)
(2, 'user', '123456', 'user@techstore.com', 2);  -- Tài khoản user (mật khẩu: 123456)

-- 4. Chèn thông tin khách hàng tương ứng (Customers)
INSERT INTO `customers` (`id`, `user_id`, `full_name`, `phone`, `address`) VALUES 
(1, 1, 'Hệ thống Quản trị viên', '0900000001', 'Văn phòng Tổng công ty Tech Store, TP. HCM'),
(2, 2, 'Nguyễn Văn Khách Hàng', '0912345678', '789 Đường 3/2, Quận 10, TP. HCM');

-- 5. Chèn danh mục sản phẩm thiết bị công nghệ (Categories)
INSERT INTO `categories` (`id`, `category_name`, `description`) VALUES 
(1, 'Laptop', 'Máy tính xách tay văn phòng, gaming, đồ họa'),
(2, 'Điện thoại', 'Điện thoại thông minh, smartphone mới nhất'),
(3, 'PlayStation', 'Máy chơi game console và phụ kiện PS'),
(4, 'Bàn phím cơ', 'Bàn phím cơ chơi game, văn phòng, custom'),
(5, 'Chuột gaming', 'Chuột gaming không dây, có dây, độ nhạy cao'),
(6, 'Màn hình', 'Màn hình máy tính chuyên game, đồ họa, văn phòng'),
(7, 'Tai nghe', 'Tai nghe chụp tai, tai nghe bluetooth, tai nghe gaming'),
(8, 'SSD', 'Ổ cứng lưu trữ SSD tốc độ cao SATA/NVMe');

-- 6. Chèn sản phẩm công nghệ mẫu vào bảng (Products)
INSERT INTO `products` (`id`, `product_name`, `description`, `price`, `image_url`, `stock_quantity`, `category_id`, `store_id`) VALUES 
-- Laptop
(1, 'Laptop ASUS ROG Zephyrus G14', 'CPU AMD Ryzen 9, RAM 16GB, SSD 1TB, RTX 4060, Màn hình 14 inch 120Hz.', 39990000.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', 15, 1, 1),
(2, 'MacBook Air M3 13 inch', 'Chip Apple M3, RAM 8GB, SSD 256GB, Màu Xám Không Gian cực sang trọng.', 27990000.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 25, 1, 2),

-- Điện thoại
(3, 'iPhone 15 Pro Max 256GB', 'Titan tự nhiên, chip A17 Pro siêu mạnh mẽ, camera zoom 5x ấn tượng.', 29990000.00, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500', 30, 2, 1),
(4, 'Samsung Galaxy S24 Ultra', 'RAM 12GB, SSD 256GB, Bút S-Pen tích hợp, chip Snapdragon 8 Gen 3.', 26990000.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 20, 2, 2),

-- PlayStation
(5, 'PlayStation 5 Slim Standard Edition', 'Phiên bản có ổ đĩa quang, dung lượng SSD 1TB, kèm 1 tay cầm DualSense.', 13490000.00, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500', 10, 3, 1),

-- Bàn phím cơ
(6, 'Bàn phím cơ Keychron K2 V2 Hot-swappable', 'Bàn phím cơ layout 75%, kết nối Bluetooth/Type-C, Switch Gateron Brown.', 1890000.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 50, 4, 2),
(7, 'Bàn phím cơ Razer BlackWidow V4 Pro', 'Switch Razer Green, có cụm núm xoay đa năng, led RGB Razer Chroma rực rỡ.', 5490000.00, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', 12, 4, 1),

-- Chuột gaming
(8, 'Chuột không dây Logitech G Pro X Superlight', 'Trọng lượng siêu nhẹ dưới 63g, cảm biến HERO 25K cực nhạy.', 3190000.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', 40, 5, 1),

-- Màn hình
(9, 'Màn hình ASUS ROG Strix XG27AQ', 'Kích thước 27 inch 2K QHD, tấm nền IPS 170Hz, thời gian phản hồi 1ms.', 8990000.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 8, 6, 2),

-- Tai nghe
(10, 'Tai nghe không dây Sony WH-1000XM5', 'Tai nghe chống ồn chủ động đỉnh cao, thời lượng pin lên đến 30 giờ.', 6990000.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 15, 7, 2),

-- SSD
(11, 'SSD Samsung 990 Pro 1TB PCIe NVMe M.2', 'Tốc độ đọc ghi lên tới 7450/6900 MB/s, độ bền bỉ hàng đầu phân khúc.', 2590000.00, 'https://images.unsplash.com/photo-1597872200319-3814424f5a37?w=500', 35, 8, 1);

-- 7. Chèn một số đơn đặt hàng mẫu để phục vụ thuyết trình báo cáo và vẽ biểu đồ dashboard
INSERT INTO `orders` (`id`, `customer_id`, `total_amount`, `status`, `shipping_address`) VALUES 
(1, 2, 33770000.00, 'Completed', '789 Đường 3/2, Quận 10, TP. HCM'), -- Đơn hàng hoàn thành
(2, 2, 13490000.00, 'Pending', '789 Đường 3/2, Quận 10, TP. HCM');    -- Đơn hàng đang chờ xử lý

-- 8. Chèn chi tiết các sản phẩm trong đơn hàng
INSERT INTO `order_details` (`order_id`, `product_id`, `quantity`, `price`) VALUES 
(1, 8, 1, 3190000.00),  -- Mua 1 chuột Logitech
(1, 11, 1, 2590000.00), -- Mua 1 SSD Samsung
(1, 2, 1, 27990000.00), -- Mua 1 Macbook Air M3
(2, 5, 1, 13490000.00); -- Mua 1 máy PlayStation 5 Slim
