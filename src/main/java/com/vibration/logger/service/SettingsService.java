package com.vibration.logger.service;

import org.springframework.stereotype.Service;

@Service
public class SettingsService {
    
    // Default thresholds in 'g'
    private double warningThreshold = 1.0;
    private double criticalThreshold = 2.0;

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
