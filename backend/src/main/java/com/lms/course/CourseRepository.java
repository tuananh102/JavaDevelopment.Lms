package com.lms.course;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    Optional<Course> findBySlug(String slug);

    // Khoá của một instructor (mọi trạng thái, kể cả DRAFT) cho trang quản lý.
    @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId ORDER BY c.createdAt DESC")
    List<Course> findByInstructorId(@Param("instructorId") UUID instructorId);

    // :q is a pre-built lowercase LIKE pattern ("%keyword%") or null for no keyword filter —
    // built in the service so the query stays a simple parameter comparison.
    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' " +
            "AND (:categoryId IS NULL OR c.categoryId = :categoryId) " +
            "AND (:q IS NULL OR LOWER(c.title) LIKE :q OR LOWER(c.description) LIKE :q)")
    Page<Course> findPublishedCourses(@Param("categoryId") UUID categoryId,
                                      @Param("q") String q,
                                      Pageable pageable);
}
