# LMS Platform

Hệ thống quản lý học tập trực tuyến (LMS) được xây dựng với Spring Boot 4.1.x (Java 25) và React 19.

## 1. Yêu cầu hệ thống
- Java 25
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose (cho PostgreSQL)

## 2. Cấu trúc dự án
- `/backend`: Mã nguồn Spring Boot API.
- `/src`: Mã nguồn React Frontend (Vite).
- `docker-compose.yml`: Cấu hình database PostgreSQL.

## 3. Chạy Database (PostgreSQL)
Mở terminal tại thư mục gốc và chạy lệnh:
```bash
docker-compose up -d
```
Database sẽ chạy ở `localhost:5432`, user: `lms_user`, pass: `lms_password`, db: `lms_db`.

## 4. Chạy Backend (Spring Boot)
Di chuyển vào thư mục backend và chạy ứng dụng:
```bash
cd backend
mvn spring-boot:run
```
Flyway sẽ tự động chạy các file migration trong `src/main/resources/db/migration/` để tạo bảng và nạp seed data.
API sẽ chạy tại `http://localhost:8080`.
Tài liệu API (Swagger UI): `http://localhost:8080/swagger-ui.html`

## 5. Chạy Frontend (React)
Mở một terminal mới tại thư mục gốc của dự án:
```bash
npm install
npm run dev
```
Frontend sẽ chạy tại `http://localhost:3000`.

## 6. Biến môi trường quan trọng
**Backend (`application.yml`)**
- `spring.datasource.url`: Cấu hình URL kết nối DB.
- `jwt.secret`: Khóa bí mật dùng để ký JWT Token (Cần thay đổi trên môi trường Production).

**Frontend (`src/lib/api.ts`)**
- Base URL hiện tại đang gọi vào `/api/v1`. Bạn có thể cấu hình lại biến môi trường `VITE_API_URL` khi triển khai thực tế.

## 7. Tài khoản Seed Data mặc định
Mật khẩu cho tất cả tài khoản dưới đây là: **password**

- **Admin:** `admin@lms.com`
- **Instructor:** `instructor@lms.com`
- **Student:** `student@lms.com`
