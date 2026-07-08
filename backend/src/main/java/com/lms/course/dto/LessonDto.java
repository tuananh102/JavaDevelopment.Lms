package com.lms.course.dto;

import com.lms.course.Lesson;
import lombok.Data;

import java.util.UUID;

@Data
public class LessonDto {
    private UUID id;
    private String title;
    private Lesson.Type type;
    private String contentUrl;
    private String contentText;
    private Integer durationSeconds;
    private Integer orderIndex;
}
