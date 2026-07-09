package com.lms.payment.dto;

import com.lms.payment.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class PaymentDto {
    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private String courseSlug;
    private BigDecimal amount;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime paidAt;

    public static PaymentDto from(Payment p) {
        return new PaymentDto(
                p.getId(),
                p.getCourse().getId(),
                p.getCourse().getTitle(),
                p.getCourse().getSlug(),
                p.getAmount(),
                p.getStatus().name(),
                p.getCreatedAt(),
                p.getPaidAt());
    }
}
