package com.lms.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    Optional<Enrollment> findByUserIdAndCourseId(UUID userId, UUID courseId);
    List<Enrollment> findByUserIdOrderByEnrolledAtDesc(UUID userId);
    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    // Mọi enrollment vào các khoá của một instructor — cho trang analytics.
    List<Enrollment> findByCourseInstructorId(UUID instructorId);
}
