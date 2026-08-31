package com.cinebook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(nullable = false)
    private String name;

    /** Total number of seat rows, e.g. 8 -> rows A..H. */
    @Column(name = "row_count", nullable = false)
    private int rows;

    @Column(nullable = false)
    private int seatsPerRow;

    /** How many front rows (starting at A) are PREMIUM; the rest are REGULAR. */
    @Column(nullable = false)
    private int premiumRows;
}