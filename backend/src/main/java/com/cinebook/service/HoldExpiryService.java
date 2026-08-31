package com.cinebook.service;

import com.cinebook.entity.Booking;
import com.cinebook.entity.BookingSeat;
import com.cinebook.entity.BookingStatus;
import com.cinebook.entity.ShowSeat;
import com.cinebook.entity.ShowSeatStatus;
import com.cinebook.repository.BookingRepository;
import com.cinebook.repository.BookingSeatRepository;
import com.cinebook.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Background sweep that reclaims seat holds nobody confirmed in time.
 *
 * Every 30 seconds this finds all ShowSeats still marked HELD whose
 * holdExpiresAt is in the past, flips them back to AVAILABLE, and - for any
 * Booking that was still PENDING - marks that booking EXPIRED. Without this
 * job, a customer who abandons checkout mid-hold would lock those seats out
 * of the inventory forever.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HoldExpiryService {

    private final ShowSeatRepository showSeatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingRepository bookingRepository;

    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void releaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<ShowSeat> expiredSeats = showSeatRepository.findByStatusAndHoldExpiresAtBefore(ShowSeatStatus.HELD, now);

        if (expiredSeats.isEmpty()) {
            return;
        }

        List<Long> expiredSeatIds = expiredSeats.stream().map(ShowSeat::getId).toList();

        for (ShowSeat seat : expiredSeats) {
            seat.setStatus(ShowSeatStatus.AVAILABLE);
            seat.setHoldExpiresAt(null);
        }
        showSeatRepository.saveAll(expiredSeats);

        // Find every booking that held one of these now-expired seats, so we
        // can flip its status too (a booking can span multiple seats, so we
        // dedupe with a Set before touching each booking once).
        Set<Long> affectedBookingIds = new HashSet<>();
        for (BookingSeat bs : bookingSeatRepository.findByShowSeatIdIn(expiredSeatIds)) {
            affectedBookingIds.add(bs.getBooking().getId());
        }

        int expiredBookingCount = 0;
        for (Long bookingId : affectedBookingIds) {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking != null && booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);
                expiredBookingCount++;
            }
        }

        log.info("Hold expiry sweep: released {} seat(s), expired {} booking(s)",
                expiredSeats.size(), expiredBookingCount);
    }
}
