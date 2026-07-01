-- =========================================================================
-- ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
-- FILE SCRIPT: upgrade_professional_store.sql - Nâng cấp cấu trúc và dữ liệu
-- =========================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE `tech_store`;

-- 1. Nâng cấp các vai trò (Roles) phân quyền chi tiết
INSERT IGNORE INTO `roles` (`id`, `role_name`) VALUES 
(1, 'admin'),        -- Admin hệ thống
(2, 'user'),         -- Khách hàng
(3, 'store_owner'),  -- Chủ cửa hàng
(4, 'manager'),      -- Quản lý cửa hàng
(5, 'staff');        -- Nhân viên cửa hàng

-- 2. Thêm cột trạng thái duyệt/khóa cho cửa hàng (Stores)
ALTER TABLE `stores` 
  ADD COLUMN `status` ENUM('pending', 'active', 'suspended') DEFAULT 'active' AFTER `phone`;

-- 3. Thêm cột store_id và trạng thái hoạt động cho tài khoản (Users)
ALTER TABLE `users` 
  ADD COLUMN `store_id` INT DEFAULT NULL AFTER `role_id`,
  ADD COLUMN `is_active` TINYINT DEFAULT 1 AFTER `store_id`;

-- Thêm ràng buộc khóa ngoại cho store_id trong bảng users
ALTER TABLE `users` 
  ADD CONSTRAINT `fk_users_stores` 
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL;

-- 4. Thêm các cột phục vụ quy trình đặt hàng chuyên nghiệp (Orders)
ALTER TABLE `orders` 
  ADD COLUMN `recipient_name` VARCHAR(100) NOT NULL AFTER `customer_id`,
  ADD COLUMN `recipient_phone` VARCHAR(20) NOT NULL AFTER `recipient_name`,
  ADD COLUMN `recipient_email` VARCHAR(100) DEFAULT NULL AFTER `recipient_phone`,
  ADD COLUMN `payment_method` VARCHAR(50) DEFAULT 'cod' AFTER `total_amount`,
  ADD COLUMN `notes` TEXT DEFAULT NULL AFTER `shipping_address`,
  ADD COLUMN `cccd` VARCHAR(25) DEFAULT NULL AFTER `notes`;

-- 5. Tạo bảng Giỏ hàng (Cart) lưu trữ server-side
CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tạo danh mục sản phẩm thứ 9: Phụ kiện máy tính
INSERT IGNORE INTO `categories` (`id`, `category_name`, `description`) VALUES
(1, 'Laptop', 'Máy tính xách tay văn phòng, gaming, đồ họa'),
(2, 'Điện thoại', 'Điện thoại thông minh, smartphone mới nhất'),
(3, 'PlayStation', 'Máy chơi game console và phụ kiện PS'),
(4, 'Bàn phím cơ', 'Bàn phím cơ chơi game, văn phòng, custom'),
(5, 'Chuột gaming', 'Chuột gaming không dây, có dây, độ nhạy cao'),
(6, 'Màn hình', 'Màn hình máy tính chuyên game, đồ họa, văn phòng'),
(7, 'Tai nghe', 'Tai nghe chụp tai, tai nghe bluetooth, tai nghe gaming'),
(8, 'SSD', 'Ổ cứng lưu trữ SSD tốc độ cao SATA/NVMe'),
(9, 'Phụ kiện máy tính', 'Dây cáp, cổng chuyển đổi, giá đỡ và các thiết bị ngoại vi khác');

-- 7. Đồng bộ / Khôi phục toàn bộ dữ liệu 55 sản phẩm mẫu không lỗi font, ảnh độc bản
-- Xóa sản phẩm trùng lặp hoặc không hợp lệ để tránh xung đột
DELETE FROM `products` WHERE `id` > 0;

INSERT INTO `products` (`id`, `product_name`, `description`, `price`, `image_url`, `stock_quantity`, `category_id`, `store_id`) VALUES
-- Laptop (Danh mục 1)
(1, 'Laptop ASUS ROG Zephyrus G14', 'CPU AMD Ryzen 9, RAM 16GB, SSD 1TB, RTX 4060, Màn hình 14 inch 120Hz.', 39990000.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', 8, 1, 1),
(2, 'Laptop Apple MacBook Air M3', 'Chip Apple M3 thế hệ mới, RAM 8GB, SSD 256GB, thiết kế mỏng nhẹ sang trọng.', 27990000.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 15, 1, 2),
(12, 'Laptop Acer Predator Helios Neo 16', 'CPU Intel Core i7, RAM 16GB, SSD 512GB, RTX 4060, Màn hình 16 inch 165Hz.', 35990000.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', 12, 1, 1),
(13, 'Laptop Lenovo Legion 5 15ARP8', 'CPU AMD Ryzen 7, RAM 16GB, SSD 512GB, RTX 4060, Màn hình WQHD 165Hz.', 32500000.00, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', 18, 1, 2),
(14, 'Laptop Dell XPS 13 9340', 'Mỏng nhẹ cao cấp, Intel Core Ultra 7, RAM 16GB, SSD 1TB, màn hình OLED Touch.', 42990000.00, 'https://images.unsplash.com/photo-1593642532400-26f9112de530?w=500', 8, 1, 1),
(35, 'Laptop HP Spectre x360 14', 'CPU Intel Core Ultra 7, RAM 32GB, SSD 2TB, màn hình cảm ứng OLED xoay gập 360 độ.', 46990000.00, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 5, 1, 1),
(36, 'Laptop MSI Katana 15 B13VGK', 'Intel Core i7-13620H, RAM 16GB, SSD 1TB, card đồ họa RTX 4070 8GB chuyên game.', 34490000.00, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500', 10, 1, 2),

-- Điện thoại (Danh mục 2)
(3, 'Điện thoại iPhone 15 Pro Max 256GB', 'Khung Titan tự nhiên, chip A17 Pro siêu mạnh mẽ, camera zoom quang học 5x cực đỉnh.', 29990000.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 25, 2, 1),
(4, 'Điện thoại Samsung Galaxy S24 Ultra', 'RAM 12GB, SSD 256GB, Bút S-Pen tích hợp đa năng, chip xử lý Snapdragon 8 Gen 3.', 26990000.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 20, 2, 2),
(15, 'Điện thoại Xiaomi 14 Ultra 5G', 'Leica Camera chuyên nghiệp, Snapdragon 8 Gen 3, RAM 16GB, 512GB ROM.', 24990000.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 15, 2, 2),
(16, 'Điện thoại Google Pixel 8 Pro 128GB', 'Camera AI đỉnh cao từ Google, chip Tensor G3, bộ nhớ 128GB mượt mà.', 19500000.00, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500', 10, 2, 1),
(17, 'Điện thoại ASUS ROG Phone 8 Gaming', 'Điện thoại gaming đỉnh cao, Snapdragon 8 Gen 3, màn hình 165Hz siêu mượt.', 22990000.00, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', 14, 2, 2),
(37, 'Điện thoại Sony Xperia 1 VI', 'Snapdragon 8 Gen 3, màn hình OLED Bravia, camera ba ống kính zoom quang học.', 30990000.00, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500', 6, 2, 1),
(38, 'Điện thoại OnePlus 12 5G', 'RAM 16GB, bộ nhớ 512GB, sạc siêu tốc SuperVOOC 100W, màn hình 2K 120Hz siêu sáng.', 18990000.00, 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=500', 9, 2, 2),

-- PlayStation (Danh mục 3)
(5, 'Máy chơi game PlayStation 5 Standard', 'Phiên bản PS5 Slim có ổ đĩa quang, bộ nhớ SSD 1TB, kèm theo 1 tay cầm DualSense.', 13990000.00, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500', 10, 3, 1),
(18, 'Máy chơi game PlayStation 5 Digital', 'Phiên bản không ổ đĩa Slim Digital, dung lượng SSD 1TB lưu trữ thoải mái.', 11990000.00, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500', 15, 3, 2),
(19, 'Tay cầm PlayStation 5 DualSense Edge', 'Tay cầm cao cấp nhất của Sony dành cho game thủ chuyên nghiệp, tùy chỉnh nút.', 5490000.00, 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=500', 25, 3, 1),
(20, 'Kính thực tế ảo PlayStation VR2', 'Trải nghiệm game VR thế hệ mới siêu thực tế trên hệ máy PS5.', 15990000.00, 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500', 5, 3, 2),
(39, 'Đế sạc tay cầm DualSense PS5', 'Sạc nhanh đồng thời 2 tay cầm DualSense cùng lúc mà không cần cắm cáp vào PS5.', 790000.00, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500', 30, 3, 1),
(40, 'Đĩa game PS5 Marvel Spider-Man 2', 'Đĩa game hành động bom tấn độc quyền PS5, đồ họa Unreal Engine 5 đỉnh cao.', 1690000.00, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500', 20, 3, 2),

-- Bàn phím cơ (Danh mục 4)
(6, 'Bàn phím cơ Keychron K2 V2 Hotswap', 'Layout 75% nhỏ gọn, kết nối đa thiết bị Bluetooth/Type-C, Switch cơ học gõ êm.', 1890000.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 40, 4, 1),
(7, 'Bàn phím cơ Razer BlackWidow V4 Pro', 'Switch cơ học Razer Green Clicky, núm xoay đa năng, led RGB Razer Chroma cực sáng.', 5890000.00, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', 8, 4, 2),
(21, 'Bàn phím cơ Corsair K70 RGB PRO', 'Switch Cherry MX Red, thiết kế khung nhôm cao cấp, đệm tay đi kèm.', 3890000.00, 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=500', 30, 4, 1),
(22, 'Bàn phím cơ Akko 3098B Plus Multi-mode', 'Kết nối 3 chế độ (Dây, 2.4G, Bluetooth), Akko CS Jelly Pink Switch gõ êm.', 1690000.00, 'https://images.unsplash.com/photo-1626958390898-162d3577f593?w=500', 45, 4, 2),
(23, 'Bàn phím cơ SteelSeries Apex Pro TKL', 'OmniPoint 2.0 Switch có thể tùy chỉnh điểm nhận lực cực nhạy.', 5290000.00, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', 10, 4, 1),
(41, 'Bàn phím cơ Leopold FC900R PD', 'Bàn phím cao cấp Hàn Quốc, Switch Cherry Silent Red, keycap PBT siêu bền.', 3150000.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 15, 4, 1),
(42, 'Bàn phím cơ Glorious GMMK 2 65%', 'Layout 65% nhỏ gọn, hotswap 5-pin, switch Glorious Fox mượt mà, led RGB.', 2690000.00, 'https://images.unsplash.com/photo-1626958390904-58e1c6674eb9?w=500', 20, 4, 2),

-- Chuột gaming (Danh mục 5)
(8, 'Chuột không dây Logitech G Pro X Superlight', 'Trọng lượng siêu nhẹ dưới 63g, cảm biến HERO 25K chuyên nghiệp cho game bắn súng.', 3290000.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', 18, 5, 1),
(24, 'Chuột không dây Razer DeathAdder V3 Pro', 'Thiết kế công thái học siêu nhẹ 63g, cảm biến Focus Pro 30K cực nhạy.', 3590000.00, 'https://images.unsplash.com/photo-1617096200347-ac043d81f14a?w=500', 20, 5, 2),
(25, 'Chuột gaming ASUS ROG Harpe Ace Aim Lab', 'Chuột siêu nhẹ 54g tối ưu cho FPS, cảm biến ROG AimPoint 36K DPI.', 2990000.00, 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500', 15, 5, 1),
(26, 'Chuột gaming SteelSeries Rival 3 Wired', 'Mắt đọc TrueMove Core độ chính xác cao, dải led RGB gầm đẹp mắt.', 950000.00, 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=500', 60, 5, 2),
(43, 'Chuột không dây Logitech G502 X Plus', 'Phiên bản G502 nâng cấp, switch quang-cơ Hybrid Lightforce, led RGB.', 3890000.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', 15, 5, 1),
(44, 'Chuột gaming Razer Basilisk V3 Pro', 'Công thái học chuyên game, con lăn Razer HyperScroll Smart-Reel độc đáo.', 4190000.00, 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=500', 12, 5, 2),

-- Màn hình (Danh mục 6)
(9, 'Màn hình ASUS ROG Strix XG27AQ', 'Kích thước 27 inch 2K QHD, tấm nền IPS 170Hz chuyên game, thời gian phản hồi 1ms.', 9990000.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 9, 6, 1),
(27, 'Màn hình LG UltraGear 27GR75Q-B', 'Kích thước 27 inch 2K IPS, tần số quét 165Hz, thời gian phản hồi 1ms.', 6490000.00, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500', 12, 6, 1),
(28, 'Màn hình Samsung Odyssey G5 34 inch', 'Màn hình cong 34 inch UltraWide 2K (3440 x 1440), tần số quét 165Hz mượt.', 8500000.00, 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500', 8, 6, 2),
(29, 'Màn hình ViewSonic VX2428 Gaming', 'Kích thước 24 inch Full HD Fast IPS 180Hz 0.5ms cực nhanh cho eSports.', 2890000.00, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=500', 22, 6, 1),
(45, 'Màn hình Dell UltraSharp U2724D', '27 inch 2K IPS Black màu sắc siêu chuẩn cho đồ họa, sạc ngược USB-C 120Hz.', 9490000.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 15, 6, 1),
(46, 'Màn hình MSI Optix G274 Rapid IPS', '27 inch FHD, tấm nền Rapid IPS 170Hz 1ms, hỗ trợ G-Sync và FreeSync.', 4290000.00, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500', 18, 6, 2),

-- Tai nghe (Danh mục 7)
(10, 'Tai nghe không dây Sony WH-1000XM5', 'Tai nghe chống ồn chủ động ANC đỉnh cao, thời lượng pin sử dụng lên tới 30 giờ.', 8490000.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 7, 7, 1),
(30, 'Tai nghe gaming Razer BlackShark V2 Pro 2023', 'Kết nối không dây HyperSpeed, micro siêu nét, màng loa TriForce 50mm.', 4290000.00, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500', 15, 7, 1),
(31, 'Tai nghe không dây Apple AirPods Max', 'Thiết kế sang trọng, âm thanh chất lượng cao, chống ồn chủ động ANC.', 12900000.00, 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500', 7, 7, 2),
(32, 'Tai nghe gaming HyperX Cloud III Wired', 'Đeo thoải mái huyền thoại, âm thanh vòm 7.1, mic thu âm lọc tiếng ồn.', 1990000.00, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', 40, 7, 1),
(47, 'Tai nghe SteelSeries Arctis Nova 7 Wireless', 'Không dây đa nền tảng, Nova Acoustic System chuyên nghiệp, pin 38 tiếng.', 4990000.00, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', 15, 7, 1),
(48, 'Tai nghe không dây Marshall Monitor II A.N.C', 'Chụp tai phong cách classic, chống ồn chủ động, âm thanh Marshall đậm chất.', 7200000.00, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', 8, 7, 2),

-- SSD (Danh mục 8)
(11, 'SSD Samsung 990 Pro 1TB PCIe NVMe M.2', 'Tốc độ đọc ghi siêu tốc lên tới 7450/6900 MB/s, độ bền cao cho PC và laptop.', 2890000.00, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500', 11, 8, 1),
(33, 'SSD Kingston NV2 1TB PCIe 4.0 NVMe', 'Lựa chọn tối ưu hiệu năng trên giá thành, đọc ghi 3500/2100 MB/s.', 1590000.00, 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=500', 50, 8, 2),
(34, 'SSD WD Black SN850X 2TB PCIe Gen4', 'SSD gaming siêu tốc 7300MB/s tương thích hoàn hảo cả PC và máy PS5.', 4690000.00, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500', 25, 8, 1),
(49, 'SSD Crucial P3 Plus 1TB M.2 PCIe Gen4', 'Dung lượng 1TB PCIe Gen4 NVMe, đọc 5000MB/s, hiệu năng ổn định giá tốt.', 1990000.00, 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=500', 50, 8, 1),
(50, 'SSD MSI Spatium M480 PRO 2TB', 'PCIe Gen4 x4 NVMe M.2 2280, tốc độ siêu khủng đọc ghi 7400/7000 MB/s.', 4890000.00, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500', 25, 8, 2),

-- Phụ kiện máy tính (Danh mục 9)
(51, 'Hub chuyển đổi USB-C sang HDMI/USB 3.0 Anker', 'Bộ chuyển đổi USB-C 5 trong 1 cao cấp, hỗ trợ xuất hình ảnh HDMI 4K và truyền dữ liệu siêu tốc.', 990000.00, 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500', 30, 9, 1),
(52, 'Giá đỡ Laptop hợp kim nhôm chỉnh độ cao Orico', 'Thiết kế công thái học xếp gọn, chất liệu nhôm nguyên khối tản nhiệt cực tốt cho laptop.', 350000.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 100, 9, 2),
(53, 'Kẹp giữ dây chuột gaming BenQ Zowie CAMADE II', 'Bungee giữ dây chuột có lò xo điều chỉnh độ cao linh hoạt, chống vướng víu dây khi di chuột FPS.', 690000.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', 20, 9, 1),
(54, 'Đèn treo màn hình bảo vệ mắt Baseus i-Wok', 'Đèn LED kẹp màn hình chống chói, điều chỉnh nhiệt độ màu 3 chế độ bảo vệ mắt ban đêm.', 850000.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 15, 9, 2),
(55, 'Lót chuột cỡ lớn Razer Strider XXL', 'Bàn di chuột gaming kích thước XXL, bề mặt vải lai chống thấm nước, tối ưu hóa tốc độ di chuột.', 1290000.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', 50, 9, 1);
