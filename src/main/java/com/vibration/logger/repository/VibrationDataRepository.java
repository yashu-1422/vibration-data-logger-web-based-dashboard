package com.vibration.logger.repository;

import com.vibration.logger.model.VibrationData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VibrationDataRepository extends JpaRepository<VibrationData, Long> {
    List<VibrationData> findTop50ByOrderByTimestampDesc();
    List<VibrationData> findByTimestampBetweenOrderByTimestampAsc(LocalDateTime start, LocalDateTime end);
}
