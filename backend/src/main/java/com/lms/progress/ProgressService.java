package com.lms.progress;

import com.lms.common.exception.ForbiddenException;
import com.lms.common.exception.ResourceNotFoundException;
import com.lms.course.Lesson;
import com.lms.course.LessonRepository;
import com.lms.enrollment.Enrollment;
import com.lms.enrollment.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final LessonProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;

    @Transactional
    public void markLessonComplete(UUID userId, UUID courseId, UUID lessonId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ForbiddenException("User is not enrolled in this course"));

        Lesson lesson = loadLessonInCourse(lessonId, courseId);

        LessonProgress progress = progressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lessonId)
                .orElseGet(() -> LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .status(LessonProgress.Status.NOT_STARTED)
                        .lastPositionSeconds(0)
                        .build());

        if (progress.getStatus() != LessonProgress.Status.COMPLETED) {
            progress.setStatus(LessonProgress.Status.COMPLETED);
            progress.setCompletedAt(OffsetDateTime.now());
            progressRepository.save(progress);

            // Update enrollment completion count
            int totalLessons = lessonRepository.countBySectionCourseId(courseId);
            long completedLessons = progressRepository.countByEnrollmentIdAndStatus(enrollment.getId(), LessonProgress.Status.COMPLETED);
            
            enrollment.setCompletedLessonsCount((int) completedLessons);
            if (completedLessons == totalLessons && totalLessons > 0) {
                enrollment.setCompleted(true);
            }
            enrollmentRepository.save(enrollment);
        }
    }

    @Transactional
    public void updateVideoProgress(UUID userId, UUID courseId, UUID lessonId, int lastPositionSeconds) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ForbiddenException("User is not enrolled in this course"));

        Lesson lesson = loadLessonInCourse(lessonId, courseId);

        LessonProgress progress = progressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lessonId)
                .orElseGet(() -> LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .status(LessonProgress.Status.IN_PROGRESS)
                        .build());

        if (progress.getStatus() != LessonProgress.Status.COMPLETED) {
            progress.setStatus(LessonProgress.Status.IN_PROGRESS);
        }
        progress.setLastPositionSeconds(lastPositionSeconds);
        progressRepository.save(progress);
    }
    
    @Transactional(readOnly = true)
    public List<UUID> getCompletedLessonIds(UUID userId, UUID courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ForbiddenException("User is not enrolled in this course"));

        return progressRepository.findByEnrollmentIdAndStatus(enrollment.getId(), LessonProgress.Status.COMPLETED)
                .stream()
                .map(p -> p.getLesson().getId())
                .collect(Collectors.toList());
    }

    /**
     * Loads a lesson and verifies it actually belongs to {@code courseId}. Without
     * this check a user enrolled in course A could record progress against a lesson
     * from course B, corrupting A's completion counts (completedLessonsCount could
     * exceed the real total and flip is_completed incorrectly).
     */
    private Lesson loadLessonInCourse(UUID lessonId, UUID courseId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        UUID lessonCourseId = lesson.getSection().getCourse().getId();
        if (!lessonCourseId.equals(courseId)) {
            throw new ResourceNotFoundException("Lesson not found in this course");
        }
        return lesson;
    }
}
