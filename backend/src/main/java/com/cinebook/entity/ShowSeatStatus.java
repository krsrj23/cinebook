package com.cinebook.entity;

/**
 * Availability state of a single seat for a single show. This is the row
 * the seat-hold mechanism locks and flips: AVAILABLE -> HELD -> BOOKED,
 * or back to AVAILABLE if a hold expires or a booking is cancelled.
 */
public enum ShowSeatStatus {
    AVAILABLE,
    HELD,
    BOOKED
}
