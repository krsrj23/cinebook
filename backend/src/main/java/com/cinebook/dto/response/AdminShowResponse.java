package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Response item for the admin show CRUD endpoints (GET/POST/PUT /api/admin/shows). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminShowResponse {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private Long hallId;
    private String hallName;
    private String venueName;
    private LocalDateTime showDateTime;
    private BigDecimal basePrice;
}
