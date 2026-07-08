package com.lms.enrollment;

import com.lms.enrollment.dto.EnrollmentDto;
import com.lms.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<EnrollmentDto> enroll(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        EnrollmentDto enrollment = enrollmentService.enrollInCourse(userDetails.getId(), courseId);
        return ResponseEntity.ok(enrollment);
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentDto>> getMyEnrollments(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        List<EnrollmentDto> enrollments = enrollmentService.getUserEnrollments(userDetails.getId());
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/courses/{courseId}/check")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        boolean isEnrolled = enrollmentService.checkEnrollment(userDetails.getId(), courseId);
        return ResponseEntity.ok(Map.of("enrolled", isEnrolled));
    }
}
