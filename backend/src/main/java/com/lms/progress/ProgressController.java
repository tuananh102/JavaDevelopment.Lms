package com.lms.progress;

import com.lms.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<?> markLessonComplete(
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        progressService.markLessonComplete(userDetails.getId(), courseId, lessonId);
        return ResponseEntity.ok(Map.of("message", "Lesson marked as complete"));
    }

    @PutMapping("/courses/{courseId}/lessons/{lessonId}/position")
    public ResponseEntity<?> updateVideoPosition(
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Integer position = body.getOrDefault("lastPositionSeconds", 0);
        progressService.updateVideoProgress(userDetails.getId(), courseId, lessonId, position);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/courses/{courseId}/completed")
    public ResponseEntity<List<UUID>> getCompletedLessons(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
            
        List<UUID> completedIds = progressService.getCompletedLessonIds(userDetails.getId(), courseId);
        return ResponseEntity.ok(completedIds);
    }
}
