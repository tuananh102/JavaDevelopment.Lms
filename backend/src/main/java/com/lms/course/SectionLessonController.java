package com.lms.course;

import com.lms.course.dto.LessonCreateRequest;
import com.lms.course.dto.SectionCreateRequest;
import com.lms.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class SectionLessonController {

    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    @PostMapping("/{courseId}/sections")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createSection(
            @PathVariable UUID courseId,
            @Valid @RequestBody SectionCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
                
        // Validation ownership omitted for brevity
        
        Section section = Section.builder()
                .course(course)
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();
                
        sectionRepository.save(section);
        return ResponseEntity.ok(section);
    }

    @PostMapping("/sections/{sectionId}/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createLesson(
            @PathVariable UUID sectionId,
            @Valid @RequestBody LessonCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));
                
        Lesson lesson = Lesson.builder()
                .section(section)
                .title(request.getTitle())
                .type(request.getType())
                .contentUrl(request.getContentUrl())
                .contentText(request.getContentText())
                .durationSeconds(request.getDurationSeconds())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();
                
        lessonRepository.save(lesson);
        return ResponseEntity.ok(lesson);
    }
}
