package com.cinebook.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmRequest {

    @NotBlank(message = "paymentMethod is required")
    private String paymentMethod;
}
