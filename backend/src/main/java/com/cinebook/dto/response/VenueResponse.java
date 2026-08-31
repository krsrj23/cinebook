package com.cinebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueResponse {
    private Long id;
    private String name;
    private String city;
    private String address;
    /** Halls belonging to this venue, so the admin UI can render them nested without a second call. */
    private List<HallResponse> halls;
}
