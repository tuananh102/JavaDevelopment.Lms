package com.lms.enrollment;

import com.lms.common.exception.ConflictException;
import com.lms.common.exception.ResourceNotFoundException;
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

    /**
     * Direct (free) enrollment. Paid courses are rejected here — they must go through
     * the payment flow ({@link com.lms.payment.PaymentService}) so the price can't be
     * bypassed by calling the enroll endpoint directly.
     */
    @Transactional
    public EnrollmentDto enrollInCourse(UUID userId, UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (isPaid(course)) {
            throw new ConflictException(
                    "This course requires payment. Please complete checkout to enroll.");
        }
        return createEnrollment(userId, course);
    }

    /**
     * Trusted enrollment path used by PaymentService after a successful (simulated)
     * payment. Skips the paid-course guard because payment has already been recorded.
     */
    @Transactional
    public EnrollmentDto enrollAfterPayment(UUID userId, UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return createEnrollment(userId, course);
    }

    /** True when the course has a positive price. */
    public static boolean isPaid(Course course) {
        return course.getPrice() != null
                && course.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0;
    }

    private EnrollmentDto createEnrollment(UUID userId, Course course) {
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId())) {
            throw new ConflictException("User is already enrolled in this course");
        }
        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new IllegalArgumentException("Cannot enroll in an unpublished course");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
