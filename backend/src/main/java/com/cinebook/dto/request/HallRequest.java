package com.cinebook.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HallRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "rows is required")
    @Min(value = 1, message = "rows must be at least 1")
    private Integer rows;

    @NotNull(message = "seatsPerRow is required")
    @Min(value = 1, message = "seatsPerRow must be at least 1")
    private Integer seatsPerRow;

    @NotNull(message = "premiumRows is required")
    @Min(value = 0, message = "premiumRows cannot be negative")
    private Integer premiumRows;
}
