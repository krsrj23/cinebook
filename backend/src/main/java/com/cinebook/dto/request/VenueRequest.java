package com.cinebook.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VenueRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "City is required")
    private String city;

    private String address;
}
