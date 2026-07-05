SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Sửa lỗi font chữ danh mục
UPDATE categories SET category_name = 'Điện thoại' WHERE category_name LIKE '%ÄĐiá»‡n thoáº¡i%';
UPDATE categories SET category_name = 'Bàn phím cơ' WHERE category_name LIKE '%BÃ n phÃm cÆ¡%';
UPDATE categories SET category_name = 'Chuột gaming' WHERE category_name LIKE '%Chuá»™t gaming%';
UPDATE categories SET category_name = 'Màn hình' WHERE category_name LIKE '%MÃ n hÃ¬nh%';

-- Sửa lỗi font chữ trong tên sản phẩm
UPDATE products SET product_name = REPLACE(product_name, 'ÄĐiá»‡n thoáº¡i', 'Điện thoại');
UPDATE products SET product_name = REPLACE(product_name, 'BÃ n phÃm cÆ¡', 'Bàn phím cơ');
UPDATE products SET product_name = REPLACE(product_name, 'Chuá»™t gaming', 'Chuột gaming');
UPDATE products SET product_name = REPLACE(product_name, 'MÃ n hÃ¬nh', 'Màn hình');
UPDATE products SET product_name = REPLACE(product_name, 'Ã ', 'à');
UPDATE products SET product_name = REPLACE(product_name, 'Ã¡', 'á');
UPDATE products SET product_name = REPLACE(product_name, 'Ã¢', 'â');

-- Sửa lỗi font chữ trong mô tả
UPDATE products SET description = REPLACE(description, 'ÄĐiá»‡n thoáº¡i', 'Điện thoại');
UPDATE products SET description = REPLACE(description, 'BÃ n phÃm cÆ¡', 'Bàn phím cơ');
UPDATE products SET description = REPLACE(description, 'Chuá»™t gaming', 'Chuột gaming');
UPDATE products SET description = REPLACE(description, 'MÃ n hÃ¬nh', 'Màn hình');
UPDATE products SET description = REPLACE(description, 'thá» i gian pháº£n há»“i', 'thời gian phản hồi');
UPDATE products SET description = REPLACE(description, 'Thiáº¿t káº¿', 'Thiết kế');
