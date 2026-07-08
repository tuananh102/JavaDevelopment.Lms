package com.lms.enrollment;

import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.course.dto.CourseDto;
import com.lms.enrollment.dto.EnrollmentDto;
import com.lms.user.User;
import com.lms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public EnrollmentDto enrollInCourse(UUID userId, UUID courseId) {
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new IllegalArgumentException("User is already enrolled in this course");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new IllegalArgumentException("Cannot enroll in an unpublished course");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .completedLessonsCount(0)
                .isCompleted(false)
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getUserEnrollments(UUID userId) {
        return enrollmentRepository.findByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public boolean checkEnrollment(UUID userId, UUID courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    private EnrollmentDto mapToDto(Enrollment enrollment) {
        EnrollmentDto dto = new EnrollmentDto();
        dto.setId(enrollment.getId());
        dto.setEnrolledAt(enrollment.getEnrolledAt());
        dto.setCompletedLessonsCount(enrollment.getCompletedLessonsCount());
        dto.setCompleted(enrollment.isCompleted());

        Course course = enrollment.getCourse();
        CourseDto courseDto = new CourseDto();
        courseDto.setId(course.getId());
        courseDto.setTitle(course.getTitle());
        courseDto.setSlug(course.getSlug());
        courseDto.setDescription(course.getDescription());
        courseDto.setThumbnailUrl(course.getThumbnailUrl());
        courseDto.setPrice(course.getPrice());
        courseDto.setLevel(course.getLevel());
        courseDto.setStatus(course.getStatus());
        courseDto.setCategoryId(course.getCategoryId());
        courseDto.setInstructorId(course.getInstructor().getId());
        courseDto.setCreatedAt(course.getCreatedAt());
        courseDto.setUpdatedAt(course.getUpdatedAt());

        dto.setCourse(courseDto);
        return dto;
    }
}
