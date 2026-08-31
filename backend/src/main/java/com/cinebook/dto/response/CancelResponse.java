package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Response for POST /api/bookings/{id}/cancel. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelResponse {
    private Long bookingId;
    private String status;
}
