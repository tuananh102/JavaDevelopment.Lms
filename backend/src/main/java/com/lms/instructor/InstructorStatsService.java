package com.lms.instructor;

import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.enrollment.Enrollment;
import com.lms.enrollment.EnrollmentRepository;
import com.lms.instructor.dto.InstructorStatsDto;
import com.lms.payment.Payment;
import com.lms.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorStatsService {

    private static final int MONTHS = 6;

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Aggregates the instructor's analytics in Java rather than SQL: the data set is
     * bounded by one instructor's courses/enrollments/payments, and it keeps the
     * queries simple derived finders instead of DB-specific date_trunc grouping.
     */
    @Transactional(readOnly = true)
    public InstructorStatsDto getStats(UUID instructorId) {
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseInstructorId(instructorId);
        List<Payment> paidPayments =
                paymentRepository.findByCourseInstructorIdAndStatus(instructorId, Payment.Status.PAID);

        Map<UUID, Long> studentsByCourse = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourse().getId(), Collectors.counting()));
        Map<UUID, BigDecimal> revenueByCourse = paidPayments.stream()
                .collect(Collectors.groupingBy(p -> p.getCourse().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)));

        List<InstructorStatsDto.CourseStats> courseStats = courses.stream().map(course -> {
            InstructorStatsDto.CourseStats stats = new InstructorStatsDto.CourseStats();
            stats.setId(course.getId());
            stats.setTitle(course.getTitle());
            stats.setStatus(course.getStatus());
            stats.setStudents(studentsByCourse.getOrDefault(course.getId(), 0L));
            stats.setRevenue(revenueByCourse.getOrDefault(course.getId(), BigDecimal.ZERO));
            return stats;
        }).collect(Collectors.toList());

        InstructorStatsDto dto = new InstructorStatsDto();
        dto.setTotalCourses(courses.size());
        dto.setPublishedCourses(courses.stream()
                .filter(c -> c.getStatus() == Course.Status.PUBLISHED).count());
        dto.setTotalStudents(enrollments.size());
        dto.setTotalRevenue(paidPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        dto.setCourses(courseStats);
        dto.setMonthly(buildMonthlySeries(enrollments, paidPayments));
        return dto;
    }

    /** Last {@value MONTHS} calendar months (oldest first), including empty months. */
    private List<InstructorStatsDto.MonthlyPoint> buildMonthlySeries(
            List<Enrollment> enrollments, List<Payment> paidPayments) {

        Map<YearMonth, Long> enrollmentsByMonth = enrollments.stream()
                .filter(e -> e.getEnrolledAt() != null)
                .collect(Collectors.groupingBy(e -> toMonth(e.getEnrolledAt()), Collectors.counting()));
        Map<YearMonth, BigDecimal> revenueByMonth = paidPayments.stream()
                .filter(p -> p.getPaidAt() != null)
                .collect(Collectors.groupingBy(p -> toMonth(p.getPaidAt()),
                        Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)));

        YearMonth current = YearMonth.now(ZoneOffset.UTC);
        List<InstructorStatsDto.MonthlyPoint> series = new ArrayList<>(MONTHS);
        for (int i = MONTHS - 1; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            InstructorStatsDto.MonthlyPoint point = new InstructorStatsDto.MonthlyPoint();
            point.setMonth(month.toString());
            point.setEnrollments(enrollmentsByMonth.getOrDefault(month, 0L));
            point.setRevenue(revenueByMonth.getOrDefault(month, BigDecimal.ZERO));
            series.add(point);
        }
        return series;
    }

    private static YearMonth toMonth(OffsetDateTime timestamp) {
        return YearMonth.from(timestamp.atZoneSameInstant(ZoneOffset.UTC));
    }
}
