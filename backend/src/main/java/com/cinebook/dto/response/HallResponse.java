package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallResponse {
    private Long id;
    private String name;
    private int rows;
    private int seatsPerRow;
    private int premiumRows;
    private Long venueId;
    private String venueName;
}
