package com.cinebook.repository;

import com.cinebook.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {

    List<Show> findByMovieIdOrderByShowDateTimeAsc(Long movieId);
}
