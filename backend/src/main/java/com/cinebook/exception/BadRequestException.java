package com.cinebook.exception;

/** Thrown for a request that is well-formed but semantically invalid (e.g. bad state transition). Mapped to 400. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
