# LMS Platform

Hệ thống quản lý học tập trực tuyến (LMS) xây dựng với Spring Boot 4.1 (Java 25) và React 19.

## 1. Yêu cầu hệ thống
- Java 25
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose (cho PostgreSQL)

## 2. Cấu trúc dự án
- `backend/` — Spring Boot REST API (Maven). Deploy dạng JAR lên Azure Web App `hcmute-lms`.
- `frontend/` — React 19 + Vite SPA (TypeScript). Deploy lên GitHub Pages.
- `docker-compose.yml` — PostgreSQL 18 cho local backend.
- `.github/workflows/` — CI/CD tự động deploy backend & frontend.

## 3. Chạy Database (PostgreSQL)
Mở terminal tại thư mục gốc:
```bash
docker compose up -d
```
Database chạy ở `localhost:5432`, user: `lms_user`, pass: `lms_password`, db: `lms_db`.

## 4. Chạy Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Flyway tự chạy các migration trong `src/main/resources/db/migration/` (V1→V3) để tạo bảng và nạp seed data.
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 5. Chạy Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Frontend chạy ở `http://localhost:3000`. Lệnh `dev` khởi động một **Express server** (`server.ts`) vừa serve Vite app, vừa **giả lập API `/api/v1`** — nên frontend chạy độc lập, không cần backend.

Các lệnh khác trong `frontend/`:
- `npm run build` — build production (`vite build` + bundle `server.ts`).
- `npm run lint` — type-check bằng `tsc --noEmit`.

## 6. Biến môi trường quan trọng
**Backend** — `application.yml` dùng biến môi trường có default cho local, override khi deploy:
- `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` — kết nối DB.
- `JWT_SECRET` — khóa ký JWT (≥ 32 bytes; bắt buộc đổi ở production).

**Frontend** — `src/lib/api.ts`:
- `VITE_API_URL` — base URL của backend. Bỏ trống ở local → dùng `/api/v1` (mock server). Bản production trỏ tới backend Azure (đặt trong workflow deploy).

## 7. Triển khai (CI/CD)
Đẩy code lên nhánh `main` sẽ tự động deploy, mỗi workflow chỉ chạy khi app tương ứng thay đổi (path filter):
- **Backend** (`.github/workflows/main_hcmute-lms.yml`): build JAR → nạp App Service settings từ GitHub Secrets/Variables có tiền tố `APP_` → deploy lên Azure Web App `hcmute-lms`.
- **Frontend** (`.github/workflows/main.yml`): `npm run build` (nhúng `VITE_API_URL` trỏ backend Azure) → deploy `frontend/dist` lên GitHub Pages.

> Config nhạy cảm (JWT secret, mật khẩu DB) đặt ở **GitHub Secrets**; giá trị không nhạy cảm (URL, username) ở **GitHub Variables** — đều với tiền tố `APP_` để workflow tự đẩy lên Azure.

## 8. Tài khoản Seed Data
Mật khẩu cho tất cả tài khoản là: **password**

- **Admin:** `admin@lms.com`
- **Instructor:** `instructor@lms.com` (và các giảng viên khác: `sarah@lms.com`, `david@lms.com`, `maria@lms.com`)
- **Student:** `student@lms.com` (và nhiều học viên khác: `emma@lms.com`, `liam@lms.com`, ...)

Seed data (migration `V3`) gồm nhiều category, khoá học, section/lesson, enrollment và tiến độ học để giao diện trông sinh động.
