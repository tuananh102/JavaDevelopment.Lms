package com.lms.instructor;

import com.lms.instructor.dto.InstructorStatsDto;
import com.lms.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorStatsController {

    private final InstructorStatsService instructorStatsService;

    /** Analytics for the logged-in instructor's own courses (dashboard header + charts). */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<InstructorStatsDto> getMyStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(instructorStatsService.getStats(userDetails.getId()));
    }
}
