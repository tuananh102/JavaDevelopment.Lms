-- V4: Sửa password_hash của các tài khoản seed.
--
-- Hash dùng trong V2/V3 ('$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a')
-- KHÔNG phải bcrypt của "password" (dữ liệu bị hỏng), nên mọi tài khoản seed đều đăng
-- nhập thất bại (401 Invalid email or password). KHÔNG được sửa V2/V3 đã áp dụng — cập
-- nhật bằng migration mới này.
--
-- Hash bên dưới là bcrypt HỢP LỆ của "password" (dạng $2b$, Spring BCrypt hỗ trợ). Điều
-- kiện WHERE chỉ chạm các dòng còn mang hash hỏng, nên KHÔNG ảnh hưởng user đăng ký thật.
UPDATE users
SET password_hash = '$2b$10$95S.PSCz4i2Jh6.vXt7d.ewBQ95hvaytsHOdFYue8oCG4yeDByN/i'
WHERE password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a';
