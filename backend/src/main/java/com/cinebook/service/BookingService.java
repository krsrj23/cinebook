package com.cinebook.service;

import com.cinebook.dto.request.ConfirmRequest;
import com.cinebook.dto.request.HoldRequest;
import com.cinebook.dto.response.AdminBookingResponse;
import com.cinebook.dto.response.BookingResponse;
import com.cinebook.dto.response.CancelResponse;
import com.cinebook.dto.response.ConfirmResponse;
import com.cinebook.dto.response.HoldResponse;
import com.cinebook.dto.response.HoldSeatResponse;
import com.cinebook.entity.Booking;
import com.cinebook.entity.BookingSeat;
import com.cinebook.entity.BookingStatus;
import com.cinebook.entity.Hall;
import com.cinebook.entity.Payment;
import com.cinebook.entity.PaymentStatus;
import com.cinebook.entity.Role;
import com.cinebook.entity.Show;
import com.cinebook.entity.ShowSeat;
import com.cinebook.entity.ShowSeatStatus;
import com.cinebook.entity.User;
import com.cinebook.exception.BadRequestException;
import com.cinebook.exception.ResourceNotFoundException;
import com.cinebook.exception.SeatUnavailableException;
import com.cinebook.repository.BookingRepository;
import com.cinebook.repository.BookingSeatRepository;
import com.cinebook.repository.PaymentRepository;
import com.cinebook.repository.ShowSeatRepository;
import com.cinebook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    /** How long a hold lasts before it is eligible for expiry. */
    private static final long HOLD_MINUTES = 5;

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowSeatRepository showSeatRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    // ---------------------------------------------------------------
    // POST /api/bookings/hold
    // ---------------------------------------------------------------

    /**
     * Locks the requested ShowSeat rows, verifies they are all still
     * AVAILABLE, and only then flips them to HELD and creates the
     * PENDING booking. Everything happens inside one transaction so the
     * lock is held for the entire check-then-act sequence - see the Javadoc
     * on ShowSeatRepository.findAllForUpdate for why a pessimistic lock
     * (rather than optimistic @Version) is the right tool here.
     */
    @Transactional
    public HoldResponse holdSeats(HoldRequest request, String userEmail) {
        User user = findUserOrThrow(userEmail);

        List<Long> requestedIds = request.getShowSeatIds();

        // SELECT ... FOR UPDATE on exactly the rows we care about. Any other
        // transaction trying to hold/confirm/cancel one of these same seats
        // will block here until this transaction commits or rolls back.
        List<ShowSeat> lockedSeats = showSeatRepository.findAllForUpdate(requestedIds);

        if (lockedSeats.size() != requestedIds.size()) {
            throw new SeatUnavailableException("One or more requested seats do not exist");
        }

        boolean allSameShow = lockedSeats.stream()
                .allMatch(ss -> ss.getShow().getId().equals(request.getShowId()));
        if (!allSameShow) {
            throw new BadRequestException("All requested seats must belong to the requested show");
        }

        boolean allAvailable = lockedSeats.stream()
                .allMatch(ss -> ss.getStatus() == ShowSeatStatus.AVAILABLE);
        if (!allAvailable) {
            // Reject the whole request - no partial holds.
            throw new SeatUnavailableException("One or more selected seats are no longer available");
        }

        Show show = lockedSeats.get(0).getShow();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(HOLD_MINUTES);

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (ShowSeat ss : lockedSeats) {
            ss.setStatus(ShowSeatStatus.HELD);
            ss.setHoldExpiresAt(expiresAt);
            totalAmount = totalAmount.add(ShowService.priceFor(show.getBasePrice(), ss.getSeat().getSeatType()));
        }
        showSeatRepository.saveAll(lockedSeats);

        Booking booking = Booking.builder()
                .user(user)
                .show(show)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .bookingTime(LocalDateTime.now())
                .build();
        Booking savedBooking = bookingRepository.save(booking);

        List<BookingSeat> bookingSeats = lockedSeats.stream()
                .map(ss -> BookingSeat.builder().booking(savedBooking).showSeat(ss).build())
                .toList();
        bookingSeatRepository.saveAll(bookingSeats);

        List<HoldSeatResponse> seatResponses = lockedSeats.stream()
                .sorted(Comparator.comparing(ss -> ss.getSeat().getSeatNumber()))
                .map(ss -> HoldSeatResponse.builder()
                        .showSeatId(ss.getId())
                        .seatNumber(ss.getSeat().getSeatNumber())
                        .price(ShowService.priceFor(show.getBasePrice(), ss.getSeat().getSeatType()))
                        .build())
                .toList();

        return HoldResponse.builder()
                .bookingId(savedBooking.getId())
                .expiresAt(expiresAt)
                .totalAmount(totalAmount)
                .seats(seatResponses)
                .build();
    }

    // ---------------------------------------------------------------
    // POST /api/bookings/{id}/confirm
    // ---------------------------------------------------------------

    @Transactional
    public ConfirmResponse confirmBooking(Long bookingId, ConfirmRequest request, String userEmail) {
        Booking booking = findBookingOrThrow(bookingId);
        assertOwner(booking, userEmail);

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new SeatUnavailableException("This booking has already expired");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only a PENDING booking can be confirmed");
        }

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(bookingId);
        List<Long> showSeatIds = bookingSeats.stream().map(bs -> bs.getShowSeat().getId()).toList();

        // Re-lock the seats: guards against the rare race where the 30s
        // expiry sweep flips them back to AVAILABLE in between the PENDING
        // check above and the BOOKED write below.
        List<ShowSeat> lockedSeats = showSeatRepository.findAllForUpdate(showSeatIds);

        boolean anyExpired = lockedSeats.stream().anyMatch(ss -> ss.getStatus() != ShowSeatStatus.HELD);
        if (anyExpired) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new SeatUnavailableException("This booking has already expired");
        }

        for (ShowSeat ss : lockedSeats) {
            ss.setStatus(ShowSeatStatus.BOOKED);
            ss.setHoldExpiresAt(null);
        }
        showSeatRepository.saveAll(lockedSeats);

        // Mock payment - no real payment gateway, always succeeds.
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.SUCCESS)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .method(request.getPaymentMethod())
                .paidAt(LocalDateTime.now())
                .build();
        Payment savedPayment = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return ConfirmResponse.builder()
                .bookingId(booking.getId())
                .status(booking.getStatus().name())
                .transactionId(savedPayment.getTransactionId())
                .paidAmount(savedPayment.getAmount())
                .build();
    }

    // ---------------------------------------------------------------
    // POST /api/bookings/{id}/cancel
    // ---------------------------------------------------------------

    @Transactional
    public CancelResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = findBookingOrThrow(bookingId);
        assertOwner(booking, userEmail);

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only a PENDING or CONFIRMED booking can be cancelled");
        }

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(bookingId);
        List<Long> showSeatIds = bookingSeats.stream().map(bs -> bs.getShowSeat().getId()).toList();

        List<ShowSeat> lockedSeats = showSeatRepository.findAllForUpdate(showSeatIds);
        for (ShowSeat ss : lockedSeats) {
            ss.setStatus(ShowSeatStatus.AVAILABLE);
            ss.setHoldExpiresAt(null);
        }
        showSeatRepository.saveAll(lockedSeats);

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        return CancelResponse.builder()
                .bookingId(booking.getId())
                .status(booking.getStatus().name())
                .build();
    }

    // ---------------------------------------------------------------
    // GET /api/bookings/my , GET /api/bookings/{id}
    // ---------------------------------------------------------------

    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = findUserOrThrow(userEmail);
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(user.getId()).stream()
                .map(this::toBookingResponse)
                .toList();
    }

    public BookingResponse getBookingById(Long bookingId, String userEmail) {
        Booking booking = findBookingOrThrow(bookingId);
        assertOwner(booking, userEmail);
        return toBookingResponse(booking);
    }

    // ---------------------------------------------------------------
    // Admin: GET /api/admin/bookings
    // ---------------------------------------------------------------

    public List<AdminBookingResponse> getAllBookingsAdmin() {
    List<Booking> bookings = bookingRepository.findAllByOrderByBookingTimeDesc();

    return bookings.stream()
            .map(booking -> {
                BookingResponse base = toBookingResponse(booking);

                return AdminBookingResponse.builder()
                        .id(base.getId())
                        .movieTitle(base.getMovieTitle())
                        .posterUrl(base.getPosterUrl())
                        .venueName(base.getVenueName())
                        .hallName(base.getHallName())
                        .showDateTime(base.getShowDateTime())
                        .seatNumbers(base.getSeatNumbers())
                        .totalAmount(base.getTotalAmount())
                        .status(base.getStatus())
                        .bookingTime(base.getBookingTime())
                        .customerName(booking.getUser().getName())
                        .customerEmail(booking.getUser().getEmail())
                        .build();
            })
            .collect(java.util.stream.Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private BookingResponse toBookingResponse(Booking booking) {
        Show show = booking.getShow();
        Hall hall = show.getHall();

        List<String> seatNumbers = bookingSeatRepository.findByBookingId(booking.getId()).stream()
                .map(bs -> bs.getShowSeat().getSeat().getSeatNumber())
                .sorted()
                .toList();

        return BookingResponse.builder()
                .id(booking.getId())
                .movieTitle(show.getMovie().getTitle())
                .posterUrl(show.getMovie().getPosterUrl())
                .venueName(hall.getVenue().getName())
                .hallName(hall.getName())
                .showDateTime(show.getShowDateTime())
                .seatNumbers(seatNumbers)
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus().name())
                .bookingTime(booking.getBookingTime())
                .build();
    }

    private void assertOwner(Booking booking, String userEmail) {
        User user = findUserOrThrow(userEmail);
        boolean isOwner = booking.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have access to this booking");
        }
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }
}
