package com.cinebook.exception;

/** Thrown when a unique constraint would be violated (e.g. registering with an existing email). Mapped to 409. */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
