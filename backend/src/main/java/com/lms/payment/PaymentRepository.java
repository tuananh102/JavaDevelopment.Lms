package com.lms.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByUserIdAndCourseIdAndStatus(UUID userId, UUID courseId, Payment.Status status);
    List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Mọi payment cho các khoá của một instructor (lọc PAID để tính doanh thu).
    List<Payment> findByCourseInstructorIdAndStatus(UUID instructorId, Payment.Status status);
}
