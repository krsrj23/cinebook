package com.cinebook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * The availability record for one physical Seat within one Show. This is the
 * row the concurrency-safe hold flow locks (SELECT ... FOR UPDATE) so that
 * two customers racing to book the same seat cannot both succeed.
 *
 * One row is generated per Seat when its Show is created (see ShowService).
 */
@Entity
@Table(name = "show_seats", uniqueConstraints = {
        @UniqueConstraint(name = "uk_show_seat", columnNames = {"show_id", "seat_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShowSeatStatus status;

    private LocalDateTime holdExpiresAt;

    /**
     * Optimistic-locking safety net layered on top of the pessimistic
     * SELECT ... FOR UPDATE used during the hold transaction. Not strictly
     * required alongside the pessimistic lock, but keeps this entity honest
     * if it is ever updated outside that locked path.
     */
    @Version
    private Integer version;
}
