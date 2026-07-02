
-- =========================================================================
-- FILE: database/MASTER_DATABASE.sql
-- MÔ TẢ: FILE GỘP TOÀN BỘ DATABASE (INIT, TABLES, DATA, CLEANUP)
-- =========================================================================

-- =========================
-- 1. KHỞI TẠO DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS `tech_store` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tech_store`;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =========================
-- 2. TẠO BẢNG (ADMIN SYSTEM)
-- =========================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: Tự động tăng
  `role_name` VARCHAR(50) NOT NULL UNIQUE -- Tên vai trò (admin, user) - Phải duy nhất
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID cửa hàng
  `store_name` VARCHAR(100) NOT NULL, -- Tên cửa hàng
  `address` VARCHAR(255) NOT NULL, -- Địa chỉ chi nhánh
  `phone` VARCHAR(20) DEFAULT NULL -- Số điện thoại chi nhánh
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID tài khoản
  `username` VARCHAR(50) NOT NULL UNIQUE, -- Tên đăng nhập (duy nhất)
  `password` VARCHAR(255) NOT NULL, -- Mật khẩu (sẽ được mã hóa bcrypt ở Backend)
  `email` VARCHAR(100) NOT NULL UNIQUE, -- Địa chỉ email (duy nhất)
  `role_id` INT NOT NULL, -- Khóa ngoại: Liên kết đến bảng vai trò (roles)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo tài khoản tự động
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE -- Khóa ngoại ràng buộc
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID khách hàng
  `user_id` INT NOT NULL UNIQUE, -- Khóa ngoại: Liên kết 1-1 với tài khoản đăng nhập (users)
  `full_name` VARCHAR(100) NOT NULL, -- Họ và tên khách hàng
  `phone` VARCHAR(20) DEFAULT NULL, -- Số điện thoại khách hàng
  `address` VARCHAR(255) DEFAULT NULL, -- Địa chỉ nhận hàng mặc định
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE -- Khóa ngoại ràng buộc
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID danh mục
  `category_name` VARCHAR(100) NOT NULL UNIQUE, -- Tên danh mục (duy nhất)
  `description` TEXT DEFAULT NULL -- Mô tả danh mục sản phẩm
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính: ID đơn hàng
  `customer_id` INT NOT NULL, -- Khóa ngoại: Thuộc về khách hàng nào (customers)
  `total_amount` DECIMAL(15, 2) NOT NULL, -- Tổng số tiền của toàn đơn hàng
  `status` ENUM('Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled') DEFAULT 'Pending', -- Trạng thái đơn đặt hàng
  `shipping_address` VARCHAR(255) NOT NULL, -- Địa chỉ giao hàng cụ thể
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE -- Xóa khách hàng xóa luôn đơn hàng
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, -- Khóa chính
  `order_id` INT NOT NULL, -- Khóa ngoại: Thuộc đơn hàng nào (orders)
  `product_id` INT NOT NULL, -- Khóa ngoại: Sản phẩm nào được mua (products)
  `quantity` INT NOT NULL, -- Số lượng mua sản phẩm đó
  `price` DECIMAL(15, 2) NOT NULL, -- Đơn giá của sản phẩm tại thời điểm mua hàng
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE, -- Xóa đơn hàng xóa luôn chi tiết
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE -- Xóa sản phẩm xóa luôn chi tiết
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 3. CHI NHÁNH CỬA HÀNG
-- =========================
INSERT INTO `stores` (`id`, `store_name`, `address`, `phone`) VALUES 
(1, 'Tech Store Q1', '123 Nguyễn Huệ, Quận 1, TP. HCM', '0281234567'),
(2, 'Tech Store Cầu Giấy', '456 Cầu Giấy, Quận Cầu Giấy, Hà Nội', '0241234567');

-- =========================
-- 4. ROLES VÀ TÀI KHOẢN DEMO
-- =========================
-- 1. Bổ sung các vai trò (roles) nếu chưa có
INSERT IGNORE INTO roles (role_name) VALUES ('admin'), ('user'), ('store_owner'), ('manager'), ('staff');

-- 2. Bổ sung các cột thông tin nhân viên vào bảng users
-- LƯU Ý: Dùng PROCEDURE để ADD COLUMN an toàn (tránh lỗi Duplicate Column nếu chạy lại 2 lần)
DELIMITER //
CREATE PROCEDURE AddColumnsSafely()
BEGIN
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(100) DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'hometown') THEN
        ALTER TABLE users ADD COLUMN hometown VARCHAR(100) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'store_id') THEN
        ALTER TABLE users ADD COLUMN store_id INT DEFAULT NULL;
    END IF;
END //
DELIMITER ;
CALL AddColumnsSafely();
DROP PROCEDURE IF EXISTS AddColumnsSafely;

-- 3. Tạo các tài khoản demo (Nếu chưa có)
INSERT IGNORE INTO users (username, password, email, role_id) VALUES 
('admin', '123456', 'admin@techstore.com', (SELECT id FROM roles WHERE role_name = 'admin')),
('user', '123456', 'user@techstore.com', (SELECT id FROM roles WHERE role_name = 'user')),
('owner', '123456', 'owner@techstore.com', (SELECT id FROM roles WHERE role_name = 'store_owner')),
('manager', '123456', 'manager@techstore.com', (SELECT id FROM roles WHERE role_name = 'manager')),
('staff', '123456', 'staff@techstore.com', (SELECT id FROM roles WHERE role_name = 'staff'));

-- 4. Cập nhật chính xác Role, Mật khẩu, và thông tin nhân viên cho các tài khoản demo
UPDATE users SET role_id = (SELECT id FROM roles WHERE role_name = 'admin'), password = '123456', full_name = 'Quản Trị Viên Hệ Thống', phone = '0901111111', hometown = 'TP.HCM', store_id = 1 WHERE username = 'admin';
UPDATE users SET role_id = (SELECT id FROM roles WHERE role_name = 'store_owner'), password = '123456', full_name = 'Chủ Cửa Hàng Demo', phone = '0902222222', hometown = 'Hà Nội', store_id = 1 WHERE username = 'owner';
UPDATE users SET role_id = (SELECT id FROM roles WHERE role_name = 'manager'), password = '123456', full_name = 'Quản Lý Chi Nhánh', phone = '0903333333', hometown = 'Đà Nẵng', store_id = 2 WHERE username = 'manager';
UPDATE users SET role_id = (SELECT id FROM roles WHERE role_name = 'staff'), password = '123456', full_name = 'Nhân Viên Bán Hàng', phone = '0904444444', hometown = 'Cần Thơ', store_id = 1 WHERE username = 'staff';
UPDATE users SET role_id = (SELECT id FROM roles WHERE role_name = 'user'), password = '123456', full_name = 'Nguyễn Văn Khách Hàng', phone = '0905555555' WHERE username = 'user';



-- =========================
-- 5. DANH MỤC VÀ SẢN PHẨM
-- =========================
INSERT INTO `categories` (`id`, `category_name`, `description`) VALUES 
(1, 'Laptop', 'Máy tính xách tay văn phòng, gaming, đồ họa'),
(2, 'Điện thoại', 'Điện thoại thông minh, smartphone mới nhất'),
(3, 'PlayStation', 'Máy chơi game console và phụ kiện PS'),
(4, 'Bàn phím cơ', 'Bàn phím cơ chơi game, văn phòng, custom'),
(5, 'Chuột gaming', 'Chuột gaming không dây, có dây, độ nhạy cao'),
(6, 'Màn hình', 'Màn hình máy tính chuyên game, đồ họa, văn phòng'),
(7, 'Tai nghe', 'Tai nghe chụp tai, tai nghe bluetooth, tai nghe gaming'),
(8, 'SSD', 'Ổ cứng lưu trữ SSD tốc độ cao SATA/NVMe');

INSERT IGNORE INTO products (id, product_name, description, price, image_url, stock_quantity, category_id, store_id) VALUES
(1, 'Laptop ASUS ROG Zephyrus G14 2024', 'AMD Ryzen 9 8945HS, RAM 16GB DDR5, SSD 1TB NVMe, RTX 4070, màn 14in 144Hz QHD+.', 14000000, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', 26, 1, 1),
(2, 'MacBook Air M3 13 inch', 'Chip Apple M3, RAM 8GB Unified, SSD 256GB, màn Liquid Retina 13.6in, pin 18 giờ.', 5000000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 38, 1, 2),
(12, 'Laptop Acer Predator Helios Neo 16', 'Intel Core i7-13700HX, RAM 16GB, SSD 512GB, RTX 4060, màn 16in QHD 165Hz.', 8000000, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600', 22, 1, 2),
(13, 'Laptop Lenovo Legion 5 15ARP8', 'AMD Ryzen 7 7745HX, RAM 16GB, SSD 512GB NVMe, RTX 4060, màn WQHD 165Hz.', 4000000, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', 15, 1, 1),
(14, 'Laptop Dell XPS 13 9340 Plus', 'Intel Core Ultra 7, RAM 16GB LPDDR5x, SSD 1TB, màn OLED Touch 13.4in 3.5K.', 6000000, 'https://images.unsplash.com/photo-1593642532400-26f9112de530?w=600', 58, 1, 2),
(35, 'Laptop HP Spectre x360 14', 'Intel Core Ultra 7, RAM 32GB, SSD 2TB, màn OLED cảm ứng xoay gập 360 độ.', 20000000, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600', 12, 1, 1),
(36, 'Laptop MSI Katana 15 B13VGK', 'Intel Core i7-13620H, RAM 16GB DDR5, SSD 1TB, RTX 4070 8GB, màn 15.6in 144Hz.', 1000000, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 41, 1, 2),
(3, 'iPhone 15 Pro Max 256GB', 'Khung Titan, chip A17 Pro 3nm, camera 5x zoom quang học, Dynamic Island.', 2000000, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', 34, 2, 1),
(4, 'Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3, RAM 12GB, camera 200MP, bút S-Pen, màn AMOLED 6.8in 120Hz.', 6000000, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600', 21, 2, 2),
(15, 'Xiaomi 14 Ultra 5G', 'Camera Leica f/1.63, Snapdragon 8 Gen 3, RAM 16GB, sạc siêu tốc 90W.', 4000000, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 24, 2, 1),
(16, 'Google Pixel 9 Pro 128GB', 'AI Camera Google, chip Tensor G4, màn Super Actua OLED 6.3in 120Hz.', 6000000, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', 43, 2, 2),
(17, 'ASUS ROG Phone 8 Pro Gaming', 'Snapdragon 8 Gen 3, RAM 24GB, màn 6.78in AMOLED 165Hz, hệ thống tản nhiệt GameCool 8.', 19000000, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', 14, 2, 1),
(37, 'Sony Xperia 1 VI', 'Snapdragon 8 Gen 3, màn OLED 4K 6.5in, camera Zeiss zoom quang học 3 ống kính.', 4000000, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600', 57, 2, 1),
(38, 'OnePlus 12 5G 512GB', 'Snapdragon 8 Gen 3, RAM 16GB, camera Hasselblad, sạc siêu tốc SUPERVOOC 100W.', 1000000, 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600', 43, 2, 2),
(5, 'PlayStation 5 Slim Standard Edition', 'PS5 Slim nhỏ hơn 30%, SSD 1TB siêu tốc, có ổ đĩa quang, kèm tay cầm DualSense.', 10000000, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600', 48, 3, 1),
(18, 'PlayStation 5 Slim Digital Edition', 'PS5 Slim không ổ đĩa, SSD 1TB, tải game trực tiếp từ PS Store, nhỏ gọn hơn 18%.', 16000000, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600', 31, 3, 2),
(19, 'Tay cầm DualSense Edge PS5', 'Tay cầm PS5 cao cấp tùy chỉnh hoàn toàn: deadzone, trigger, nút phụ, lưu profile.', 2000000, 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=600', 40, 3, 1),
(20, 'PlayStation VR2 Headset', 'Kính VR thế hệ 2 của Sony, màn OLED 2K mỗi mắt, 90/120Hz, haptic feedback.', 4000000, 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600', 12, 3, 2),
(39, 'Đế sạc DualSense PS5 Chính Hãng', 'Sạc đồng thời 2 tay cầm DualSense, thiết kế khớp màu trắng PS5, đèn LED trạng thái.', 6000000, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600', 16, 3, 1),
(40, 'Đĩa game PS5 Marvel Spider-Man 2', 'Bom tấn hành động độc quyền PS5, đồ họa Unreal Engine 5, 2 nhân vật Miles & Peter.', 10000000, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600', 26, 3, 2),
(6, 'Bàn phím cơ Keychron K2 V2 Hotswap', 'Layout 75%, kết nối Bluetooth 5.1 + Type-C, hotswap, đèn LED trắng.', 20000000, 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=600', 48, 4, 2),
(7, 'Bàn phím cơ Razer BlackWidow V4 Pro', 'Switch Razer Yellow Linear êm, núm xoay đa năng, đệm tay từ tính, RGB Chroma.', 7000000, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600', 36, 4, 1),
(21, 'Bàn phím cơ Corsair K70 RGB PRO', 'Switch Cherry MX Red, khung nhôm nguyên khối, đệm tay cao su, polling 8000Hz.', 6000000, 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600', 41, 4, 1),
(22, 'Bàn phím cơ Akko 3098B Plus', 'Kết nối 3 chế độ USB/Bluetooth/2.4GHz, switch CS Jelly Pink êm, RGB mặt bên.', 19000000, 'https://images.unsplash.com/photo-1626958390898-162d3577f593?w=600', 36, 4, 2),
(23, 'Bàn phím cơ SteelSeries Apex Pro TKL', 'Switch OmniPoint 2.0 tùy chỉnh điểm nhận lực 0.1-4mm, OLED Smart Display.', 3000000, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600', 21, 4, 1),
(41, 'Bàn phím cơ Leopold FC900R PD', 'Full size cao cấp Hàn Quốc, switch Cherry Silent Red không tiếng, keycap PBT bền.', 15000000, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', 27, 4, 1),
(42, 'Bàn phím cơ Glorious GMMK 2 65%', 'Layout 65% compact, hotswap 5-pin, switch Glorious Fox siêu mượt, foam giảm ồn.', 19000000, 'https://images.unsplash.com/photo-1626958390904-58e1c6674eb9?w=600', 12, 4, 2),
(8, 'Chuột Logitech G Pro X Superlight 2', 'Siêu nhẹ 60g, cảm biến HERO 2 25600 DPI, kết nối Lightspeed 2.4GHz.', 6000000, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600', 36, 5, 2),
(24, 'Chuột Razer DeathAdder V3 Pro', 'Ergonomic 63g, cảm biến Focus Pro 30K DPI, HyperSpeed Wireless 4K polling.', 19000000, 'https://images.unsplash.com/photo-1617096200347-ac043d81f14a?w=600', 11, 5, 2),
(25, 'Chuột ASUS ROG Harpe Ace Aim Lab', 'Siêu nhẹ 54g, cảm biến ROG AimPoint 36K DPI, 3 chế độ kết nối wired/2.4G/BT.', 11000000, 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600', 37, 5, 1),
(26, 'Chuột SteelSeries Rival 3 Wired', 'Cảm biến TrueMove Core 8500 DPI, 6 nút lập trình, đèn RGB prism 3-zone.', 5000000, 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=600', 17, 5, 2),
(43, 'Chuột Logitech G502 X Plus', 'Cảm biến HERO 25K, switch Lightforce hybrid, 89g, Lightsync RGB 13 vùng.', 20000000, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', 15, 5, 1),
(44, 'Chuột Razer Basilisk V3 Pro', 'Con lăn HyperScroll Smart-Reel, Focus Pro 30K DPI, HyperSpeed + Bluetooth 5.0.', 6000000, 'https://images.unsplash.com/photo-1492553769029-c45f7e4e30c3?w=600', 10, 5, 2),
(9, 'Màn hình ASUS ROG Strix XG27AQ', '27in 2K QHD IPS 170Hz 1ms, G-Sync Compatible, FreeSync Premium Pro, HDR400.', 17000000, 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600', 56, 6, 1),
(27, 'Màn hình LG UltraGear 27GR75Q-B', '27in 2K QHD IPS 165Hz 1ms, G-Sync Compatible, FreeSync Premium, Nano IPS.', 5000000, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600', 52, 6, 1),
(28, 'Màn hình Samsung Odyssey G5 34in Cong', '34in UltraWide Curved 1000R, UWQHD 3440x1440, 165Hz, 1ms, QLED, FreeSync Pro.', 5000000, 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600', 48, 6, 2),
(29, 'Màn hình ViewSonic VX2428 180Hz', '24in FHD Fast IPS 180Hz 0.5ms, không viền 3 cạnh, HDR10, FreeSync Premium.', 17000000, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600', 31, 6, 1),
(45, 'Màn hình Dell UltraSharp U2724D', '27in 2K IPS Black 2000:1, 120Hz, sạc USB-C 90W, 98% DCI-P3 chuẩn đồ họa.', 19000000, 'https://images.unsplash.com/photo-1615750185825-fa94bd79e4d0?w=600', 48, 6, 1),
(46, 'Màn hình MSI Optix G274 Rapid IPS', '27in FHD Rapid IPS 170Hz 1ms, G-Sync + FreeSync Premium, Night Vision.', 9000000, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600', 36, 6, 2),
(10, 'Tai nghe Sony WH-1000XM5', 'ANC đỉnh cao 8 mic, pin 30 giờ, LDAC Hi-Res, kết nối Multipoint 2 thiết bị.', 15000000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 20, 7, 2),
(30, 'Tai nghe Razer BlackShark V2 Pro', 'HyperSpeed 2.4GHz, màng loa TriForce Titanium 50mm, mic cardioid siêu chỉ hướng.', 14000000, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600', 29, 7, 2),
(31, 'Tai nghe Apple AirPods Max', 'Vỏ nhôm cao cấp, đệm tai memory foam, chip H1, ANC, Spatial Audio 3D.', 2000000, 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600', 55, 7, 1),
(32, 'Tai nghe HyperX Cloud III Wired', 'Màng loa 53mm nghiêng 10°, âm thanh vòm DTS 7.1, mic tách rời khử ồn AI.', 18000000, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', 40, 7, 2),
(47, 'Tai nghe SteelSeries Arctis Nova 7', 'Không dây đa nền tảng PC/Mac/PS/Switch, pin 38 giờ, 2.4GHz + Bluetooth.', 5000000, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600', 49, 7, 1),
(48, 'Tai nghe Marshall Monitor II ANC', 'ANC hybrid tùy chỉnh, driver 40mm Marshall, pin 30 giờ ANC on, âm trầm căng.', 11000000, 'https://images.unsplash.com/photo-1546435770-a3e736769a50?w=600', 29, 7, 2),
(11, 'SSD Samsung 990 Pro 1TB NVMe M.2', 'Đọc 7450 MB/s, ghi 6900 MB/s, PCIe 4.0 x4 NVMe 2.0, Dynamic Thermal Guard.', 16000000, 'https://images.unsplash.com/photo-1597872200919-281df04a91d1?w=600', 54, 8, 1),
(33, 'SSD Kingston NV2 1TB PCIe 4.0 NVMe', 'Đọc 3500 MB/s, ghi 2100 MB/s, M.2 2280, nâng cấp laptop và PC phổ thông.', 17000000, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600', 11, 8, 1),
(34, 'SSD WD Black SN850X 2TB PCIe Gen4', 'Đọc 7300 MB/s, ghi 6600 MB/s, tương thích PS5 và PC, Gaming Mode tự tối ưu.', 18000000, 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=600', 10, 8, 2),
(49, 'SSD Crucial P3 Plus 1TB PCIe Gen4', 'Đọc 5000 MB/s, ghi 3600 MB/s, PCIe Gen4 NVMe, tiêu thụ điện thấp.', 4000000, 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600', 42, 8, 1),
(50, 'SSD MSI Spatium M480 PRO 2TB', 'Đọc 7400 MB/s, ghi 7000 MB/s, PCIe Gen4 x4, M.2 2280, tản nhiệt graphene pad.', 13000000, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600', 29, 8, 2),
(51, 'Hub USB-C 7-in-1 Anker PowerExpand', 'HDMI 4K@60Hz, 2x USB-A 3.0, SD/MicroSD, sạc ngược PD 100W, thiết kế siêu mỏng.', 10000000, 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600', 10, 9, 1),
(52, 'Giá đỡ Laptop Nhôm Orico PFB-A4', 'Hợp kim nhôm nguyên khối, 6 góc nghiêng, 4 rãnh thoát nhiệt, gấp gọn mang đi.', 15000000, 'https://images.unsplash.com/photo-1619579200730-faf39680a97d?w=600', 38, 9, 2),
(53, 'Bungee cáp chuột BenQ Zowie CAMADE II', 'Giữ cáp chuột linh hoạt, lò xo điều chỉnh độ cao, đế nặng chống trượt.', 11000000, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', 21, 9, 1),
(54, 'Đèn kẹp màn hình Baseus i-Wok LED', 'Chống chói, điều chỉnh 3 chế độ màu 3000K-6500K, điều khiển cảm ứng.', 9000000, 'https://images.unsplash.com/photo-1563770557593-5c5359f26824?w=600', 47, 9, 2),
(55, 'Lót chuột Razer Strider XXL Hybrid', 'Kích thước 900x400mm, bề mặt lai hard/soft, chống thấm nước, viền may chắc.', 20000000, 'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=600', 44, 9, 1);



-- =========================
-- 6. KHÁCH HÀNG VÀ ĐƠN HÀNG
-- =========================
INSERT INTO `customers` (`id`, `user_id`, `full_name`, `phone`, `address`) VALUES 
(1, 1, 'Hệ thống Quản trị viên', '0900000001', 'Văn phòng Tổng công ty Tech Store, TP. HCM'),
(2, 2, 'Nguyễn Văn Khách Hàng', '0912345678', '789 Đường 3/2, Quận 10, TP. HCM');

INSERT INTO `orders` (`id`, `customer_id`, `total_amount`, `status`, `shipping_address`) VALUES 
(1, 2, 33770000.00, 'Completed', '789 Đường 3/2, Quận 10, TP. HCM'), -- Đơn hàng hoàn thành
(2, 2, 13490000.00, 'Pending', '789 Đường 3/2, Quận 10, TP. HCM');

INSERT INTO `order_details` (`order_id`, `product_id`, `quantity`, `price`) VALUES 
(1, 8, 1, 3190000.00),  -- Mua 1 chuột Logitech
(1, 11, 1, 2590000.00), -- Mua 1 SSD Samsung
(1, 2, 1, 27990000.00), -- Mua 1 Macbook Air M3
(2, 5, 1, 13490000.00);

-- =========================
-- 7. FIX FONT TIẾNG VIỆT VÀ DỌN DỮ LIỆU
-- =========================
-- 5. Sửa lỗi font tiếng Việt cho khách hàng, cửa hàng bị móp méo ký tự
UPDATE customers SET full_name = REPLACE(full_name, 'Nguyá»…n VÄƒn KhÃ¡nh HÃ ng', 'Nguyễn Văn Khánh Hàng');
DELETE p1 FROM products p1
INNER JOIN products p2 
WHERE p1.product_name = p2.product_name AND p1.id < p2.id;

DELETE FROM products 
WHERE LENGTH(product_name) < 5 
   OR image_url IS NULL 
   OR image_url = ''
   OR image_url NOT LIKE 'http%';

