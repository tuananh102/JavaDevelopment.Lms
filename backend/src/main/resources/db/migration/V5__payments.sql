-- V5: Bảng payments cho luồng thanh toán mô phỏng của khoá học trả phí.
-- Một order PENDING được tạo khi user bấm mua; confirm sẽ chuyển PAID và tạo enrollment.
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_user_course_status ON payments(user_id, course_id, status);
