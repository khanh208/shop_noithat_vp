-- Script khởi tạo database cho Shop Nội Thất Văn Phòng

-- Tạo database (chạy với quyền superuser)
-- CREATE DATABASE shop_noithat_vp;

-- Kết nối vào database
-- \c shop_noithat_vp;

-- Tạo extension nếu cần
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lưu ý: Các bảng sẽ được tạo tự động bởi Hibernate với ddl-auto=update
-- Script này chỉ để tham khảo cấu trúc

-- Bảng users đã được tạo tự động
-- Bảng categories đã được tạo tự động
-- Bảng products đã được tạo tự động
-- Bảng orders đã được tạo tự động
-- ... (tất cả các bảng sẽ được tạo tự động)

-- Tạo user admin mẫu (sau khi đã đăng ký tài khoản)
-- UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

-- Hoặc tạo trực tiếp (mật khẩu đã được hash bằng BCrypt)
-- INSERT INTO users (username, email, password, full_name, role, is_active, is_email_verified, created_at, updated_at, is_deleted)
-- VALUES ('admin', 'admin@example.com', '$2a$10$...', 'Administrator', 'ADMIN', true, true, NOW(), NOW(), false);

-- Tạo dữ liệu mẫu cho categories
INSERT INTO categories (name, slug, description, is_active, display_order, created_at, updated_at, is_deleted)
VALUES 
    ('Bàn làm việc', 'ban-lam-viec', 'Bàn làm việc văn phòng', true, 1, NOW(), NOW(), false),
    ('Ghế văn phòng', 'ghe-van-phong', 'Ghế ngồi làm việc', true, 2, NOW(), NOW(), false),
    ('Tủ hồ sơ', 'tu-ho-so', 'Tủ đựng tài liệu', true, 3, NOW(), NOW(), false),
    ('Kệ sách', 'ke-sach', 'Kệ để sách và tài liệu', true, 4, NOW(), NOW(), false)
ON CONFLICT DO NOTHING;

-- Tạo dữ liệu mẫu cho products (cần category_id hợp lệ)
-- INSERT INTO products (name, slug, description, price, stock_quantity, category_id, is_active, created_at, updated_at, is_deleted)
-- VALUES 
--     ('Bàn làm việc gỗ cao cấp', 'ban-lam-viec-go-cao-cap', 'Bàn làm việc chất liệu gỗ tự nhiên', 2500000, 10, 1, true, NOW(), NOW(), false)
-- ON CONFLICT DO NOTHING;




