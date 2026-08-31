package com.cinebook.service;

import com.cinebook.dto.request.HallRequest;
import com.cinebook.dto.request.MovieRequest;
import com.cinebook.dto.request.VenueRequest;
import com.cinebook.dto.response.DashboardResponse;
import com.cinebook.dto.response.HallResponse;
import com.cinebook.dto.response.MovieResponse;
import com.cinebook.dto.response.VenueResponse;
import com.cinebook.entity.Hall;
import com.cinebook.entity.Movie;
import com.cinebook.entity.Seat;
import com.cinebook.entity.SeatType;
import com.cinebook.entity.Venue;
import com.cinebook.exception.BadRequestException;
import com.cinebook.exception.ResourceNotFoundException;
import com.cinebook.repository.BookingRepository;
import com.cinebook.repository.HallRepository;
import com.cinebook.repository.MovieRepository;
import com.cinebook.repository.SeatRepository;
import com.cinebook.repository.ShowRepository;
import com.cinebook.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Backs the admin-only CRUD endpoints for movies, venues and halls plus the
 * dashboard aggregate. Show CRUD lives in ShowService (it needs the seat-map
 * pricing logic too); booking listing lives in BookingService.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private static final char FIRST_ROW_LETTER = 'A';

    private final MovieRepository movieRepository;
    private final VenueRepository venueRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;

    // ---------------------------------------------------------------
    // Movies
    // ---------------------------------------------------------------

    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .genre(request.getGenre())
                .language(request.getLanguage())
                .durationMinutes(request.getDurationMinutes())
                .posterUrl(request.getPosterUrl())
                .releaseDate(request.getReleaseDate())
                .build();
        return toMovieResponse(movieRepository.save(movie));
    }

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setGenre(request.getGenre());
        movie.setLanguage(request.getLanguage());
        movie.setDurationMinutes(request.getDurationMinutes());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setReleaseDate(request.getReleaseDate());
        return toMovieResponse(movieRepository.save(movie));
    }

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        if (!showRepository.findByMovieIdOrderByShowDateTimeAsc(id).isEmpty()) {
            throw new BadRequestException("Cannot delete a movie that still has shows scheduled");
        }
        movieRepository.delete(movie);
    }

    private MovieResponse toMovieResponse(Movie movie) {
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

    // ---------------------------------------------------------------
    // Venues
    // ---------------------------------------------------------------

    public List<VenueResponse> getAllVenues() {
        return venueRepository.findAll().stream().map(this::toVenueResponse).toList();
    }

    public VenueResponse getVenue(Long id) {
        return toVenueResponse(findVenueOrThrow(id));
    }

    @Transactional
    public VenueResponse createVenue(VenueRequest request) {
        Venue venue = Venue.builder()
                .name(request.getName())
                .city(request.getCity())
                .address(request.getAddress())
                .build();
        return toVenueResponse(venueRepository.save(venue));
    }

    @Transactional
    public VenueResponse updateVenue(Long id, VenueRequest request) {
        Venue venue = findVenueOrThrow(id);
        venue.setName(request.getName());
        venue.setCity(request.getCity());
        venue.setAddress(request.getAddress());
        return toVenueResponse(venueRepository.save(venue));
    }

    @Transactional
    public void deleteVenue(Long id) {
        Venue venue = findVenueOrThrow(id);
        if (!hallRepository.findByVenueId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete a venue that still has halls");
        }
        venueRepository.delete(venue);
    }

    private Venue findVenueOrThrow(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
    }

    private VenueResponse toVenueResponse(Venue venue) {
        List<HallResponse> halls = hallRepository.findByVenueId(venue.getId()).stream()
                .map(this::toHallResponse)
                .toList();
        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .city(venue.getCity())
                .address(venue.getAddress())
                .halls(halls)
                .build();
    }

    // ---------------------------------------------------------------
    // Halls
    // ---------------------------------------------------------------

    public HallResponse getHall(Long id) {
        return toHallResponse(findHallOrThrow(id));
    }

    /**
     * Creates a Hall under the given venue and immediately generates its
     * Seat rows: row letters A, B, C... one per row, seat numbers like
     * "A1".."A10", with the front `premiumRows` rows marked PREMIUM and the
     * rest REGULAR.
     */
    @Transactional
    public HallResponse createHall(Long venueId, HallRequest request) {
        Venue venue = findVenueOrThrow(venueId);

        if (request.getPremiumRows() > request.getRows()) {
            throw new BadRequestException("premiumRows cannot exceed the total number of rows");
        }

        Hall hall = Hall.builder()
                .venue(venue)
                .name(request.getName())
                .rows(request.getRows())
                .seatsPerRow(request.getSeatsPerRow())
                .premiumRows(request.getPremiumRows())
                .build();
        Hall savedHall = hallRepository.save(hall);

        generateSeatsForHall(savedHall);

        return toHallResponse(savedHall);
    }

    private void generateSeatsForHall(Hall hall) {
        List<Seat> seats = new java.util.ArrayList<>();
        for (int rowIndex = 0; rowIndex < hall.getRows(); rowIndex++) {
            char rowLetter = (char) (FIRST_ROW_LETTER + rowIndex);
            SeatType seatType = rowIndex < hall.getPremiumRows() ? SeatType.PREMIUM : SeatType.REGULAR;
            for (int seatNum = 1; seatNum <= hall.getSeatsPerRow(); seatNum++) {
                seats.add(Seat.builder()
                        .hall(hall)
                        .seatRow(String.valueOf(rowLetter))
                        .seatNumber(rowLetter + String.valueOf(seatNum))
                        .seatType(seatType)
                        .build());
            }
        }
        seatRepository.saveAll(seats);
    }

    @Transactional
    public HallResponse updateHall(Long id, HallRequest request) {
        Hall hall = findHallOrThrow(id);

        boolean layoutChanged = hall.getRows() != request.getRows()
                || hall.getSeatsPerRow() != request.getSeatsPerRow()
                || hall.getPremiumRows() != request.getPremiumRows();

        if (layoutChanged && !seatRepository.findByHallIdOrderBySeatRowAscSeatNumberAsc(id).isEmpty()
                && hasShows(id)) {
            throw new BadRequestException(
                    "Cannot change seat layout for a hall that already has shows - create a new hall instead");
        }

        hall.setName(request.getName());

        if (layoutChanged) {
            // Safe to regenerate: no shows depend on the existing seats yet.
            seatRepository.deleteAll(seatRepository.findByHallIdOrderBySeatRowAscSeatNumberAsc(id));
            hall.setRows(request.getRows());
            hall.setSeatsPerRow(request.getSeatsPerRow());
            hall.setPremiumRows(request.getPremiumRows());
            Hall saved = hallRepository.save(hall);
            generateSeatsForHall(saved);
            return toHallResponse(saved);
        }

        return toHallResponse(hallRepository.save(hall));
    }

    private boolean hasShows(Long hallId) {
        return showRepository.findAll().stream().anyMatch(s -> s.getHall().getId().equals(hallId));
    }

    @Transactional
    public void deleteHall(Long id) {
        Hall hall = findHallOrThrow(id);
        if (hasShows(id)) {
            throw new BadRequestException("Cannot delete a hall that already has shows scheduled");
        }
        seatRepository.deleteAll(seatRepository.findByHallIdOrderBySeatRowAscSeatNumberAsc(id));
        hallRepository.delete(hall);
    }

    private Hall findHallOrThrow(Long id) {
        return hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + id));
    }

    private HallResponse toHallResponse(Hall hall) {
        return HallResponse.builder()
                .id(hall.getId())
                .name(hall.getName())
                .rows(hall.getRows())
                .seatsPerRow(hall.getSeatsPerRow())
                .premiumRows(hall.getPremiumRows())
                .venueId(hall.getVenue().getId())
                .venueName(hall.getVenue().getName())
                .build();
    }

    // ---------------------------------------------------------------
    // Dashboard
    // ---------------------------------------------------------------

    public DashboardResponse getDashboard() {
        long totalMovies = movieRepository.count();
        long totalShows = showRepository.count();
        long totalBookings = bookingRepository.count();
        BigDecimal totalRevenue = bookingRepository.findAllByOrderByBookingTimeDesc().stream()
                .filter(b -> b.getStatus() == com.cinebook.entity.BookingStatus.CONFIRMED)
                .map(com.cinebook.entity.Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardResponse.builder()
                .totalMovies(totalMovies)
                .totalShows(totalShows)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .build();
    }
}
