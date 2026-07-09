package com.lms.course;

import com.lms.common.exception.ConflictException;
import com.lms.common.exception.ForbiddenException;
import com.lms.common.exception.ResourceNotFoundException;
import com.lms.course.dto.LessonCreateRequest;
import com.lms.course.dto.SectionCreateRequest;
import com.lms.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        verifyOwnership(course, userDetails);

        Section section = Section.builder()
                .course(course)
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();

        sectionRepository.save(section);
        // Trả body gọn (chỉ id) — KHÔNG trả entity vì Course<->Section là quan hệ
        // hai chiều sẽ gây đệ quy vô hạn khi Jackson serialize.
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", section.getId()));
    }

    @PutMapping("/sections/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateSection(
            @PathVariable UUID sectionId,
            @Valid @RequestBody SectionCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        verifyOwnership(section.getCourse(), userDetails);

        section.setTitle(request.getTitle());
        if (request.getOrderIndex() != null) {
            section.setOrderIndex(request.getOrderIndex());
        }
        sectionRepository.save(section);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sections/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteSection(
            @PathVariable UUID sectionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        verifyOwnership(section.getCourse(), userDetails);

        try {
            // Xoá section sẽ cascade xuống các lesson (orphanRemoval).
            sectionRepository.delete(section);
            sectionRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "Cannot delete this section because one of its lessons already has student progress.");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/{sectionId}/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createLesson(
            @PathVariable UUID sectionId,
            @Valid @RequestBody LessonCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        verifyOwnership(section.getCourse(), userDetails);

        Lesson lesson = Lesson.builder()
                .section(section)
                .title(request.getTitle())
                .type(request.getType())
                .contentUrl(request.getContentUrl())
                .contentText(request.getContentText())
                .durationSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 0)
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();

        lessonRepository.save(lesson);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", lesson.getId()));
    }

    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateLesson(
            @PathVariable UUID lessonId,
            @Valid @RequestBody LessonCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        verifyOwnership(lesson.getSection().getCourse(), userDetails);

        lesson.setTitle(request.getTitle());
        lesson.setType(request.getType());
        lesson.setContentUrl(request.getContentUrl());
        lesson.setContentText(request.getContentText());
        if (request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getOrderIndex() != null) {
            lesson.setOrderIndex(request.getOrderIndex());
        }
        lessonRepository.save(lesson);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteLesson(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        verifyOwnership(lesson.getSection().getCourse(), userDetails);

        try {
            lessonRepository.delete(lesson);
            lessonRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "Cannot delete this lesson because a student already has progress on it.");
        }
        return ResponseEntity.noContent().build();
    }

    // Ownership check ở tầng service/controller: instructor chỉ thao tác trên khoá
    // do chính mình sở hữu (theo pattern trong CourseService).
    private void verifyOwnership(Course course, UserDetailsImpl userDetails) {
        if (course == null || !course.getInstructor().getId().equals(userDetails.getId())) {
            throw new ForbiddenException("You don't have permission to modify this course");
        }
    }
}
