-- V3: Thêm nhiều seed data cho sinh động (users, categories, courses, sections, lessons, enrollments, progress)
-- Mật khẩu của tất cả user vẫn là: password
-- Ghi chú: file này chạy sau V2. KHÔNG sửa V1/V2 đã chạy — muốn đổi thì tạo V4.

-- =========================================================================
-- 1. CATEGORIES (thêm 5 nhóm ngành, đã có: web-development, backend)
-- =========================================================================
INSERT INTO categories (id, name, slug) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Data Science',            'data-science'),
    ('c0000000-0000-0000-0000-000000000002', 'Mobile Development',      'mobile-development'),
    ('c0000000-0000-0000-0000-000000000003', 'DevOps & Cloud',          'devops-cloud'),
    ('c0000000-0000-0000-0000-000000000004', 'Design',                  'design'),
    ('c0000000-0000-0000-0000-000000000005', 'AI & Machine Learning',   'ai-machine-learning');

-- =========================================================================
-- 2. USERS
--    Instructors: prefix a...  |  Students: prefix b...
--    Hash bên dưới = bcrypt của "password" (lấy lại từ V2)
-- =========================================================================
INSERT INTO users (id, email, password_hash, full_name, role, is_active) VALUES
    -- Instructors
    ('a0000000-0000-0000-0000-000000000001', 'sarah@lms.com',   '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Sarah Chen',       'INSTRUCTOR', true),
    ('a0000000-0000-0000-0000-000000000002', 'david@lms.com',   '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'David Kumar',      'INSTRUCTOR', true),
    ('a0000000-0000-0000-0000-000000000003', 'maria@lms.com',   '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Maria Garcia',     'INSTRUCTOR', true),
    -- Students
    ('b0000000-0000-0000-0000-000000000001', 'emma@lms.com',    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Emma Wilson',      'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000002', 'liam@lms.com',    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Liam Nguyen',      'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000003', 'olivia@lms.com',  '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Olivia Tran',      'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000004', 'noah@lms.com',    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Noah Pham',        'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000005', 'ava@lms.com',     '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Ava Le',           'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000006', 'ethan@lms.com',   '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Ethan Vo',         'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000007', 'mia@lms.com',     '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Mia Dang',         'STUDENT', true),
    ('b0000000-0000-0000-0000-000000000008', 'james@lms.com',   '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'James Bui',        'STUDENT', false); -- bị vô hiệu hoá

-- =========================================================================
-- 3. COURSES (thêm 10 khoá; đã có 1 khoá ở V2)
--    Mix: level khác nhau, giá khác nhau, PUBLISHED & DRAFT, free & paid
--    created_at lệch nhau để danh sách trông tự nhiên khi sort
-- =========================================================================
INSERT INTO courses (id, title, slug, description, thumbnail_url, price, level, status, category_id, instructor_id, created_at) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Modern JavaScript from Zero to Hero', 'modern-javascript-zero-to-hero',
        'Master the fundamentals of JavaScript ES2024: variables, functions, async/await, modules, and the DOM. Perfect for absolute beginners.',
        'https://picsum.photos/seed/js101/600/400', 0.00, 'BEGINNER', 'PUBLISHED', '44444444-4444-4444-4444-444444444444', 'a0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '40 days'),

    ('d0000000-0000-0000-0000-000000000002', 'React 19 Deep Dive', 'react-19-deep-dive',
        'Go beyond the basics with React 19: Server Components, the new use() hook, Suspense, transitions, and performance patterns.',
        'https://picsum.photos/seed/react19/600/400', 59.99, 'INTERMEDIATE', 'PUBLISHED', '44444444-4444-4444-4444-444444444444', 'a0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '35 days'),

    ('d0000000-0000-0000-0000-000000000003', 'Mastering PostgreSQL', 'mastering-postgresql',
        'Deep dive into PostgreSQL 18: indexing strategies, query optimization, transactions, JSONB, and replication for production systems.',
        'https://picsum.photos/seed/pg18/600/400', 44.99, 'ADVANCED', 'PUBLISHED', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '30 days'),

    ('d0000000-0000-0000-0000-000000000004', 'Python for Data Science', 'python-for-data-science',
        'Learn NumPy, Pandas, and Matplotlib to clean, analyze, and visualize real-world datasets. No prior experience required.',
        'https://picsum.photos/seed/pyds/600/400', 39.99, 'BEGINNER', 'PUBLISHED', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '28 days'),

    ('d0000000-0000-0000-0000-000000000005', 'Machine Learning with TensorFlow', 'machine-learning-tensorflow',
        'Build and train neural networks with TensorFlow 2 and Keras. Covers CNNs, RNNs, transfer learning, and model deployment.',
        'https://picsum.photos/seed/mltf/600/400', 79.99, 'ADVANCED', 'PUBLISHED', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '25 days'),

    ('d0000000-0000-0000-0000-000000000006', 'Docker & Kubernetes in Practice', 'docker-kubernetes-in-practice',
        'Containerize applications with Docker and orchestrate them with Kubernetes. Includes Helm, ingress, and CI/CD pipelines.',
        'https://picsum.photos/seed/k8s/600/400', 54.99, 'INTERMEDIATE', 'PUBLISHED', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '20 days'),

    ('d0000000-0000-0000-0000-000000000007', 'iOS App Development with Swift', 'ios-app-development-swift',
        'Build native iOS apps with Swift and SwiftUI. From your first screen to publishing on the App Store.',
        'https://picsum.photos/seed/ios/600/400', 64.99, 'INTERMEDIATE', 'PUBLISHED', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '15 days'),

    ('d0000000-0000-0000-0000-000000000008', 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals',
        'Learn the principles of great design: color theory, typography, layout, and prototyping with Figma.',
        'https://picsum.photos/seed/uiux/600/400', 29.99, 'BEGINNER', 'PUBLISHED', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '10 days'),

    -- Hai khoá DRAFT: chưa publish, chỉ instructor/admin thấy
    ('d0000000-0000-0000-0000-000000000009', 'Advanced TypeScript Patterns', 'advanced-typescript-patterns',
        'Generics, conditional types, mapped types, and building fully type-safe APIs. (Đang soạn nội dung.)',
        'https://picsum.photos/seed/ts/600/400', 49.99, 'ADVANCED', 'DRAFT', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '5 days'),

    ('d0000000-0000-0000-0000-00000000000a', 'Introduction to Cloud Computing', 'introduction-to-cloud-computing',
        'A gentle overview of cloud concepts across AWS, Azure, and GCP. (Đang soạn nội dung.)',
        'https://picsum.photos/seed/cloud/600/400', 0.00, 'ALL_LEVELS', 'DRAFT', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- =========================================================================
-- 4. SECTIONS + LESSONS cho vài khoá PUBLISHED
-- =========================================================================

-- Course d...01: Modern JavaScript
INSERT INTO sections (id, course_id, title, order_index) VALUES
    ('e0000000-0000-0000-0000-000000000101', 'd0000000-0000-0000-0000-000000000001', 'The Basics', 1),
    ('e0000000-0000-0000-0000-000000000102', 'd0000000-0000-0000-0000-000000000001', 'Functions & Scope', 2);
INSERT INTO lessons (id, section_id, title, type, content_url, duration_seconds, order_index) VALUES
    ('f0000000-0000-0000-0000-000000000101', 'e0000000-0000-0000-0000-000000000101', 'What is JavaScript?',        'VIDEO', 'https://www.youtube.com/embed/W6NZfCO5SIk', 480, 1),
    ('f0000000-0000-0000-0000-000000000102', 'e0000000-0000-0000-0000-000000000101', 'Variables & Data Types',     'VIDEO', 'https://www.youtube.com/embed/9emXNzqCKyg', 600, 2),
    ('f0000000-0000-0000-0000-000000000103', 'e0000000-0000-0000-0000-000000000101', 'Operators Cheat Sheet',      'ARTICLE', NULL, 300, 3),
    ('f0000000-0000-0000-0000-000000000104', 'e0000000-0000-0000-0000-000000000102', 'Declaring Functions',        'VIDEO', 'https://www.youtube.com/embed/N8ap4k_1QEQ', 720, 1),
    ('f0000000-0000-0000-0000-000000000105', 'e0000000-0000-0000-0000-000000000102', 'Closures Explained',         'ARTICLE', NULL, 540, 2);

-- Course d...02: React 19 Deep Dive
INSERT INTO sections (id, course_id, title, order_index) VALUES
    ('e0000000-0000-0000-0000-000000000201', 'd0000000-0000-0000-0000-000000000002', 'React Foundations Recap', 1),
    ('e0000000-0000-0000-0000-000000000202', 'd0000000-0000-0000-0000-000000000002', 'Server Components', 2);
INSERT INTO lessons (id, section_id, title, type, content_url, duration_seconds, order_index) VALUES
    ('f0000000-0000-0000-0000-000000000201', 'e0000000-0000-0000-0000-000000000201', 'Hooks You Should Know',      'VIDEO', 'https://www.youtube.com/embed/TNhaISOUy6Q', 900, 1),
    ('f0000000-0000-0000-0000-000000000202', 'e0000000-0000-0000-0000-000000000201', 'Rendering & Reconciliation', 'ARTICLE', NULL, 600, 2),
    ('f0000000-0000-0000-0000-000000000203', 'e0000000-0000-0000-0000-000000000202', 'Intro to Server Components', 'VIDEO', 'https://www.youtube.com/embed/T8TZQ6k4SLE', 1080, 1),
    ('f0000000-0000-0000-0000-000000000204', 'e0000000-0000-0000-0000-000000000202', 'The use() Hook',            'VIDEO', 'https://www.youtube.com/embed/g_pRQhw6WFA', 840, 2);

-- Course d...03: Mastering PostgreSQL
INSERT INTO sections (id, course_id, title, order_index) VALUES
    ('e0000000-0000-0000-0000-000000000301', 'd0000000-0000-0000-0000-000000000003', 'Indexing', 1),
    ('e0000000-0000-0000-0000-000000000302', 'd0000000-0000-0000-0000-000000000003', 'Query Optimization', 2);
INSERT INTO lessons (id, section_id, title, type, content_url, duration_seconds, order_index) VALUES
    ('f0000000-0000-0000-0000-000000000301', 'e0000000-0000-0000-0000-000000000301', 'B-Tree vs GIN vs BRIN',      'VIDEO', 'https://www.youtube.com/embed/clrtT_4WBAw', 960, 1),
    ('f0000000-0000-0000-0000-000000000302', 'e0000000-0000-0000-0000-000000000301', 'Partial & Covering Indexes', 'ARTICLE', NULL, 480, 2),
    ('f0000000-0000-0000-0000-000000000303', 'e0000000-0000-0000-0000-000000000302', 'Reading EXPLAIN ANALYZE',    'VIDEO', 'https://www.youtube.com/embed/clrtT_4WBAw', 1200, 1);

-- Course d...04: Python for Data Science
INSERT INTO sections (id, course_id, title, order_index) VALUES
    ('e0000000-0000-0000-0000-000000000401', 'd0000000-0000-0000-0000-000000000004', 'NumPy Essentials', 1),
    ('e0000000-0000-0000-0000-000000000402', 'd0000000-0000-0000-0000-000000000004', 'Pandas for Analysis', 2);
INSERT INTO lessons (id, section_id, title, type, content_url, duration_seconds, order_index) VALUES
    ('f0000000-0000-0000-0000-000000000401', 'e0000000-0000-0000-0000-000000000401', 'Arrays & Broadcasting',      'VIDEO', 'https://www.youtube.com/embed/QUT1VHiLmmI', 780, 1),
    ('f0000000-0000-0000-0000-000000000402', 'e0000000-0000-0000-0000-000000000402', 'DataFrames 101',             'VIDEO', 'https://www.youtube.com/embed/vmEHCJofslg', 900, 1),
    ('f0000000-0000-0000-0000-000000000403', 'e0000000-0000-0000-0000-000000000402', 'GroupBy & Aggregation',      'ARTICLE', NULL, 540, 2);

-- Các khoá còn lại (05-08) mỗi khoá 1 section giới thiệu để không rỗng
INSERT INTO sections (id, course_id, title, order_index) VALUES
    ('e0000000-0000-0000-0000-000000000501', 'd0000000-0000-0000-0000-000000000005', 'Getting Started', 1),
    ('e0000000-0000-0000-0000-000000000601', 'd0000000-0000-0000-0000-000000000006', 'Getting Started', 1),
    ('e0000000-0000-0000-0000-000000000701', 'd0000000-0000-0000-0000-000000000007', 'Getting Started', 1),
    ('e0000000-0000-0000-0000-000000000801', 'd0000000-0000-0000-0000-000000000008', 'Getting Started', 1);
INSERT INTO lessons (id, section_id, title, type, content_url, duration_seconds, order_index) VALUES
    ('f0000000-0000-0000-0000-000000000501', 'e0000000-0000-0000-0000-000000000501', 'Course Overview',            'VIDEO', 'https://www.youtube.com/embed/tPYj3fFJGjk', 420, 1),
    ('f0000000-0000-0000-0000-000000000601', 'e0000000-0000-0000-0000-000000000601', 'Course Overview',            'VIDEO', 'https://www.youtube.com/embed/3c-iBn73dDE', 420, 1),
    ('f0000000-0000-0000-0000-000000000701', 'e0000000-0000-0000-0000-000000000701', 'Course Overview',            'VIDEO', 'https://www.youtube.com/embed/comQ1-x2a1Q', 420, 1),
    ('f0000000-0000-0000-0000-000000000801', 'e0000000-0000-0000-0000-000000000801', 'Course Overview',            'VIDEO', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 420, 1);

-- =========================================================================
-- 5. ENROLLMENTS (học viên ghi danh vào khoá học)
--    completed_lessons_count + is_completed để dashboard trông có tiến độ
-- =========================================================================
INSERT INTO enrollments (id, user_id, course_id, enrolled_at, completed_lessons_count, is_completed) VALUES
    -- John Student (từ V2) học nhiều khoá
    ('10000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'd0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '30 days', 5, true),
    ('10000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'd0000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '20 days', 2, false),
    ('10000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'd0000000-0000-0000-0000-000000000004', CURRENT_TIMESTAMP - INTERVAL '12 days', 1, false),
    -- Emma
    ('10000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '25 days', 3, false),
    ('10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '18 days', 3, true),
    -- Liam
    ('10000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005', CURRENT_TIMESTAMP - INTERVAL '15 days', 1, false),
    ('10000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000006', CURRENT_TIMESTAMP - INTERVAL '9 days', 1, true),
    -- Olivia
    ('10000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', CURRENT_TIMESTAMP - INTERVAL '11 days', 3, true),
    ('10000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000008', CURRENT_TIMESTAMP - INTERVAL '7 days', 0, false),
    -- Noah
    ('10000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '6 days', 4, true),
    ('10000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', CURRENT_TIMESTAMP - INTERVAL '4 days', 0, false),
    -- Ava, Ethan, Mia
    ('10000000-0000-0000-0000-00000000000c', 'b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '5 days', 2, false),
    ('10000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000005', CURRENT_TIMESTAMP - INTERVAL '3 days', 0, false),
    ('10000000-0000-0000-0000-00000000000e', 'b0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '2 days', 1, false);

-- =========================================================================
-- 6. LESSON PROGRESS (chi tiết tiến độ cho vài enrollment)
-- =========================================================================
-- John hoàn thành toàn bộ course JS (enrollment ...0001)
INSERT INTO lesson_progress (id, enrollment_id, lesson_id, status, last_position_seconds, completed_at) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000101', 'COMPLETED', 480, CURRENT_TIMESTAMP - INTERVAL '29 days'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000102', 'COMPLETED', 600, CURRENT_TIMESTAMP - INTERVAL '28 days'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000103', 'COMPLETED', 300, CURRENT_TIMESTAMP - INTERVAL '27 days'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000104', 'COMPLETED', 720, CURRENT_TIMESTAMP - INTERVAL '26 days'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000105', 'COMPLETED', 540, CURRENT_TIMESTAMP - INTERVAL '25 days'),
    -- John đang học dở React (enrollment ...0002): 2 xong, 1 đang xem
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000201', 'COMPLETED', 900, CURRENT_TIMESTAMP - INTERVAL '19 days'),
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000202', 'COMPLETED', 600, CURRENT_TIMESTAMP - INTERVAL '18 days'),
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000203', 'IN_PROGRESS', 420, NULL),
    -- Emma đang học dở JS (enrollment ...0004)
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000101', 'COMPLETED', 480, CURRENT_TIMESTAMP - INTERVAL '24 days'),
    ('20000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000102', 'COMPLETED', 600, CURRENT_TIMESTAMP - INTERVAL '23 days'),
    ('20000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000103', 'COMPLETED', 300, CURRENT_TIMESTAMP - INTERVAL '22 days'),
    ('20000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000104', 'IN_PROGRESS', 300, NULL);
