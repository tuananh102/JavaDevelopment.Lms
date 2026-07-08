package com.lms.course.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class CourseDetailDto extends CourseDto {
    private List<SectionDto> sections;
}
