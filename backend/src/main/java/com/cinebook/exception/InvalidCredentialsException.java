package com.cinebook.exception;

/** Thrown when login email/password do not match. Mapped to 401. */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
