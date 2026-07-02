-- =========================================================================
-- ĐỒ ÁN: SỬA LỖI PHÂN QUYỀN VÀ THÊM THÔNG TIN NHÂN VIÊN
-- =========================================================================

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

-- 5. Sửa lỗi font tiếng Việt cho khách hàng và cửa hàng bị móp méo ký tự
UPDATE customers SET full_name = REPLACE(full_name, 'Nguyá»…n VÄƒn KhÃ¡nh HÃ ng', 'Nguyễn Văn Khánh Hàng');
UPDATE customers SET full_name = REPLACE(full_name, 'Nguyá»…n', 'Nguyễn');
UPDATE customers SET address = REPLACE(address, 'Cáº§u Giáº¥y', 'Cầu Giấy');
UPDATE customers SET address = REPLACE(address, 'Quáºn', 'Quận');
UPDATE customers SET address = REPLACE(address, 'HÃ Ná»™i', 'Hà Nội');

UPDATE stores SET store_name = REPLACE(store_name, 'Cáº§u Giáº¥y', 'Cầu Giấy');
UPDATE stores SET address = REPLACE(address, 'Cáº§u Giáº¥y', 'Cầu Giấy');
UPDATE stores SET address = REPLACE(address, 'Quáºn', 'Quận');
UPDATE stores SET address = REPLACE(address, 'HÃ Ná»™i', 'Hà Nội');
