package com.hospital.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.QueueResponse;
import com.hospital.dto.WaitTimeResponse;
import com.hospital.service.QueueService;

@RestController
@RequestMapping("/queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    // GET /queue/status/{doctorId} — get queue for a doctor (today by default)
    @GetMapping("/status/{doctorId}")
    public ResponseEntity<ApiResponse<List<QueueResponse>>> getQueueByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String date) {
        LocalDate queueDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(queueService.getQueueByDoctor(doctorId, queueDate)));
    }

    // GET /queue/wait-time/{appointmentId} — get estimated wait time
    @GetMapping("/wait-time/{appointmentId}")
    public ResponseEntity<ApiResponse<WaitTimeResponse>> getWaitTime(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(queueService.getWaitTime(appointmentId)));
    }

    // POST /queue/call-next/{doctorId} — call next patient in queue (doctor/admin)
    @PostMapping("/call-next/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<QueueResponse>> callNextPatient(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String date) {
        LocalDate queueDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        QueueResponse called = queueService.callNextPatient(doctorId, queueDate);
        return ResponseEntity.ok(ApiResponse.success("Next patient called", called));
    }

    // POST /queue/skip-missed/{appointmentId} — mark no-show and move to end, then call next
    @PostMapping("/skip-missed/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<QueueResponse>> skipMissedAndCallNext(
            @PathVariable Long appointmentId) {
        QueueResponse called = queueService.skipMissedAndMoveToEnd(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Patient moved to end; next patient called", called));
    }
}
