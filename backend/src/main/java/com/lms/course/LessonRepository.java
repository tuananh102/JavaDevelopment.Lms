package com.lms.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findBySectionIdOrderByOrderIndexAsc(UUID sectionId);
    int countBySectionCourseId(UUID courseId); // To get total lessons for a course
}
