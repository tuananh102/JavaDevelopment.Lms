package com.lms.payment;

import com.lms.common.exception.ConflictException;
import com.lms.common.exception.ForbiddenException;
import com.lms.common.exception.ResourceNotFoundException;
import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.enrollment.EnrollmentRepository;
import com.lms.enrollment.EnrollmentService;
import com.lms.payment.dto.PaymentDto;
import com.lms.user.User;
import com.lms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;

    /**
     * Create (or reuse) a PENDING order for a paid course. Rejects free courses (enroll
     * directly), unpublished courses, and courses the user is already enrolled in.
     */
    @Transactional
    public PaymentDto createOrder(UUID userId, UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new ConflictException("Cannot purchase an unpublished course");
        }
        if (!EnrollmentService.isPaid(course)) {
            throw new ConflictException("This course is free — enroll directly, no payment needed");
        }
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new ConflictException("You are already enrolled in this course");
        }

        // Reuse an existing unpaid order so repeated visits to checkout don't pile up orders.
        Payment order = paymentRepository
                .findByUserIdAndCourseIdAndStatus(userId, courseId, Payment.Status.PENDING)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return paymentRepository.save(Payment.builder()
                            .user(user)
                            .course(course)
                            .amount(course.getPrice())
                            .status(Payment.Status.PENDING)
                            .build());
                });
        return PaymentDto.from(order);
    }

    @Transactional(readOnly = true)
    public PaymentDto getOrder(UUID userId, UUID orderId) {
        return PaymentDto.from(loadOwnedOrder(userId, orderId));
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getMyOrders(UUID userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(PaymentDto::from).collect(Collectors.toList());
    }

    /**
     * Simulate a successful payment: mark the order PAID and enroll the user. There is no
     * real gateway — this is the mock "Pay" action. Idempotent-ish: a non-PENDING order
     * is rejected so a paid order isn't charged twice.
     */
    @Transactional
    public PaymentDto confirmPayment(UUID userId, UUID orderId) {
        Payment order = loadOwnedOrder(userId, orderId);
        if (order.getStatus() != Payment.Status.PENDING) {
            throw new ConflictException("This order can no longer be paid");
        }

        order.setStatus(Payment.Status.PAID);
        order.setPaidAt(OffsetDateTime.now());
        paymentRepository.save(order);

        enrollmentService.enrollAfterPayment(userId, order.getCourse().getId());
        return PaymentDto.from(order);
    }

    private Payment loadOwnedOrder(UUID userId, UUID orderId) {
        Payment order = paymentRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have access to this order");
        }
        return order;
    }
}
