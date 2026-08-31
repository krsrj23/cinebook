package com.cinebook.exception;

/**
 * Thrown when one or more requested ShowSeats are not AVAILABLE at the moment
 * the hold transaction locks them, or when a booking action is attempted in
 * an invalid state (e.g. confirming an already-expired booking). Mapped to 409.
 */
public class SeatUnavailableException extends RuntimeException {
    public SeatUnavailableException(String message) {
        super(message);
    }
}
