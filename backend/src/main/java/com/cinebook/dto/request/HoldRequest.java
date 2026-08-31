package com.cinebook.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class HoldRequest {

    @NotNull(message = "showId is required")
    private Long showId;

    @NotEmpty(message = "showSeatIds must contain at least one seat")
    private List<Long> showSeatIds;
}
