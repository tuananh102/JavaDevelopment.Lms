package com.lms.course;

import com.lms.common.exception.ForbiddenException;
import com.lms.common.exception.ResourceNotFoundException;
import com.lms.course.dto.CourseCreateRequest;
import com.lms.course.dto.CourseDetailDto;
import com.lms.course.dto.CourseDto;
import com.lms.course.dto.LessonDto;
import com.lms.course.dto.SectionDto;
import com.lms.enrollment.EnrollmentRepository;
import com.lms.user.User;
import com.lms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public Page<CourseDto> getPublishedCourses(UUID categoryId, String q, Pageable pageable) {
        // Escape LIKE wildcards in the user's keyword so "50%" searches literally,
        // then wrap it into a case-insensitive contains pattern.
        String pattern = (q == null || q.isBlank())
                ? null
                : "%" + q.trim().toLowerCase()
                        .replace("\\", "\\\\")
                        .replace("%", "\\%")
                        .replace("_", "\\_") + "%";
        return courseRepository.findPublishedCourses(categoryId, pattern, pageable)
                .map(this::mapToDto);
    }

    /**
     * Public course detail (by slug). Visibility and lesson-content exposure are gated:
     * <ul>
     *   <li>A DRAFT course is only visible to its owner instructor or an admin — everyone
     *       else gets 404 (we don't reveal that a hidden course exists).</li>
     *   <li>Lesson content (video URL / article text) is only serialized for the owner,
     *       an admin, or an enrolled student. Anonymous/non-enrolled callers get the course
     *       outline with content stripped, so paid material can't be scraped from the API.</li>
     * </ul>
     */
    @Transactional(readOnly = true)
    public CourseDetailDto getCourseBySlug(String slug, UUID currentUserId, boolean isAdmin) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        boolean privileged = isAdmin
                || (currentUserId != null && course.getInstructor().getId().equals(currentUserId));

        if (course.getStatus() != Course.Status.PUBLISHED && !privileged) {
            throw new ResourceNotFoundException("Course not found");
        }

        boolean enrolled = currentUserId != null
                && enrollmentRepository.existsByUserIdAndCourseId(currentUserId, course.getId());
        boolean includeContent = privileged || enrolled;
        return mapToDetailDto(course, includeContent);
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getCoursesByInstructor(UUID instructorId) {
        return courseRepository.findByInstructorId(instructorId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Course detail by id — used by the instructor editor, so it always returns full
     * lesson content but is restricted to the owner instructor or an admin.
     */
    @Transactional(readOnly = true)
    public CourseDetailDto getCourseById(UUID id, UUID currentUserId, boolean isAdmin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        boolean isOwner = currentUserId != null && course.getInstructor().getId().equals(currentUserId);
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You don't have permission to view this course");
        }
        return mapToDetailDto(course, true);
    }

    @Transactional
    public CourseDto updateCourse(UUID id, CourseCreateRequest request, UUID userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Verify instructor owns the course
        if (!course.getInstructor().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to modify this course");
        }

        validateCategory(request.getCategoryId());

        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setPrice(request.getPrice());
        course.setLevel(request.getLevel());
        course.setCategoryId(request.getCategoryId());

        return mapToDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto createCourse(CourseCreateRequest request, UUID instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        validateCategory(request.getCategoryId());

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
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Verify instructor owns the course
        if (!course.getInstructor().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to modify this course");
        }

        course.setStatus(status);
        courseRepository.save(course);
    }

    /** Reject a categoryId that doesn't correspond to an existing category. */
    private void validateCategory(UUID categoryId) {
        if (categoryId != null && !categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found");
        }
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

    private CourseDetailDto mapToDetailDto(Course course, boolean includeContent) {
        CourseDetailDto dto = new CourseDetailDto();
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

        if (course.getSections() != null) {
            dto.setSections(course.getSections().stream().map(section -> {
                SectionDto sectionDto = new SectionDto();
                sectionDto.setId(section.getId());
                sectionDto.setTitle(section.getTitle());
                sectionDto.setOrderIndex(section.getOrderIndex());

                if (section.getLessons() != null) {
                    sectionDto.setLessons(section.getLessons().stream().map(lesson -> {
                        LessonDto lessonDto = new LessonDto();
                        lessonDto.setId(lesson.getId());
                        lessonDto.setTitle(lesson.getTitle());
                        lessonDto.setType(lesson.getType());
                        // Only expose the actual content to privileged/enrolled callers;
                        // otherwise return the outline (title/type/duration) with content
                        // withheld so paid material isn't scrapeable without enrolling.
                        if (includeContent) {
                            lessonDto.setContentUrl(lesson.getContentUrl());
                            lessonDto.setContentText(lesson.getContentText());
                        }
                        lessonDto.setDurationSeconds(lesson.getDurationSeconds());
                        lessonDto.setOrderIndex(lesson.getOrderIndex());
                        return lessonDto;
                    }).collect(Collectors.toList()));
                }
                return sectionDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
