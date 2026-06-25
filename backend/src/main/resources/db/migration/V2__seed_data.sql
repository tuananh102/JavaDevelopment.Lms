-- Seed Data for LMS System
-- Password for all users is: password (Bcrypt hash)

INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@lms.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'System Admin', 'ADMIN', true),
    ('22222222-2222-2222-2222-222222222222', 'instructor@lms.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Alex Instructor', 'INSTRUCTOR', true),
    ('33333333-3333-3333-3333-333333333333', 'student@lms.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'John Student', 'STUDENT', true);

INSERT INTO categories (id, name, slug)
VALUES 
    ('44444444-4444-4444-4444-444444444444', 'Web Development', 'web-development'),
    ('55555555-5555-5555-5555-555555555555', 'Backend', 'backend');

INSERT INTO courses (id, title, slug, description, thumbnail_url, price, level, status, category_id, instructor_id)
VALUES 
    ('66666666-6666-6666-6666-666666666666', 'Full-Stack Development with Spring Boot 4 & React 19', 'spring-boot-react-fullstack', 'Learn how to build production-ready full-stack applications using the latest tech stack. We cover Java 25, Spring Boot 4, React 19, Tailwind CSS v4, and PostgreSQL.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop', 49.99, 'INTERMEDIATE', 'PUBLISHED', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222');

INSERT INTO sections (id, course_id, title, order_index)
VALUES 
    ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 'Getting Started', 1),
    ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'Backend: Spring Boot Basics', 2);

INSERT INTO lessons (id, section_id, title, type, duration_seconds, order_index)
VALUES 
    ('99999999-9999-9999-9999-999999999991', '77777777-7777-7777-7777-777777777777', 'Course Introduction', 'VIDEO', 300, 1),
    ('99999999-9999-9999-9999-999999999992', '77777777-7777-7777-7777-777777777777', 'Setting up the Environment', 'ARTICLE', 720, 2),
    ('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888888', 'Creating the Spring Boot project', 'VIDEO', 900, 1);
