package com.lms.payment;

import com.lms.payment.dto.PaymentDto;
import com.lms.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Create (or reuse) a pending order for a paid course. */
    @PostMapping("/courses/{courseId}")
    public ResponseEntity<PaymentDto> createOrder(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        PaymentDto order = paymentService.createOrder(userDetails.getId(), courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<PaymentDto> getOrder(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.getOrder(userDetails.getId(), orderId));
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> myOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.getMyOrders(userDetails.getId()));
    }

    /** Simulate paying for the order — marks it PAID and enrolls the user. */
    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<PaymentDto> confirm(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.confirmPayment(userDetails.getId(), orderId));
    }
}
