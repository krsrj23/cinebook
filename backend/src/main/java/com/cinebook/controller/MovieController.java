package com.cinebook.controller;

import com.cinebook.dto.response.MovieResponse;
import com.cinebook.dto.response.ShowListItemResponse;
import com.cinebook.service.MovieService;
import com.cinebook.service.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public read-only movie endpoints. */
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;
    private final ShowService showService;

    @GetMapping
    public List<MovieResponse> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/{id}")
    public MovieResponse getMovie(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @GetMapping("/{id}/shows")
    public List<ShowListItemResponse> getShowsForMovie(@PathVariable Long id) {
        return showService.getShowsForMovie(id);
    }
}
