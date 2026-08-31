package com.cinebook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MovieRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String genre;

    private String language;

    @NotNull(message = "durationMinutes is required")
    @Positive(message = "durationMinutes must be positive")
    private Integer durationMinutes;

    private String posterUrl;

    @NotNull(message = "releaseDate is required")
    private LocalDate releaseDate;
}
