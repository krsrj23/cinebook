package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Response for GET /api/shows/{id}/seats. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatMapResponse {
    private int holdSeconds;
    private List<SeatMapSeatResponse> seats;
}
