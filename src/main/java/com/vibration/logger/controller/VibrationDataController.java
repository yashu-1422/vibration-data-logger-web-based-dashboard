package com.vibration.logger.controller;

import com.vibration.logger.model.VibrationData;
import com.vibration.logger.service.VibrationDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vibration")
@CrossOrigin(origins = "*") // Allow frontend to call
@RequiredArgsConstructor
public class VibrationDataController {

    private final VibrationDataService service;

    @PostMapping
    public ResponseEntity<VibrationData> addData(@RequestBody VibrationInput input) {
        VibrationData savedData = service.saveVibrationData(input.getAx(), input.getAy(), input.getAz());
        return ResponseEntity.ok(savedData);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<VibrationData>> getRecentData() {
        return ResponseEntity.ok(service.getRecentData());
    }

    @GetMapping("/all")
    public ResponseEntity<List<VibrationData>> getAllData() {
        return ResponseEntity.ok(service.getAllData());
    }

    @GetMapping("/range")
    public ResponseEntity<List<VibrationData>> getDataByRange(
            @RequestParam("start") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime start,
            @RequestParam("end") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime end) {
        return ResponseEntity.ok(service.getDataByDateRange(start, end));
    }

    public static class VibrationInput {
        private double ax;
        private double ay;
        private double az;

        public double getAx() {
            return ax;
        }

        public void setAx(double ax) {
            this.ax = ax;
        }

        public double getAy() {
            return ay;
        }

        public void setAy(double ay) {
            this.ay = ay;
        }

        public double getAz() {
            return az;
        }

        public void setAz(double az) {
            this.az = az;
        }
    }
}
