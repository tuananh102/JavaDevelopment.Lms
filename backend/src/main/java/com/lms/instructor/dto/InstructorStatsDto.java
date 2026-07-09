package com.lms.instructor.dto;

import com.lms.course.Course;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class InstructorStatsDto {
    private long totalCourses;
    private long publishedCourses;
    private long totalStudents;
    private BigDecimal totalRevenue;
    private List<CourseStats> courses;
    private List<MonthlyPoint> monthly;

    /** Per-course breakdown for the instructor's course table. */
    @Data
    public static class CourseStats {
        private UUID id;
        private String title;
        private Course.Status status;
        private long students;
        private BigDecimal revenue;
    }

    /** One point of the last-6-months series. `month` is "yyyy-MM". */
    @Data
    public static class MonthlyPoint {
        private String month;
        private long enrollments;
        private BigDecimal revenue;
    }
}
