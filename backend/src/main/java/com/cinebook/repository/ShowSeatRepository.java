package com.cinebook.repository;

import com.cinebook.entity.ShowSeat;
import com.cinebook.entity.ShowSeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    List<ShowSeat> findByShowIdOrderBySeat_SeatRowAscSeat_SeatNumberAsc(Long showId);

    /**
     * Locks the given ShowSeat rows with SELECT ... FOR UPDATE (PESSIMISTIC_WRITE).
     *
     * Why a pessimistic lock here, specifically: seat holding is a
     * check-then-act operation ("is it AVAILABLE? if so, flip it to HELD")
     * that must run against a stable view of these exact rows while two or
     * more customers may be racing to hold the very same seat at the same
     * instant. An optimistic (@Version) check alone would let both
     * transactions read AVAILABLE, both decide to proceed, and only have one
     * fail at commit time with a rollback the caller has to interpret -
     * clunky for a "sorry, that seat just got taken" UX. Taking a row lock
     * up front instead makes the second transaction block until the first
     * commits or rolls back, so it always re-evaluates a fresh AVAILABLE/HELD
     * status and the whole hold request can be rejected cleanly and
     * immediately with a 409 - no partial holds, no retry loop needed.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ss from ShowSeat ss where ss.id in :ids")
    List<ShowSeat> findAllForUpdate(@Param("ids") List<Long> ids);

    List<ShowSeat> findByStatusAndHoldExpiresAtBefore(ShowSeatStatus status, LocalDateTime dateTime);

    long countByShowIdAndStatus(Long showId, ShowSeatStatus status);

    long countByShowId(Long showId);
}
