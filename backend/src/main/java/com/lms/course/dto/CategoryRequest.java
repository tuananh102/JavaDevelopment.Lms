package com.lms.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank
    private String name;

    // Optional — derived from the name when blank (see CategoryController).
    private String slug;
}
