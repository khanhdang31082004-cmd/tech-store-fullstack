SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Fix category names with corrupted encoding
UPDATE categories SET name = 'Laptop' WHERE name = 'Laptop';
UPDATE categories SET name = 'Điện thoại' WHERE name LIKE '%ÄĐiá»‡n thoáº¡i%';
UPDATE categories SET name = 'PlayStation' WHERE name LIKE '%PlayStation%';
UPDATE categories SET name = 'Bàn phím cơ' WHERE name LIKE '%BÃ n phÃm cÆ¡%';
UPDATE categories SET name = 'Chuột gaming' WHERE name LIKE '%Chuá»™t gaming%';
UPDATE categories SET name = 'Màn hình' WHERE name LIKE '%MÃ n hÃ¬nh%';
UPDATE categories SET name = 'Tai nghe' WHERE name LIKE '%Tai nghe%';
UPDATE categories SET name = 'SSD' WHERE name LIKE '%SSD%';

-- Fix product names and descriptions with corrupted encoding
-- Example generic replacements using REPLACE for common corrupted patterns
UPDATE products SET name = REPLACE(name, 'ÄĐiá»‡n thoáº¡i', 'Điện thoại');
UPDATE products SET name = REPLACE(name, 'BÃ n phÃm cÆ¡', 'Bàn phím cơ');
UPDATE products SET name = REPLACE(name, 'Chuá»™t gaming', 'Chuột gaming');
UPDATE products SET name = REPLACE(name, 'MÃ n hÃ¬nh', 'Màn hình');
UPDATE products SET description = REPLACE(description, 'ÄĐiá»‡n thoáº¡i', 'Điện thoại');
UPDATE products SET description = REPLACE(description, 'BÃ n phÃm cÆ¡', 'Bàn phím cơ');
UPDATE products SET description = REPLACE(description, 'Chuá»™t gaming', 'Chuột gaming');
UPDATE products SET description = REPLACE(description, 'MÃ n hÃ¬nh', 'Màn hình');
UPDATE products SET description = REPLACE(description, 'thá»i gian pháº£n há»“i', 'thời gian phân hồi');
UPDATE products SET description = REPLACE(description, 'Thiáº¿t káº¿', 'Thiết kế');

-- Insert at least 20 new products (Vietnamese names with proper accents)
INSERT INTO products (name, description, price, stock, category_id, image_url)
VALUES
  ('Laptop Dell XPS 13', 'Laptop Dell XPS 13 thế hệ mới, hiệu năng mạnh mẽ, màn hình Full HD.', 25990000, 15, 1, 'https://example.com/images/dell_xps13.jpg'),
  ('Laptop HP Spectre x360', 'HP Spectre x360 sang trọng, thiết kế 2 trong 1, pin dài.', 29990000, 12, 1, 'https://example.com/images/hp_spectre.jpg'),
  ('Điện thoại Samsung Galaxy S22', 'Samsung Galaxy S22 với camera 108MP, màn hình AMOLED 6.2".', 19990000, 30, 2, 'https://example.com/images/galaxy_s22.jpg'),
  ('Điện thoại iPhone 14 Pro', 'iPhone 14 Pro Apple, chip A16 Bionic, màn hình ProMotion 120Hz.', 27990000, 20, 2, 'https://example.com/images/iphone14pro.jpg'),
  ('PlayStation 5', 'Sony PlayStation 5 thế hệ mới, hỗ trợ ray tracing, SSD tốc độ cao.', 14990000, 25, 3, 'https://example.com/images/ps5.jpg'),
  ('PlayStation 4 Pro', 'PlayStation 4 Pro, bộ điều khiển DualShock 4, hỗ trợ VR.', 7990000, 40, 3, 'https://example.com/images/ps4pro.jpg'),
  ('Bàn phím cơ Keychron K6', 'Bàn phím cơ không dây 65% với switch Gateron Brown.', 1990000, 50, 5, 'https://example.com/images/keychron_k6.jpg'),
  ('Bàn phím cơ Logitech G Pro', 'Bàn phím cơ có switch Romer-G, RGB đèn nền.', 2590000, 35, 5, 'https://example.com/images/logitech_gpro.jpg'),
  ('Chuột gaming Razer DeathAdder V2', 'Chuột gaming Razer DeathAdder V2, cảm biến 20000 DPI, thiết kế ergonomics.', 1190000, 45, 6, 'https://example.com/images/razer_deathadder.jpg'),
  ('Chuột gaming SteelSeries Rival 3', 'SteelSeries Rival 3, cảm biến TrueMove Core, màu RGB.', 990000, 60, 6, 'https://example.com/images/steelseries_rival3.jpg'),
  ('Màn hình Dell UltraSharp 27"', 'Màn hình Dell UltraSharp 27 inch, độ phân giải 2560x1440, IPS.', 8990000, 22, 7, 'https://example.com/images/dell_ultrasharp.jpg'),
  ('Màn hình LG OLED 55"', 'TV LG OLED 55 inch, hỗ trợ HDR10, độ phân giải 4K.', 17990000, 10, 7, 'https://example.com/images/lg_oled55.jpg'),
  ('Tai nghe Sony WH-1000XM4', 'Tai nghe Sony WH-1000XM4, công nghệ khử tiếng ồn, Bluetooth.', 6990000, 18, 8, 'https://example.com/images/sony_wh1000xm4.jpg'),
  ('Tai nghe Apple AirPods Pro', 'Apple AirPods Pro, hỗ trợ ANC, không dây, âm thanh chất lượng cao.', 6490000, 25, 8, 'https://example.com/images/airpods_pro.jpg'),
  ('SSD Samsung 970 EVO Plus 1TB', 'SSD NVMe Samsung 970 EVO Plus 1TB, tốc độ đọc/ghi cực nhanh.', 2590000, 40, 9, 'https://example.com/images/samsung_970evo.jpg'),
  ('SSD Western Digital Black 2TB', 'SSD WD Black 2TB, hiệu năng ổn định cho gaming và công việc.', 4490000, 30, 9, 'https://example.com/images/wd_black_2tb.jpg'),
  ('SSD Kingston A2000 500GB', 'SSD Kingston A2000 500GB, giá cả phải chăng, tốc độ tốt.', 1190000, 55, 9, 'https://example.com/images/kingston_a2000.jpg'),
  ('Laptop Asus ZenBook 14', 'Asus ZenBook 14 siêu nhẹ, pin mạnh, màn hình NanoEdge.', 21990000, 14, 1, 'https://example.com/images/asus_zenbook14.jpg'),
  ('Điện thoại Xiaomi Mi 11', 'Xiaomi Mi 11, camera 108MP, sạc nhanh 55W, màn hình AMOLED.', 14990000, 28, 2, 'https://example.com/images/mi11.jpg'),
  ('PlayStation 5 Digital Edition', 'Phiên bản không ổ đĩa của PlayStation 5, tải game kỹ thuật số.', 13990000, 20, 3, 'https://example.com/images/ps5_digital.jpg')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  stock = VALUES(stock),
  category_id = VALUES(category_id),
  image_url = VALUES(image_url);

-- End of script
