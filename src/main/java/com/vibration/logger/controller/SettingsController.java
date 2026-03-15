package com.vibration.logger.controller;

import com.vibration.logger.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*") // Allow frontend to call
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SettingsDto> getSettings() {
        return ResponseEntity.ok(new SettingsDto(
                settingsService.getWarningThreshold(),
                settingsService.getCriticalThreshold()
        ));
    }

    @PostMapping
    public ResponseEntity<SettingsDto> updateSettings(@RequestBody SettingsDto newSettings) {
        settingsService.setWarningThreshold(newSettings.getWarningThreshold());
        settingsService.setCriticalThreshold(newSettings.getCriticalThreshold());
        return ResponseEntity.ok(newSettings);
    }

    public static class SettingsDto {
        private double warningThreshold;
        private double criticalThreshold;

        public SettingsDto() {
        }

        public SettingsDto(double warningThreshold, double criticalThreshold) {
            this.warningThreshold = warningThreshold;
            this.criticalThreshold = criticalThreshold;
        }

        public double getWarningThreshold() {
            return warningThreshold;
        }

        public void setWarningThreshold(double warningThreshold) {
            this.warningThreshold = warningThreshold;
        }

        public double getCriticalThreshold() {
            return criticalThreshold;
        }

        public void setCriticalThreshold(double criticalThreshold) {
            this.criticalThreshold = criticalThreshold;
        }
    }
}
