package com.cinebook.exception;

/** Thrown when a requested entity (movie, show, booking, ...) does not exist. Mapped to 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
