package com.cinebook.entity;

/**
 * Pricing tier of a physical Seat within a Hall. The front `premiumRows` rows
 * of a hall are PREMIUM, the rest REGULAR. Show pricing multiplies the
 * show's basePrice by 1.5 for PREMIUM seats.
 */
public enum SeatType {
    REGULAR,
    PREMIUM
}
