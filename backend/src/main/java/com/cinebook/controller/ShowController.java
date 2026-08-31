package com.cinebook.controller;

import com.cinebook.dto.response.SeatMapResponse;
import com.cinebook.dto.response.ShowDetailResponse;
import com.cinebook.service.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public read-only show endpoints. */
@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    @GetMapping("/{id}")
    public ShowDetailResponse getShow(@PathVariable Long id) {
        return showService.getShowDetail(id);
    }

    @GetMapping("/{id}/seats")
    public SeatMapResponse getSeatMap(@PathVariable Long id) {
        return showService.getSeatMap(id);
    }
}
