package com.lms.course.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SectionDto {
    private UUID id;
    private String title;
    private Integer orderIndex;
    private List<LessonDto> lessons;
}
