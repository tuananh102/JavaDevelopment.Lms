package com.lms.course.dto;

import com.lms.course.Lesson;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonCreateRequest {
    @NotBlank
    private String title;

    @NotNull
    private Lesson.Type type;

    private String contentUrl;
    private String contentText;
    private Integer durationSeconds;
    private Integer orderIndex;
}
