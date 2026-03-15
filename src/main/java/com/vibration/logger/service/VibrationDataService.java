package com.vibration.logger.service;

import com.vibration.logger.model.VibrationData;
import com.vibration.logger.repository.VibrationDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VibrationDataService {

    private final VibrationDataRepository repository;
    private final SettingsService settingsService;

    public VibrationData saveVibrationData(double ax, double ay, double az) {
        double magnitude = calculateMagnitude(ax, ay, az);
        String status = determineStatus(magnitude);

        VibrationData data = new VibrationData();
        data.setAx(ax);
        data.setAy(ay);
        data.setAz(az);
        data.setVibrationValue(magnitude);
        data.setStatus(status);

        return repository.save(data);
    }

    public List<VibrationData> getRecentData() {
        return repository.findTop50ByOrderByTimestampDesc();
    }

    public List<VibrationData> getAllData() {
        return repository.findAll();
    }

    public List<VibrationData> getDataByDateRange(java.time.LocalDateTime start, java.time.LocalDateTime end) {
        return repository.findByTimestampBetweenOrderByTimestampAsc(start, end);
    }

    private double calculateMagnitude(double ax, double ay, double az) {
        return Math.sqrt((ax * ax) + (ay * ay) + (az * az));
    }

    private String determineStatus(double magnitude) {
        if (magnitude <= settingsService.getWarningThreshold()) {
            return "Normal";
        } else if (magnitude <= settingsService.getCriticalThreshold()) {
            return "Warning";
        } else {
            return "Critical";
        }
    }
}
