package com.lms.course.dto;

import com.lms.course.Course;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class CourseDto {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private Course.Level level;
    private Course.Status status;
    private UUID categoryId;
    private UUID instructorId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
