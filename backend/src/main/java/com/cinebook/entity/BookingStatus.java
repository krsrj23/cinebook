package com.cinebook.entity;

/**
 * Lifecycle state of a Booking.
 * PENDING   - seats held, awaiting payment confirmation.
 * CONFIRMED - payment succeeded, seats BOOKED.
 * CANCELLED - customer cancelled a PENDING or CONFIRMED booking.
 * EXPIRED   - the hold window elapsed before confirmation (set by the
 *             scheduled HoldExpiryService).
 */
public enum BookingStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    EXPIRED
}
