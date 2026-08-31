package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieResponse {
    private Long id;
    private String title;
    private String description;
    private String genre;
    private String language;
    private int durationMinutes;
    private String posterUrl;
    private LocalDate releaseDate;
}
