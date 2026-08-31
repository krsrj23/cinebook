package com.cinebook.service;

import com.cinebook.dto.response.MovieResponse;
import com.cinebook.entity.Movie;
import com.cinebook.exception.ResourceNotFoundException;
import com.cinebook.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieService {

    private final MovieRepository movieRepository;

    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public MovieResponse getMovieById(Long id) {
        return toResponse(findMovieOrThrow(id));
    }

    public Movie findMovieOrThrow(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
    }

    public MovieResponse toResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .genre(movie.getGenre())
                .language(movie.getLanguage())
                .durationMinutes(movie.getDurationMinutes())
                .posterUrl(movie.getPosterUrl())
                .releaseDate(movie.getReleaseDate())
                .build();
    }
}
