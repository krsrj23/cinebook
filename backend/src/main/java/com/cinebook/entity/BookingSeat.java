package com.cinebook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Join row linking a Booking to the ShowSeat(s) it covers.
 *
 * A ShowSeat can belong to at most one *active* (PENDING/CONFIRMED)
 * BookingSeat at a time - that invariant is enforced in BookingService by
 * only ever creating a hold after re-checking ShowSeat.status == AVAILABLE
 * under a row lock. It is deliberately NOT a hard DB unique constraint on
 * show_seat_id, because rows are kept as history after a booking is
 * cancelled/expires: a seat that was booked and later cancelled must be
 * bookable again by someone else, which means the same show_seat_id
 * legitimately appears in more than one (non-active) BookingSeat row over
 * time.
 */
@Entity
@Table(name = "booking_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_seat_id", nullable = false)
    private ShowSeat showSeat;
}
