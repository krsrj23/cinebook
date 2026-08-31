package com.cinebook.service;

import com.cinebook.dto.request.ShowRequest;
import com.cinebook.dto.response.AdminShowResponse;
import com.cinebook.dto.response.SeatMapResponse;
import com.cinebook.dto.response.SeatMapSeatResponse;
import com.cinebook.dto.response.ShowDetailResponse;
import com.cinebook.dto.response.ShowListItemResponse;
import com.cinebook.entity.Hall;
import com.cinebook.entity.Movie;
import com.cinebook.entity.Seat;
import com.cinebook.entity.Show;
import com.cinebook.entity.ShowSeat;
import com.cinebook.entity.ShowSeatStatus;
import com.cinebook.exception.BadRequestException;
import com.cinebook.exception.ResourceNotFoundException;
import com.cinebook.repository.BookingRepository;
import com.cinebook.repository.HallRepository;
import com.cinebook.repository.MovieRepository;
import com.cinebook.repository.SeatRepository;
import com.cinebook.repository.ShowRepository;
import com.cinebook.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShowService {

    /** Multiplier applied to a show's basePrice for PREMIUM seats. */
    private static final BigDecimal PREMIUM_MULTIPLIER = new BigDecimal("1.5");

    /** How long a seat hold lasts, mirrored in the /shows/{id}/seats response. */
    public static final int HOLD_SECONDS = 300;

    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    // ---------------------------------------------------------------
    // Public read endpoints
    // ---------------------------------------------------------------

    public List<ShowListItemResponse> getShowsForMovie(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new ResourceNotFoundException("Movie not found with id: " + movieId);
        }

        return showRepository.findByMovieIdOrderByShowDateTimeAsc(movieId).stream()
                .map(show -> {
                    long total = showSeatRepository.countByShowId(show.getId());
                    long available = showSeatRepository.countByShowIdAndStatus(show.getId(), ShowSeatStatus.AVAILABLE);
                    Hall hall = show.getHall();
                    return ShowListItemResponse.builder()
                            .id(show.getId())
                            .showDateTime(show.getShowDateTime())
                            .basePrice(show.getBasePrice())
                            .venueName(hall.getVenue().getName())
                            .city(hall.getVenue().getCity())
                            .hallName(hall.getName())
                            .availableSeats(available)
                            .totalSeats(total)
                            .build();
                })
                .toList();
    }

    public ShowDetailResponse getShowDetail(Long showId) {
        Show show = findShowOrThrow(showId);
        Hall hall = show.getHall();
        return ShowDetailResponse.builder()
                .id(show.getId())
                .movieTitle(show.getMovie().getTitle())
                .venueName(hall.getVenue().getName())
                .city(hall.getVenue().getCity())
                .hallName(hall.getName())
                .showDateTime(show.getShowDateTime())
                .basePrice(show.getBasePrice())
                .build();
    }

    public SeatMapResponse getSeatMap(Long showId) {
        Show show = findShowOrThrow(showId);
        BigDecimal basePrice = show.getBasePrice();

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdOrderBySeat_SeatRowAscSeat_SeatNumberAsc(showId);

        List<SeatMapSeatResponse> seats = showSeats.stream()
                .map(ss -> {
                    Seat seat = ss.getSeat();
                    BigDecimal price = priceFor(basePrice, seat.getSeatType());
                    return SeatMapSeatResponse.builder()
                            .showSeatId(ss.getId())
                            .seatId(seat.getId())
                            .seatRow(seat.getSeatRow())
                            .seatNumber(seat.getSeatNumber())
                            .seatType(seat.getSeatType().name())
                            .price(price)
                            .status(ss.getStatus().name())
                            .build();
                })
                .toList();

        return SeatMapResponse.builder()
                .holdSeconds(HOLD_SECONDS)
                .seats(seats)
                .build();
    }

    public static BigDecimal priceFor(BigDecimal basePrice, com.cinebook.entity.SeatType seatType) {
        return seatType == com.cinebook.entity.SeatType.PREMIUM
                ? basePrice.multiply(PREMIUM_MULTIPLIER)
                : basePrice;
    }

    public Show findShowOrThrow(Long showId) {
        return showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + showId));
    }

    // ---------------------------------------------------------------
    // Admin CRUD (GET/POST/PUT/DELETE /api/admin/shows)
    // ---------------------------------------------------------------

    public List<AdminShowResponse> getAllShowsAdmin() {
        return showRepository.findAll().stream().map(this::toAdminResponse).toList();
    }

    public AdminShowResponse getShowAdmin(Long id) {
        return toAdminResponse(findShowOrThrow(id));
    }

    /**
     * Creates a Show and, in the same transaction, generates one AVAILABLE
     * ShowSeat per Seat belonging to the target Hall - this is what makes a
     * brand new show immediately bookable.
     */
    @Transactional
    public AdminShowResponse createShow(ShowRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + request.getMovieId()));
        Hall hall = hallRepository.findById(request.getHallId())
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + request.getHallId()));

        Show show = Show.builder()
                .movie(movie)
                .hall(hall)
                .showDateTime(request.getShowDateTime())
                .basePrice(request.getBasePrice())
                .build();
        Show saved = showRepository.save(show);

        List<Seat> seats = seatRepository.findByHallIdOrderBySeatRowAscSeatNumberAsc(hall.getId());
        List<ShowSeat> showSeats = seats.stream()
                .map(seat -> ShowSeat.builder()
                        .show(saved)
                        .seat(seat)
                        .status(ShowSeatStatus.AVAILABLE)
                        .holdExpiresAt(null)
                        .build())
                .toList();
        showSeatRepository.saveAll(showSeats);

        return toAdminResponse(saved);
    }

    @Transactional
    public AdminShowResponse updateShow(Long id, ShowRequest request) {
        Show show = findShowOrThrow(id);

        if (!show.getMovie().getId().equals(request.getMovieId())) {
            Movie movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + request.getMovieId()));
            show.setMovie(movie);
        }
        // Changing the hall after seats already exist would orphan the
        // generated ShowSeat rows, so the hall is intentionally not
        // re-assignable via update - only reschedule time/price/movie.
        show.setShowDateTime(request.getShowDateTime());
        show.setBasePrice(request.getBasePrice());

        return toAdminResponse(showRepository.save(show));
    }

    @Transactional
    public void deleteShow(Long id) {
        Show show = findShowOrThrow(id);

        if (bookingRepository.existsByShowId(id)) {
            throw new BadRequestException("Cannot delete a show that already has bookings against it");
        }

        // No bookings reference this show yet, so it's safe to remove its
        // generated ShowSeat rows before the show itself.
        List<ShowSeat> showSeats = showSeatRepository.findByShowIdOrderBySeat_SeatRowAscSeat_SeatNumberAsc(id);
        showSeatRepository.deleteAll(showSeats);
        showRepository.delete(show);
    }

    private AdminShowResponse toAdminResponse(Show show) {
        Hall hall = show.getHall();
        return AdminShowResponse.builder()
                .id(show.getId())
                .movieId(show.getMovie().getId())
                .movieTitle(show.getMovie().getTitle())
                .hallId(hall.getId())
                .hallName(hall.getName())
                .venueName(hall.getVenue().getName())
                .showDateTime(show.getShowDateTime())
                .basePrice(show.getBasePrice())
                .build();
    }
}
