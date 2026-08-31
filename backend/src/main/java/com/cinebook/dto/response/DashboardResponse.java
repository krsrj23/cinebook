package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Response for GET /api/admin/dashboard. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalMovies;
    private long totalShows;
    private long totalBookings;
    private BigDecimal totalRevenue;
}
