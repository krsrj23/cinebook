package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Response item for GET /api/movies/{id}/shows. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowListItemResponse {
    private Long id;
    private LocalDateTime showDateTime;
    private BigDecimal basePrice;
    private String venueName;
    private String city;
    private String hallName;
    private long availableSeats;
    private long totalSeats;
}
