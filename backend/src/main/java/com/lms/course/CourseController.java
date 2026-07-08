package com.lms.course;

import com.lms.course.dto.CourseCreateRequest;
import com.lms.course.dto.CourseDetailDto;
import com.lms.course.dto.CourseDto;
import com.lms.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<Page<CourseDto>> getPublishedCourses(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Sort.Direction direction = sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        
        return ResponseEntity.ok(courseService.getPublishedCourses(categoryId, pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CourseDetailDto> getCourseBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseDto> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        CourseDto courseDto = courseService.createCourse(request, userDetails.getId());
        return ResponseEntity.ok(courseDto);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateCourseStatus(
            @PathVariable UUID id,
            @RequestParam Course.Status status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        courseService.updateCourseStatus(id, status, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
