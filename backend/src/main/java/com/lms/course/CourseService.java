package com.lms.course;

import com.lms.course.dto.CourseCreateRequest;
import com.lms.course.dto.CourseDto;
import com.lms.user.User;
import com.lms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<CourseDto> getPublishedCourses(UUID categoryId, Pageable pageable) {
        return courseRepository.findPublishedCourses(categoryId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return mapToDto(course);
    }

    @Transactional
    public CourseDto createCourse(CourseCreateRequest request, UUID instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .price(request.getPrice())
                .level(request.getLevel())
                .status(Course.Status.DRAFT)
                .categoryId(request.getCategoryId())
                .instructor(instructor)
                .build();

        Course savedCourse = courseRepository.save(course);
        return mapToDto(savedCourse);
    }

    @Transactional
    public void updateCourseStatus(UUID id, Course.Status status, UUID userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Verify instructor owns the course
        if (!course.getInstructor().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to modify this course");
        }

        course.setStatus(status);
        courseRepository.save(course);
    }

    private CourseDto mapToDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setSlug(course.getSlug());
        dto.setDescription(course.getDescription());
        dto.setThumbnailUrl(course.getThumbnailUrl());
        dto.setPrice(course.getPrice());
        dto.setLevel(course.getLevel());
        dto.setStatus(course.getStatus());
        dto.setCategoryId(course.getCategoryId());
        dto.setInstructorId(course.getInstructor().getId());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        return dto;
    }
}
