package com.lms.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SectionCreateRequest {
    @NotBlank
    private String title;
    private Integer orderIndex;
}
