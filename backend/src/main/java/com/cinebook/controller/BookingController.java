package com.cinebook.controller;

import com.cinebook.dto.request.ConfirmRequest;
import com.cinebook.dto.request.HoldRequest;
import com.cinebook.dto.response.BookingResponse;
import com.cinebook.dto.response.CancelResponse;
import com.cinebook.dto.response.ConfirmResponse;
import com.cinebook.dto.response.HoldResponse;
import com.cinebook.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Booking endpoints - all require an authenticated user (CUSTOMER or ADMIN). */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/hold")
    public ResponseEntity<HoldResponse> holdSeats(@Valid @RequestBody HoldRequest request,
                                                    Authentication authentication) {
        HoldResponse response = bookingService.holdSeats(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/confirm")
    public ConfirmResponse confirmBooking(@PathVariable Long id,
                                           @Valid @RequestBody ConfirmRequest request,
                                           Authentication authentication) {
        return bookingService.confirmBooking(id, request, authentication.getName());
    }

    @PostMapping("/{id}/cancel")
    public CancelResponse cancelBooking(@PathVariable Long id, Authentication authentication) {
        return bookingService.cancelBooking(id, authentication.getName());
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        return bookingService.getMyBookings(authentication.getName());
    }

    @GetMapping("/{id}")
    public BookingResponse getBooking(@PathVariable Long id, Authentication authentication) {
        return bookingService.getBookingById(id, authentication.getName());
    }
}
