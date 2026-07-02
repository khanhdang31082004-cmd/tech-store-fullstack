-- =========================================================================
-- FILE: database/clean_products.sql
-- Mục đích: Sửa ảnh sai loại, trùng ảnh, tên/mô tả sản phẩm
-- Không DROP bảng, không xóa users/orders/cart
-- Chỉ UPDATE bảng products
-- Chạy: docker exec tech_store_db mysql -uroot -p123456 --default-character-set=utf8mb4 tech_store -e "source /clean_products.sql"
-- =========================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =========================================================================
-- LAPTOP (category_id = 1) - Ảnh laptop thực tế
-- =========================================================================
UPDATE products SET
  product_name = 'Laptop ASUS ROG Zephyrus G14 2024',
  description  = 'AMD Ryzen 9 8945HS, RAM 16GB DDR5, SSD 1TB NVMe, RTX 4070, màn 14in 144Hz QHD+.',
  image_url    = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600'
WHERE id = 1;

UPDATE products SET
  product_name = 'MacBook Air M3 13 inch',
  description  = 'Chip Apple M3, RAM 8GB Unified, SSD 256GB, màn Liquid Retina 13.6in, pin 18 giờ.',
  image_url    = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'
WHERE id = 2;

UPDATE products SET
  product_name = 'Laptop Acer Predator Helios Neo 16',
  description  = 'Intel Core i7-13700HX, RAM 16GB, SSD 512GB, RTX 4060, màn 16in QHD 165Hz.',
  image_url    = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600'
WHERE id = 12;

UPDATE products SET
  product_name = 'Laptop Lenovo Legion 5 15ARP8',
  description  = 'AMD Ryzen 7 7745HX, RAM 16GB, SSD 512GB NVMe, RTX 4060, màn WQHD 165Hz.',
  image_url    = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600'
WHERE id = 13;

UPDATE products SET
  product_name = 'Laptop Dell XPS 13 9340 Plus',
  description  = 'Intel Core Ultra 7, RAM 16GB LPDDR5x, SSD 1TB, màn OLED Touch 13.4in 3.5K.',
  image_url    = 'https://images.unsplash.com/photo-1593642532400-26f9112de530?w=600'
WHERE id = 14;

UPDATE products SET
  product_name = 'Laptop HP Spectre x360 14',
  description  = 'Intel Core Ultra 7, RAM 32GB, SSD 2TB, màn OLED cảm ứng xoay gập 360 độ.',
  image_url    = 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600'
WHERE id = 35;

UPDATE products SET
  product_name = 'Laptop MSI Katana 15 B13VGK',
  description  = 'Intel Core i7-13620H, RAM 16GB DDR5, SSD 1TB, RTX 4070 8GB, màn 15.6in 144Hz.',
  image_url    = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'
WHERE id = 36;

-- =========================================================================
-- ĐIỆN THOẠI (category_id = 2) - Ảnh smartphone thực tế
-- =========================================================================
UPDATE products SET
  product_name = 'iPhone 15 Pro Max 256GB',
  description  = 'Khung Titan, chip A17 Pro 3nm, camera 5x zoom quang học, Dynamic Island.',
  image_url    = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
WHERE id = 3;

UPDATE products SET
  product_name = 'Samsung Galaxy S24 Ultra',
  description  = 'Snapdragon 8 Gen 3, RAM 12GB, camera 200MP, bút S-Pen, màn AMOLED 6.8in 120Hz.',
  image_url    = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'
WHERE id = 4;

UPDATE products SET
  product_name = 'Xiaomi 14 Ultra 5G',
  description  = 'Camera Leica f/1.63, Snapdragon 8 Gen 3, RAM 16GB, sạc siêu tốc 90W.',
  image_url    = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'
WHERE id = 15;

UPDATE products SET
  product_name = 'Google Pixel 9 Pro 128GB',
  description  = 'AI Camera Google, chip Tensor G4, màn Super Actua OLED 6.3in 120Hz.',
  image_url    = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'
WHERE id = 16;

UPDATE products SET
  product_name = 'ASUS ROG Phone 8 Pro Gaming',
  description  = 'Snapdragon 8 Gen 3, RAM 24GB, màn 6.78in AMOLED 165Hz, hệ thống tản nhiệt GameCool 8.',
  image_url    = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600'
WHERE id = 17;

UPDATE products SET
  product_name = 'Sony Xperia 1 VI',
  description  = 'Snapdragon 8 Gen 3, màn OLED 4K 6.5in, camera Zeiss zoom quang học 3 ống kính.',
  image_url    = 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600'
WHERE id = 37;

UPDATE products SET
  product_name = 'OnePlus 12 5G 512GB',
  description  = 'Snapdragon 8 Gen 3, RAM 16GB, camera Hasselblad, sạc siêu tốc SUPERVOOC 100W.',
  image_url    = 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600'
WHERE id = 38;

-- =========================================================================
-- PLAYSTATION (category_id = 3) - Ảnh máy game/tay cầm
-- =========================================================================
UPDATE products SET
  product_name = 'PlayStation 5 Slim Standard Edition',
  description  = 'PS5 Slim nhỏ hơn 30%, SSD 1TB siêu tốc, có ổ đĩa quang, kèm tay cầm DualSense.',
  image_url    = 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600'
WHERE id = 5;

UPDATE products SET
  product_name = 'PlayStation 5 Slim Digital Edition',
  description  = 'PS5 Slim không ổ đĩa, SSD 1TB, tải game trực tiếp từ PS Store, nhỏ gọn hơn 18%.',
  image_url    = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600'
WHERE id = 18;

UPDATE products SET
  product_name = 'Tay cầm DualSense Edge PS5',
  description  = 'Tay cầm PS5 cao cấp tùy chỉnh hoàn toàn: deadzone, trigger, nút phụ, lưu profile.',
  image_url    = 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=600'
WHERE id = 19;

UPDATE products SET
  product_name = 'PlayStation VR2 Headset',
  description  = 'Kính VR thế hệ 2 của Sony, màn OLED 2K mỗi mắt, 90/120Hz, haptic feedback.',
  image_url    = 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600'
WHERE id = 20;

UPDATE products SET
  product_name = 'Đế sạc DualSense PS5 Chính Hãng',
  description  = 'Sạc đồng thời 2 tay cầm DualSense, thiết kế khớp màu trắng PS5, đèn LED trạng thái.',
  image_url    = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600'
WHERE id = 39;

UPDATE products SET
  product_name = 'Đĩa game PS5 Marvel Spider-Man 2',
  description  = 'Bom tấn hành động độc quyền PS5, đồ họa Unreal Engine 5, 2 nhân vật Miles & Peter.',
  image_url    = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600'
WHERE id = 40;

-- =========================================================================
-- BÀN PHÍM CƠ (category_id = 4) - Ảnh bàn phím thực tế, khác nhau
-- =========================================================================
UPDATE products SET
  product_name = 'Bàn phím cơ Keychron K2 V2 Hotswap',
  description  = 'Layout 75%, kết nối Bluetooth 5.1 + Type-C, hotswap, đèn LED trắng.',
  image_url    = 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=600'
WHERE id = 6;

UPDATE products SET
  product_name = 'Bàn phím cơ Razer BlackWidow V4 Pro',
  description  = 'Switch Razer Yellow Linear êm, núm xoay đa năng, đệm tay từ tính, RGB Chroma.',
  image_url    = 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600'
WHERE id = 7;

UPDATE products SET
  product_name = 'Bàn phím cơ Corsair K70 RGB PRO',
  description  = 'Switch Cherry MX Red, khung nhôm nguyên khối, đệm tay cao su, polling 8000Hz.',
  image_url    = 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600'
WHERE id = 21;

UPDATE products SET
  product_name = 'Bàn phím cơ Akko 3098B Plus',
  description  = 'Kết nối 3 chế độ USB/Bluetooth/2.4GHz, switch CS Jelly Pink êm, RGB mặt bên.',
  image_url    = 'https://images.unsplash.com/photo-1626958390898-162d3577f593?w=600'
WHERE id = 22;

UPDATE products SET
  product_name = 'Bàn phím cơ SteelSeries Apex Pro TKL',
  description  = 'Switch OmniPoint 2.0 tùy chỉnh điểm nhận lực 0.1-4mm, OLED Smart Display.',
  image_url    = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600'
WHERE id = 23;

UPDATE products SET
  product_name = 'Bàn phím cơ Leopold FC900R PD',
  description  = 'Full size cao cấp Hàn Quốc, switch Cherry Silent Red không tiếng, keycap PBT bền.',
  image_url    = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'
WHERE id = 41;

UPDATE products SET
  product_name = 'Bàn phím cơ Glorious GMMK 2 65%',
  description  = 'Layout 65% compact, hotswap 5-pin, switch Glorious Fox siêu mượt, foam giảm ồn.',
  image_url    = 'https://images.unsplash.com/photo-1626958390904-58e1c6674eb9?w=600'
WHERE id = 42;

-- =========================================================================
-- CHUỘT GAMING (category_id = 5) - Ảnh chuột gaming thực tế, khác nhau
-- =========================================================================
UPDATE products SET
  product_name = 'Chuột Logitech G Pro X Superlight 2',
  description  = 'Siêu nhẹ 60g, cảm biến HERO 2 25600 DPI, kết nối Lightspeed 2.4GHz.',
  image_url    = 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'
WHERE id = 8;

UPDATE products SET
  product_name = 'Chuột Razer DeathAdder V3 Pro',
  description  = 'Ergonomic 63g, cảm biến Focus Pro 30K DPI, HyperSpeed Wireless 4K polling.',
  image_url    = 'https://images.unsplash.com/photo-1617096200347-ac043d81f14a?w=600'
WHERE id = 24;

UPDATE products SET
  product_name = 'Chuột ASUS ROG Harpe Ace Aim Lab',
  description  = 'Siêu nhẹ 54g, cảm biến ROG AimPoint 36K DPI, 3 chế độ kết nối wired/2.4G/BT.',
  image_url    = 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600'
WHERE id = 25;

UPDATE products SET
  product_name = 'Chuột SteelSeries Rival 3 Wired',
  description  = 'Cảm biến TrueMove Core 8500 DPI, 6 nút lập trình, đèn RGB prism 3-zone.',
  image_url    = 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=600'
WHERE id = 26;

UPDATE products SET
  product_name = 'Chuột Logitech G502 X Plus',
  description  = 'Cảm biến HERO 25K, switch Lightforce hybrid, 89g, Lightsync RGB 13 vùng.',
  image_url    = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'
WHERE id = 43;

UPDATE products SET
  product_name = 'Chuột Razer Basilisk V3 Pro',
  description  = 'Con lăn HyperScroll Smart-Reel, Focus Pro 30K DPI, HyperSpeed + Bluetooth 5.0.',
  image_url    = 'https://images.unsplash.com/photo-1492553769029-c45f7e4e30c3?w=600'
WHERE id = 44;

-- =========================================================================
-- MÀN HÌNH (category_id = 6) - Ảnh màn hình thực tế, khác nhau
-- =========================================================================
UPDATE products SET
  product_name = 'Màn hình ASUS ROG Strix XG27AQ',
  description  = '27in 2K QHD IPS 170Hz 1ms, G-Sync Compatible, FreeSync Premium Pro, HDR400.',
  image_url    = 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600'
WHERE id = 9;

UPDATE products SET
  product_name = 'Màn hình LG UltraGear 27GR75Q-B',
  description  = '27in 2K QHD IPS 165Hz 1ms, G-Sync Compatible, FreeSync Premium, Nano IPS.',
  image_url    = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600'
WHERE id = 27;

UPDATE products SET
  product_name = 'Màn hình Samsung Odyssey G5 34in Cong',
  description  = '34in UltraWide Curved 1000R, UWQHD 3440x1440, 165Hz, 1ms, QLED, FreeSync Pro.',
  image_url    = 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600'
WHERE id = 28;

UPDATE products SET
  product_name = 'Màn hình ViewSonic VX2428 180Hz',
  description  = '24in FHD Fast IPS 180Hz 0.5ms, không viền 3 cạnh, HDR10, FreeSync Premium.',
  image_url    = 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600'
WHERE id = 29;

UPDATE products SET
  product_name = 'Màn hình Dell UltraSharp U2724D',
  description  = '27in 2K IPS Black 2000:1, 120Hz, sạc USB-C 90W, 98% DCI-P3 chuẩn đồ họa.',
  image_url    = 'https://images.unsplash.com/photo-1615750185825-fa94bd79e4d0?w=600'
WHERE id = 45;

UPDATE products SET
  product_name = 'Màn hình MSI Optix G274 Rapid IPS',
  description  = '27in FHD Rapid IPS 170Hz 1ms, G-Sync + FreeSync Premium, Night Vision.',
  image_url    = 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600'
WHERE id = 46;

-- =========================================================================
-- TAI NGHE (category_id = 7) - Ảnh tai nghe thực tế, khác nhau
-- =========================================================================
UPDATE products SET
  product_name = 'Tai nghe Sony WH-1000XM5',
  description  = 'ANC đỉnh cao 8 mic, pin 30 giờ, LDAC Hi-Res, kết nối Multipoint 2 thiết bị.',
  image_url    = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
WHERE id = 10;

UPDATE products SET
  product_name = 'Tai nghe Razer BlackShark V2 Pro',
  description  = 'HyperSpeed 2.4GHz, màng loa TriForce Titanium 50mm, mic cardioid siêu chỉ hướng.',
  image_url    = 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600'
WHERE id = 30;

UPDATE products SET
  product_name = 'Tai nghe Apple AirPods Max',
  description  = 'Vỏ nhôm cao cấp, đệm tai memory foam, chip H1, ANC, Spatial Audio 3D.',
  image_url    = 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600'
WHERE id = 31;

UPDATE products SET
  product_name = 'Tai nghe HyperX Cloud III Wired',
  description  = 'Màng loa 53mm nghiêng 10°, âm thanh vòm DTS 7.1, mic tách rời khử ồn AI.',
  image_url    = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
WHERE id = 32;

UPDATE products SET
  product_name = 'Tai nghe SteelSeries Arctis Nova 7',
  description  = 'Không dây đa nền tảng PC/Mac/PS/Switch, pin 38 giờ, 2.4GHz + Bluetooth.',
  image_url    = 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600'
WHERE id = 47;

UPDATE products SET
  product_name = 'Tai nghe Marshall Monitor II ANC',
  description  = 'ANC hybrid tùy chỉnh, driver 40mm Marshall, pin 30 giờ ANC on, âm trầm căng.',
  image_url    = 'https://images.unsplash.com/photo-1546435770-a3e736769a50?w=600'
WHERE id = 48;

-- =========================================================================
-- SSD (category_id = 8) - Ảnh linh kiện SSD thực tế, khác nhau
-- =========================================================================
UPDATE products SET
  product_name = 'SSD Samsung 990 Pro 1TB NVMe M.2',
  description  = 'Đọc 7450 MB/s, ghi 6900 MB/s, PCIe 4.0 x4 NVMe 2.0, Dynamic Thermal Guard.',
  image_url    = 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=600'
WHERE id = 11;

UPDATE products SET
  product_name = 'SSD Kingston NV2 1TB PCIe 4.0 NVMe',
  description  = 'Đọc 3500 MB/s, ghi 2100 MB/s, M.2 2280, nâng cấp laptop và PC phổ thông.',
  image_url    = 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=600'
WHERE id = 33;

UPDATE products SET
  product_name = 'SSD WD Black SN850X 2TB PCIe Gen4',
  description  = 'Đọc 7300 MB/s, ghi 6600 MB/s, tương thích PS5 và PC, Gaming Mode tự tối ưu.',
  image_url    = 'https://images.unsplash.com/photo-1597872200919-281df04a91d1?w=600'
WHERE id = 34;

UPDATE products SET
  product_name = 'SSD Crucial P3 Plus 1TB PCIe Gen4',
  description  = 'Đọc 5000 MB/s, ghi 3600 MB/s, PCIe Gen4 NVMe, tiêu thụ điện thấp.',
  image_url    = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600'
WHERE id = 49;

UPDATE products SET
  product_name = 'SSD MSI Spatium M480 PRO 2TB',
  description  = 'Đọc 7400 MB/s, ghi 7000 MB/s, PCIe Gen4 x4, M.2 2280, tản nhiệt graphene pad.',
  image_url    = 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600'
WHERE id = 50;

-- =========================================================================
-- PHỤ KIỆN MÁY TÍNH (category_id = 9) - Ảnh đúng phụ kiện, khác nhau
-- =========================================================================
UPDATE products SET
  product_name = 'Hub USB-C 7-in-1 Anker PowerExpand',
  description  = 'HDMI 4K@60Hz, 2x USB-A 3.0, SD/MicroSD, sạc ngược PD 100W, thiết kế siêu mỏng.',
  image_url    = 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600'
WHERE id = 51;

UPDATE products SET
  product_name = 'Giá đỡ Laptop Nhôm Orico PFB-A4',
  description  = 'Hợp kim nhôm nguyên khối, 6 góc nghiêng, 4 rãnh thoát nhiệt, gấp gọn mang đi.',
  image_url    = 'https://images.unsplash.com/photo-1619579200730-faf39680a97d?w=600'
WHERE id = 52;

UPDATE products SET
  product_name = 'Bungee cáp chuột BenQ Zowie CAMADE II',
  description  = 'Giữ cáp chuột linh hoạt, lò xo điều chỉnh độ cao, đế nặng chống trượt.',
  image_url    = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'
WHERE id = 53;

UPDATE products SET
  product_name = 'Đèn kẹp màn hình Baseus i-Wok LED',
  description  = 'Chống chói, điều chỉnh 3 chế độ màu 3000K-6500K, điều khiển cảm ứng.',
  image_url    = 'https://images.unsplash.com/photo-1563770557593-5c5359f26824?w=600'
WHERE id = 54;

UPDATE products SET
  product_name = 'Lót chuột Razer Strider XXL Hybrid',
  description  = 'Kích thước 900x400mm, bề mặt lai hard/soft, chống thấm nước, viền may chắc.',
  image_url    = 'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=600'
WHERE id = 55;

-- =========================================================================
-- DỌN DẸP DỮ LIỆU RÁC VÀ TRÙNG LẶP
-- =========================================================================

-- 1. Xóa sản phẩm trùng tên (Giữ lại sản phẩm có id lớn nhất)
DELETE p1 FROM products p1
INNER JOIN products p2 
WHERE p1.product_name = p2.product_name AND p1.id < p2.id;

-- 2. Xóa các sản phẩm test/rác (Tên quá ngắn hoặc ảnh mơ hồ không hợp lệ)
DELETE FROM products 
WHERE LENGTH(product_name) < 5 
   OR image_url IS NULL 
   OR image_url = ''
   OR image_url NOT LIKE 'http%';

-- Xác nhận hoàn thành
SELECT CONCAT('Sau khi dọn dẹp, còn lại ', COUNT(*), ' sản phẩm hợp lệ') AS ket_qua FROM products;
