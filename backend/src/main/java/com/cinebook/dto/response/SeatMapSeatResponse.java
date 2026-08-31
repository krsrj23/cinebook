package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatMapSeatResponse {
    private Long showSeatId;
    private Long seatId;
    private String seatRow;
    private String seatNumber;
    private String seatType;
    private BigDecimal price;
    private String status;
}
