package com.cinebook.controller;

import com.cinebook.dto.request.HallRequest;
import com.cinebook.dto.request.MovieRequest;
import com.cinebook.dto.request.ShowRequest;
import com.cinebook.dto.request.VenueRequest;
import com.cinebook.dto.response.AdminBookingResponse;
import com.cinebook.dto.response.AdminShowResponse;
import com.cinebook.dto.response.DashboardResponse;
import com.cinebook.dto.response.HallResponse;
import com.cinebook.dto.response.MovieResponse;
import com.cinebook.dto.response.VenueResponse;
import com.cinebook.service.AdminService;
import com.cinebook.service.BookingService;
import com.cinebook.service.MovieService;
import com.cinebook.service.ShowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** All endpoints here require ROLE_ADMIN - enforced globally in SecurityConfig. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final MovieService movieService;
    private final ShowService showService;
    private final BookingService bookingService;

    // ---------------------------------------------------------------
    // Movies
    // ---------------------------------------------------------------

    @GetMapping("/movies")
    public List<MovieResponse> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/movies/{id}")
    public MovieResponse getMovie(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @PostMapping("/movies")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createMovie(request));
    }

    @PutMapping("/movies/{id}")
    public MovieResponse updateMovie(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return adminService.updateMovie(id, request);
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        adminService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------------------------------------------------------
    // Venues
    // ---------------------------------------------------------------

    @GetMapping("/venues")
    public List<VenueResponse> getAllVenues() {
        return adminService.getAllVenues();
    }

    @GetMapping("/venues/{id}")
    public VenueResponse getVenue(@PathVariable Long id) {
        return adminService.getVenue(id);
    }

    @PostMapping("/venues")
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody VenueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createVenue(request));
    }

    @PutMapping("/venues/{id}")
    public VenueResponse updateVenue(@PathVariable Long id, @Valid @RequestBody VenueRequest request) {
        return adminService.updateVenue(id, request);
    }

    @DeleteMapping("/venues/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        adminService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------------------------------------------------------
    // Halls (nested under a venue for creation, flat for read/update/delete)
    // ---------------------------------------------------------------

    @PostMapping("/venues/{venueId}/halls")
    public ResponseEntity<HallResponse> createHall(@PathVariable Long venueId, @Valid @RequestBody HallRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createHall(venueId, request));
    }

    @GetMapping("/halls/{id}")
    public HallResponse getHall(@PathVariable Long id) {
        return adminService.getHall(id);
    }

    @PutMapping("/halls/{id}")
    public HallResponse updateHall(@PathVariable Long id, @Valid @RequestBody HallRequest request) {
        return adminService.updateHall(id, request);
    }

    @DeleteMapping("/halls/{id}")
    public ResponseEntity<Void> deleteHall(@PathVariable Long id) {
        adminService.deleteHall(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------------------------------------------------------
    // Shows
    // ---------------------------------------------------------------

    @GetMapping("/shows")
    public List<AdminShowResponse> getAllShows() {
        return showService.getAllShowsAdmin();
    }

    @GetMapping("/shows/{id}")
    public AdminShowResponse getShow(@PathVariable Long id) {
        return showService.getShowAdmin(id);
    }

    @PostMapping("/shows")
    public ResponseEntity<AdminShowResponse> createShow(@Valid @RequestBody ShowRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(showService.createShow(request));
    }

    @PutMapping("/shows/{id}")
    public AdminShowResponse updateShow(@PathVariable Long id, @Valid @RequestBody ShowRequest request) {
        return showService.updateShow(id, request);
    }

    @DeleteMapping("/shows/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------------------------------------------------------
    // Bookings & dashboard
    // ---------------------------------------------------------------

    @GetMapping("/bookings")
    public List<AdminBookingResponse> getAllBookings() {
        return bookingService.getAllBookingsAdmin();
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {
        return adminService.getDashboard();
    }
}
