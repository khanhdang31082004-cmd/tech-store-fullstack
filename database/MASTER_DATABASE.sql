-- =========================================================================
-- MÔ TẢ: BẢN HOÀN THIỆN KIẾN TRÚC - SIẾT CHẶT LOGIC, 3NF VÀ RÀNG BUỘC
-- =========================================================================

USE `railway`;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Tắt check khóa ngoại để có thể DROP bảng dễ dàng khi reset dữ liệu
SET FOREIGN_KEY_CHECKS = 0;

-- (Tùy chọn) Xóa các bảng cũ nếu muốn làm mới hoàn toàn để dùng INSERT chuẩn
DROP TABLE IF EXISTS `order_details`, `orders`, `products`, `categories`, `customers`, `users`, `stores`, `roles`;

-- =========================
-- 1. TẠO CẤU TRÚC BẢNG (TÍCH HỢP INDEX & CONSTRAINTS)
-- =========================

-- Bảng Vai trò
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Cửa hàng
CREATE TABLE `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `store_name` VARCHAR(100) NOT NULL UNIQUE, -- [FIXED] Không cho phép trùng tên cửa hàng
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Tài khoản hệ thống
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, 
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role_id` INT NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) UNIQUE DEFAULT NULL, 
  `hometown` VARCHAR(100) DEFAULT NULL,
  `store_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL,
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Khách hàng
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  -- [FIXED] Đã loại bỏ phone và address để chuẩn hóa 3NF (dùng users.phone hoặc orders.recipient_phone)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Danh mục
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Sản phẩm
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(15, 2) NOT NULL, 
  `image_url` VARCHAR(500) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `category_id` INT DEFAULT NULL,
  `store_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `chk_products_price` CHECK (`price` > 0), 
  CONSTRAINT `chk_products_stock` CHECK (`stock_quantity` >= 0), 
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `idx_unique_product_store` (`product_name`, `store_id`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Đơn hàng
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `total_amount` DECIMAL(15, 2) NOT NULL, 
  `status` ENUM('Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'Returned', 'Refunded') DEFAULT 'Pending',
  `shipping_address` VARCHAR(255) NOT NULL,
  `recipient_name` VARCHAR(255) DEFAULT NULL,
  `recipient_phone` VARCHAR(30) DEFAULT NULL,
  `recipient_email` VARCHAR(255) DEFAULT NULL,
  `payment_method` ENUM('COD', 'Bank Transfer', 'Credit Card', 'VNPay', 'MoMo') DEFAULT 'COD',
  `notes` TEXT DEFAULT NULL,
  `cccd` VARCHAR(20) DEFAULT NULL,
  `store_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
  CONSTRAINT `chk_orders_total` CHECK (`total_amount` >= 0),
  -- [FIXED] Ràng buộc tính hợp lệ của số điện thoại và CCCD (Nếu có nhập thì phải chuẩn)
  CONSTRAINT `chk_orders_phone` CHECK (`recipient_phone` IS NULL OR CHAR_LENGTH(`recipient_phone`) >= 10),
  CONSTRAINT `chk_orders_cccd` CHECK (`cccd` IS NULL OR CHAR_LENGTH(`cccd`) = 12),
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL,
  INDEX `idx_orders_customer` (`customer_id`),
  INDEX `idx_orders_store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Chi tiết đơn hàng
CREATE TABLE `order_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(15, 2) NOT NULL, 
  CONSTRAINT `chk_details_quantity` CHECK (`quantity` > 0), 
  CONSTRAINT `chk_details_price` CHECK (`price` > 0), 
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  -- [FIXED] Ngăn chặn việc chèn 2 dòng trùng sản phẩm trong 1 đơn hàng
  UNIQUE KEY `idx_unique_order_product` (`order_id`, `product_id`),
  INDEX `idx_order_details_order` (`order_id`),
  INDEX `idx_order_details_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;


-- =========================
-- 2. INSERT DỮ LIỆU (LOẠI BỎ IGNORE)
-- =========================
-- Dùng INSERT chuẩn vì ta đã thiết kế script hỗ trợ DROP bảng sạch sẽ ở trên.
-- Nếu update dữ liệu có sẵn, có thể chuyển sang ON DUPLICATE KEY UPDATE.

INSERT INTO `stores` (`id`, `store_name`, `address`, `phone`) VALUES 
(1, 'Tech Store Q1', '123 Nguyễn Huệ, Quận 1, TP. HCM', '0281234567'),
(2, 'Tech Store Cầu Giấy', '456 Cầu Giấy, Quận Cầu Giấy, Hà Nội', '0241234567');

INSERT INTO `roles` (`id`, `role_name`) VALUES 
(1, 'admin'), (2, 'user'), (3, 'store_owner'), (4, 'manager'), (5, 'staff');

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role_id`, `full_name`, `phone`, `hometown`, `store_id`) VALUES 
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7hw9ICR8QRQQ582LRnwFPbS', 'admin@techstore.com', 1, 'Quản Trị Viên Hệ Thống', '0901111111', 'TP.HCM', 1),
(2, 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7hw9ICR8QRQQ582LRnwFPbS', 'user@techstore.com', 2, 'Nguyễn Văn Khánh Hàng', '0905555555', 'Bình Dương', NULL),
(3, 'owner', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7hw9ICR8QRQQ582LRnwFPbS', 'owner@techstore.com', 3, 'Chủ Cửa Hàng Demo', '0902222222', 'Hà Nội', 1);

INSERT INTO `categories` (`id`, `category_name`, `description`) VALUES 
(1, 'Laptop', 'Máy tính xách tay văn phòng, gaming, đồ họa'),
(2, 'Điện thoại', 'Điện thoại thông minh, smartphone mới nhất'),
(3, 'PlayStation', 'Máy chơi game console và phụ kiện PS');

INSERT INTO `products` (`id`, `product_name`, `description`, `price`, `image_url`, `stock_quantity`, `category_id`, `store_id`) VALUES
(1, 'Laptop ASUS ROG Zephyrus G14 2024', 'AMD Ryzen 9 8945HS, RTX 4070.', 39000000.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', 26, 1, 1),
(2, 'MacBook Air M3 13 inch', 'Chip Apple M3, RAM 8GB, SSD 256GB.', 29000000.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 38, 1, 2),
(5, 'PlayStation 5 Slim Standard Edition', 'PS5 Slim nhỏ hơn 30%, SSD 1TB.', 13500000.00, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600', 48, 3, 1);

-- Khách hàng (Đã bỏ phone/address)
INSERT INTO `customers` (`id`, `user_id`, `full_name`) VALUES 
(2, 2, 'Nguyễn Văn Khánh Hàng');

-- Đơn hàng (Kèm recipient_phone hợp lệ)
INSERT INTO `orders` (`id`, `customer_id`, `total_amount`, `status`, `shipping_address`, `recipient_phone`, `payment_method`, `store_id`) VALUES 
(1, 2, 29000000.00, 'Completed', '789 Đường 3/2, Quận 10, TP. HCM', '0905555555', 'VNPay', 1), 
(2, 2, 13500000.00, 'Pending', '789 Đường 3/2, Quận 10, TP. HCM', '0905555555', 'COD', 2);

-- Chi tiết đơn hàng
INSERT INTO `order_details` (`order_id`, `product_id`, `quantity`, `price`) VALUES 
(1, 2, 1, 29000000.00),  
(2, 5, 1, 13500000.00);