# Tài liệu Thiết kế Hệ thống Học trực tuyến (LMS)

## 1. Kiến trúc Tổng thể (System Architecture)

Hệ thống được thiết kế theo mô hình Client-Server, sử dụng các công nghệ mới nhất tính đến 2026.

### 1.1. Frontend (Client)
- **Framework:** React 19.x kết hợp Vite 8.x.
- **Routing:** React Router v7 (cấu hình SPA/Library mode).
- **State Management:**
  - **Server State:** TanStack Query v5 (quản lý caching, refetching, loading/error states).
  - **Client State:** Zustand v5 (quản lý state nhẹ như UI sidebar, auth status).
- **Styling:** Tailwind CSS v4 (CSS-first, cấu hình trực tiếp qua `@import "tailwindcss"`).
- **Data Fetching:** Axios (cấu hình Interceptors để tự động đính kèm JWT Access Token và xử lý Refresh Token).

### 1.2. Backend (API Server)
- **Framework:** Spring Boot 4.1.x (Spring Framework 7) trên nền Java 25 (LTS).
- **Cấu trúc Source Code (Package Structure):** Ưu tiên cấu trúc theo **Feature-based** (Domain-driven) để dễ maintain và mở rộng.
  - Ví dụ: `com.lms.course`, `com.lms.auth`, `com.lms.progress`,... thay vì chia theo `controller`, `service`, `repository` thuần túy.
- **Security:** Spring Security cấu hình stateless với JWT.
- **API Documentation:** springdoc-openapi (Swagger UI).
- **Data Mapping:** MapStruct + Lombok.
- **Validation:** Spring Boot Validation (`@Valid`, Hibernate Validator).

### 1.3. Database (Lưu trữ)
- **RDBMS:** PostgreSQL 18.
- **ORM:** Spring Data JPA (Hibernate).
- **Database Migration:** Flyway (`V1__init_schema.sql`).

---

## 2. Mô hình Dữ liệu (Data Model - ERD)

Dưới đây là thiết kế các bảng chính dựa trên yêu cầu:

### `users`
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE, INDEX)
- `password_hash` (VARCHAR)
- `full_name` (VARCHAR)
- `role` (ENUM: STUDENT, INSTRUCTOR, ADMIN)
- `is_active` (BOOLEAN, default: true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `categories`
- `id` (UUID, PK)
- `name` (VARCHAR)
- `slug` (VARCHAR, UNIQUE, INDEX)

### `courses`
- `id` (UUID, PK)
- `title` (VARCHAR)
- `slug` (VARCHAR, UNIQUE, INDEX)
- `description` (TEXT)
- `thumbnail_url` (VARCHAR)
- `price` (DECIMAL) -- 0 nếu là free
- `level` (ENUM: BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS)
- `status` (ENUM: DRAFT, PUBLISHED, ARCHIVED)
- `category_id` (UUID, FK -> categories.id)
- `instructor_id` (UUID, FK -> users.id, INDEX)
- `created_at`, `updated_at` (TIMESTAMP)

### `sections`
- `id` (UUID, PK)
- `course_id` (UUID, FK -> courses.id, INDEX)
- `title` (VARCHAR)
- `order_index` (INTEGER) -- Dùng để reorder

### `lessons`
- `id` (UUID, PK)
- `section_id` (UUID, FK -> sections.id, INDEX)
- `title` (VARCHAR)
- `type` (ENUM: VIDEO, ARTICLE)
- `content_url` (VARCHAR) -- Link video (YouTube/S3/Vimeo)
- `content_text` (TEXT) -- Nội dung bài text (Markdown/HTML)
- `duration_seconds` (INTEGER)
- `order_index` (INTEGER)

### `enrollments`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id)
- `course_id` (UUID, FK -> courses.id)
- `enrolled_at` (TIMESTAMP)
- *Constraint:* `UNIQUE(user_id, course_id)`

### `lesson_progress`
- `id` (UUID, PK)
- `enrollment_id` (UUID, FK -> enrollments.id, INDEX)
- `lesson_id` (UUID, FK -> lessons.id)
- `status` (ENUM: NOT_STARTED, IN_PROGRESS, COMPLETED)
- `last_position_seconds` (INTEGER) -- Lưu vị trí video đang xem
- `completed_at` (TIMESTAMP)
- *Constraint:* `UNIQUE(enrollment_id, lesson_id)`

---

## 3. Các quyết định thiết kế quan trọng

1. **Hiệu năng Progress Tracking:** Thay vì tính toán % hoàn thành của Course bằng cách query đếm lesson liên tục, ta có thể query theo thời gian thực (vì số lesson/course thường không quá lớn), nhưng nếu tối ưu, có thể thêm trường `completion_percentage` (hoặc `completed_lessons_count`) vào bảng `enrollments` và update bất đồng bộ khi user mark complete một lesson. *Đề xuất ban đầu: Query count trực tiếp để dữ liệu luôn chính xác (tránh anomaly).*
2. **Reorder Section/Lesson:** Sử dụng trường `order_index` (int). Khi cập nhật thứ tự từ frontend (Drag & Drop), gửi mảng ID cùng thứ tự mới xuống API (`PATCH /sections/reorder`) để batch update `order_index`.
3. **Phân biệt Role:** Sẽ được xử lý qua Method Security (`@PreAuthorize("hasRole('INSTRUCTOR')")`) ở tầng Controller/Service.

---
