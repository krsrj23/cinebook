package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Response for POST /api/bookings/{id}/confirm. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmResponse {
    private Long bookingId;
    private String status;
    private String transactionId;
    private BigDecimal paidAmount;
}
