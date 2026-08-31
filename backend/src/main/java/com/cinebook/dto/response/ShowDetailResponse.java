package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Response for GET /api/shows/{id}. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowDetailResponse {
    private Long id;
    private String movieTitle;
    private String venueName;
    private String city;
    private String hallName;
    private LocalDateTime showDateTime;
    private BigDecimal basePrice;
}
