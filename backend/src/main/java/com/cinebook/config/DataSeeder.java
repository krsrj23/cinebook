package com.cinebook.config;

import com.cinebook.entity.Hall;
import com.cinebook.entity.Movie;
import com.cinebook.entity.Role;
import com.cinebook.entity.Seat;
import com.cinebook.entity.SeatType;
import com.cinebook.entity.Show;
import com.cinebook.entity.ShowSeat;
import com.cinebook.entity.ShowSeatStatus;
import com.cinebook.entity.User;
import com.cinebook.entity.Venue;
import com.cinebook.repository.HallRepository;
import com.cinebook.repository.MovieRepository;
import com.cinebook.repository.SeatRepository;
import com.cinebook.repository.ShowRepository;
import com.cinebook.repository.ShowSeatRepository;
import com.cinebook.repository.UserRepository;
import com.cinebook.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the database with demo data on first run so the app is immediately
 * explorable. Only runs when there are zero movies in the DB, so it never
 * duplicates data on subsequent restarts.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final int HALL_ROWS = 8;
    private static final int HALL_SEATS_PER_ROW = 10;
    private static final int HALL_PREMIUM_ROWS = 2;

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final VenueRepository venueRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (movieRepository.count() > 0) {
            log.info("Database already has data - skipping seed");
            return;
        }

        log.info("Seeding CineBook demo data...");

        seedUsers();
        List<Movie> movies = seedMovies();
        List<Hall> halls = seedVenuesAndHalls();
        seedShows(movies, halls);

        log.info("Seeding complete: {} movies, {} halls, admin/demo users ready", movies.size(), halls.size());
    }

    private void seedUsers() {
        // Same PasswordEncoder bean used at registration time (see AuthService),
        // so these seeded credentials work exactly like a normal signup.
        User admin = User.builder()
                .name("CineBook Admin")
                .email("admin@cinebook.dev")
                .password(passwordEncoder.encode("Admin@123"))
                .phone("9000000001")
                .role(Role.ADMIN)
                .build();

        User demo = User.builder()
                .name("Demo Customer")
                .email("demo@cinebook.dev")
                .password(passwordEncoder.encode("Demo@123"))
                .phone("9000000002")
                .role(Role.CUSTOMER)
                .build();

        userRepository.save(admin);
        userRepository.save(demo);
    }

    private List<Movie> seedMovies() {
        List<Movie> movies = new ArrayList<>();

        movies.add(Movie.builder()
                .title("Echoes of Tomorrow")
                .description("A team of scientists race against time when a signal from deep space threatens to rewrite the future.")
                .genre("Sci-Fi")
                .language("English")
                .durationMinutes(142)
                .posterUrl("https://picsum.photos/seed/echoes-of-tomorrow/400/600")
                .releaseDate(LocalDate.now().minusDays(10))
                .build());

        movies.add(Movie.builder()
                .title("The Last Ember")
                .description("An exiled warrior must reunite three broken kingdoms before an ancient darkness returns.")
                .genre("Fantasy/Adventure")
                .language("English")
                .durationMinutes(158)
                .posterUrl("https://picsum.photos/seed/the-last-ember/400/600")
                .releaseDate(LocalDate.now().minusDays(3))
                .build());

        movies.add(Movie.builder()
                .title("Midnight in Meherganj")
                .description("A small-town musician's world turns upside down after a chance encounter on a rain-soaked night.")
                .genre("Romance/Drama")
                .language("Hindi")
                .durationMinutes(135)
                .posterUrl("https://picsum.photos/seed/midnight-meherganj/400/600")
                .releaseDate(LocalDate.now().minusDays(20))
                .build());

        movies.add(Movie.builder()
                .title("Checkmate Protocol")
                .description("A retired intelligence officer is pulled back into the game when an old operation resurfaces.")
                .genre("Action/Thriller")
                .language("English")
                .durationMinutes(126)
                .posterUrl("https://picsum.photos/seed/checkmate-protocol/400/600")
                .releaseDate(LocalDate.now().minusDays(1))
                .build());

        movies.add(Movie.builder()
                .title("The Spice Route")
                .description("Three strangers on a train through the Western Ghats discover their lives are more connected than they thought.")
                .genre("Comedy/Drama")
                .language("Hindi")
                .durationMinutes(118)
                .posterUrl("https://picsum.photos/seed/the-spice-route/400/600")
                .releaseDate(LocalDate.now().minusDays(45))
                .build());

        return movieRepository.saveAll(movies);
    }

    private List<Hall> seedVenuesAndHalls() {
        List<Hall> halls = new ArrayList<>();

        Venue venue1 = venueRepository.save(Venue.builder()
                .name("PVR Cinemas - Orion Mall")
                .city("Bengaluru")
                .address("Orion Mall, Rajajinagar, Bengaluru")
                .build());

        Venue venue2 = venueRepository.save(Venue.builder()
                .name("INOX Megaplex - Phoenix Marketcity")
                .city("Mumbai")
                .address("Phoenix Marketcity, Kurla West, Mumbai")
                .build());

        for (Venue venue : List.of(venue1, venue2)) {
            for (String hallName : List.of("Audi 1", "Audi 2")) {
                Hall hall = hallRepository.save(Hall.builder()
                        .venue(venue)
                        .name(hallName)
                        .rows(HALL_ROWS)
                        .seatsPerRow(HALL_SEATS_PER_ROW)
                        .premiumRows(HALL_PREMIUM_ROWS)
                        .build());
                generateSeatsForHall(hall);
                halls.add(hall);
            }
        }

        return halls;
    }

    private void generateSeatsForHall(Hall hall) {
        List<Seat> seats = new ArrayList<>();
        for (int rowIndex = 0; rowIndex < hall.getRows(); rowIndex++) {
            char rowLetter = (char) ('A' + rowIndex);
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

    private void seedShows(List<Movie> movies, List<Hall> halls) {
        List<LocalTime> showTimes = List.of(
                LocalTime.of(10, 30),
                LocalTime.of(14, 0),
                LocalTime.of(18, 30),
                LocalTime.of(21, 30));

        BigDecimal[] basePrices = {
                new BigDecimal("180.00"), new BigDecimal("200.00"),
                new BigDecimal("220.00"), new BigDecimal("250.00")
        };

        int hallIndex = 0;
        int timeIndex = 0;
        int priceIndex = 0;

        List<Show> allShows = new ArrayList<>();

        // Each movie gets shows today, tomorrow and the day after, cycling
        // through halls/times/prices so the catalog looks varied.
        for (Movie movie : movies) {
            for (int dayOffset = 0; dayOffset <= 2; dayOffset++) {
                Hall hall = halls.get(hallIndex % halls.size());
                LocalTime time = showTimes.get(timeIndex % showTimes.size());
                BigDecimal price = basePrices[priceIndex % basePrices.length];

                LocalDateTime showDateTime = LocalDate.now().plusDays(dayOffset).atTime(time);

                Show show = Show.builder()
                        .movie(movie)
                        .hall(hall)
                        .showDateTime(showDateTime)
                        .basePrice(price)
                        .build();
                allShows.add(show);

                hallIndex++;
                timeIndex++;
                priceIndex++;
            }
        }

        List<Show> savedShows = showRepository.saveAll(allShows);

        for (Show show : savedShows) {
            List<Seat> seats = seatRepository.findByHallIdOrderBySeatRowAscSeatNumberAsc(show.getHall().getId());
            List<ShowSeat> showSeats = new ArrayList<>();
            for (Seat seat : seats) {
                showSeats.add(ShowSeat.builder()
                        .show(show)
                        .seat(seat)
                        .status(ShowSeatStatus.AVAILABLE)
                        .holdExpiresAt(null)
                        .build());
            }
            showSeatRepository.saveAll(showSeats);
        }
    }
}
