package com.cinebook.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShowRequest {

    @NotNull(message = "movieId is required")
    private Long movieId;

    @NotNull(message = "hallId is required")
    private Long hallId;

    @NotNull(message = "showDateTime is required")
    private LocalDateTime showDateTime;

    @NotNull(message = "basePrice is required")
    @Positive(message = "basePrice must be positive")
    private BigDecimal basePrice;
}
