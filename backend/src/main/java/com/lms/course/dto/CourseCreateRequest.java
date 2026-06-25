package com.lms.course.dto;

import com.lms.course.Course;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CourseCreateRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String slug;
    
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    
    @NotNull
    private Course.Level level;
    
    private UUID categoryId;
}
