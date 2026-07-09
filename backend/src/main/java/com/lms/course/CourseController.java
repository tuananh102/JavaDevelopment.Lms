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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // Whitelist of properties a client may sort by — prevents a bad ?sort= value from
    // reaching Spring Data as an invalid property (PropertyReferenceException -> 500).
    private static final java.util.Set<String> SORTABLE =
            java.util.Set.of("createdAt", "updatedAt", "title", "price");
    private static final int MAX_PAGE_SIZE = 100;

    @GetMapping
    public ResponseEntity<Page<CourseDto>> getPublishedCourses(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        // sort may arrive as ["createdAt","desc"] or a single ["title"] (no direction),
        // or an empty/garbage value — parse defensively instead of assuming sort[1] exists.
        String property = (sort.length > 0 && SORTABLE.contains(sort[0])) ? sort[0] : "createdAt";
        Sort.Direction direction = (sort.length > 1 && sort[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, property));

        return ResponseEntity.ok(courseService.getPublishedCourses(categoryId, pageable));
    }

    // Khoá của instructor đang đăng nhập (mọi trạng thái). Đặt TRƯỚC /{slug} nhưng
    // Spring vẫn ưu tiên path literal "instructor" hơn biến {slug} nên không xung đột.
    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<CourseDto>> getMyCourses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(userDetails.getId()));
    }

    // Lấy chi tiết theo id (cho trang editor của instructor). Chỉ chủ sở hữu/admin.
    @GetMapping("/by-id/{id}")
    public ResponseEntity<CourseDetailDto> getCourseById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(courseService.getCourseById(id, currentUserId(userDetails), isAdmin(userDetails)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CourseDetailDto> getCourseBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug, currentUserId(userDetails), isAdmin(userDetails)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseDto> updateCourse(
            @PathVariable UUID id,
            @Valid @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(courseService.updateCourse(id, request, userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseDto> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        CourseDto courseDto = courseService.createCourse(request, userDetails.getId());
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(courseDto);
    }

    private static UUID currentUserId(UserDetailsImpl userDetails) {
        return userDetails != null ? userDetails.getId() : null;
    }

    private static boolean isAdmin(UserDetailsImpl userDetails) {
        return userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
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
