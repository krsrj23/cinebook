package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** Response item for GET /api/admin/bookings - same shape as BookingResponse plus customer info. */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminBookingResponse extends BookingResponse {
    private String customerName;
    private String customerEmail;
}
