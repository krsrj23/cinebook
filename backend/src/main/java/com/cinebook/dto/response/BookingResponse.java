package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response for GET /api/bookings/my and GET /api/bookings/{id}.
 * AdminBookingResponse extends this with customerName/customerEmail for
 * GET /api/admin/bookings. Uses @SuperBuilder (instead of @Builder) so the
 * subclass builder can also set these inherited fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookingResponse {
    private Long id;
    private String movieTitle;
    private String posterUrl;
    private String venueName;
    private String hallName;
    private LocalDateTime showDateTime;
    private List<String> seatNumbers;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime bookingTime;
}
