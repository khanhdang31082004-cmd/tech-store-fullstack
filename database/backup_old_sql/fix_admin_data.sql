-- Script sửa lỗi font chữ tiếng Việt trên Database (Railway live)
-- Cập nhật bảng users
UPDATE users SET full_name = REPLACE(full_name, 'VÄn', 'Văn') WHERE full_name LIKE '%VÄn%';
UPDATE users SET full_name = REPLACE(full_name, 'VÄƒn', 'Văn') WHERE full_name LIKE '%VÄƒn%';
UPDATE users SET full_name = REPLACE(full_name, 'KhÃ¡ch', 'Khách') WHERE full_name LIKE '%KhÃ¡ch%';
UPDATE users SET full_name = REPLACE(full_name, 'KhÃ¡nh', 'Khánh') WHERE full_name LIKE '%KhÃ¡nh%';
UPDATE users SET full_name = REPLACE(full_name, 'HÃ ng', 'Hàng') WHERE full_name LIKE '%HÃ ng%';
UPDATE users SET hometown = REPLACE(hometown, 'HÃ Ná»™i', 'Hà Nội') WHERE hometown LIKE '%HÃ Ná»™i%';
UPDATE users SET hometown = REPLACE(hometown, 'Quáºn', 'Quận') WHERE hometown LIKE '%Quáºn%';

-- Cập nhật bảng customers
UPDATE customers SET full_name = REPLACE(full_name, 'VÄn', 'Văn') WHERE full_name LIKE '%VÄn%';
UPDATE customers SET full_name = REPLACE(full_name, 'VÄƒn', 'Văn') WHERE full_name LIKE '%VÄƒn%';
UPDATE customers SET full_name = REPLACE(full_name, 'KhÃ¡ch', 'Khách') WHERE full_name LIKE '%KhÃ¡ch%';
UPDATE customers SET full_name = REPLACE(full_name, 'KhÃ¡nh', 'Khánh') WHERE full_name LIKE '%KhÃ¡nh%';
UPDATE customers SET full_name = REPLACE(full_name, 'HÃ ng', 'Hàng') WHERE full_name LIKE '%HÃ ng%';

UPDATE customers SET address = REPLACE(address, 'ÄĐường', 'Đường') WHERE address LIKE '%ÄĐường%';
UPDATE customers SET address = REPLACE(address, 'Ä ', 'Đ ') WHERE address LIKE '%Ä %';
UPDATE customers SET address = REPLACE(address, 'Quáºn', 'Quận') WHERE address LIKE '%Quáºn%';
UPDATE customers SET address = REPLACE(address, 'HÃ Ná»™i', 'Hà Nội') WHERE address LIKE '%HÃ Ná»™i%';
UPDATE customers SET address = REPLACE(address, 'Cầu Giáº¥y', 'Cầu Giấy') WHERE address LIKE '%Cầu Giáº¥y%';

-- Cập nhật bảng orders
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'VÄn', 'Văn') WHERE shipping_address LIKE '%VÄn%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'VÄƒn', 'Văn') WHERE shipping_address LIKE '%VÄƒn%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'KhÃ¡ch', 'Khách') WHERE shipping_address LIKE '%KhÃ¡ch%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'KhÃ¡nh', 'Khánh') WHERE shipping_address LIKE '%KhÃ¡nh%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'HÃ ng', 'Hàng') WHERE shipping_address LIKE '%HÃ ng%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'ÄĐường', 'Đường') WHERE shipping_address LIKE '%ÄĐường%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'Ä ', 'Đ ') WHERE shipping_address LIKE '%Ä %';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'Quáºn', 'Quận') WHERE shipping_address LIKE '%Quáºn%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'HÃ Ná»™i', 'Hà Nội') WHERE shipping_address LIKE '%HÃ Ná»™i%';
UPDATE orders SET shipping_address = REPLACE(shipping_address, 'Cầu Giáº¥y', 'Cầu Giấy') WHERE shipping_address LIKE '%Cầu Giáº¥y%';

-- Cập nhật bảng stores
UPDATE stores SET store_name = REPLACE(store_name, 'HÃ Ná»™i', 'Hà Nội') WHERE store_name LIKE '%HÃ Ná»™i%';
UPDATE stores SET store_name = REPLACE(store_name, 'Quáºn', 'Quận') WHERE store_name LIKE '%Quáºn%';

UPDATE stores SET address = REPLACE(address, 'ÄĐường', 'Đường') WHERE address LIKE '%ÄĐường%';
UPDATE stores SET address = REPLACE(address, 'Ä ', 'Đ ') WHERE address LIKE '%Ä %';
UPDATE stores SET address = REPLACE(address, 'Quáºn', 'Quận') WHERE address LIKE '%Quáºn%';
UPDATE stores SET address = REPLACE(address, 'HÃ Ná»™i', 'Hà Nội') WHERE address LIKE '%HÃ Ná»™i%';
UPDATE stores SET address = REPLACE(address, 'Cầu Giáº¥y', 'Cầu Giấy') WHERE address LIKE '%Cầu Giáº¥y%';
