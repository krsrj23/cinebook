package com.cinebook.entity;

/**
 * Application-level role assigned to a User. Used both as a JPA enum column
 * and as the "role" claim embedded in issued JWTs (see JwtUtil).
 */
public enum Role {
    ADMIN,
    CUSTOMER
}
