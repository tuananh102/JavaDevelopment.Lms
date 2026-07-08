package com.lms.enrollment.dto;

import com.lms.course.dto.CourseDto;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class EnrollmentDto {
    private UUID id;
    private CourseDto course;
    private OffsetDateTime enrolledAt;
    private Integer completedLessonsCount;
    private boolean isCompleted;
}
