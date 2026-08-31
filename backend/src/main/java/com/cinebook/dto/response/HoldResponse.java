package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Response for POST /api/bookings/hold. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldResponse {
    private Long bookingId;
    private LocalDateTime expiresAt;
    private BigDecimal totalAmount;
    private List<HoldSeatResponse> seats;
}
