package com.hospital.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentBookRequest;
import com.hospital.dto.AppointmentCancellationRequest;
import com.hospital.dto.AppointmentRescheduleRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.service.AppointmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // POST /appointments/book
    @PostMapping("/book")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @Valid @RequestBody AppointmentBookRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", response));
    }

    // GET /appointments/doctor/{id}
    @GetMapping("/doctor/{id}")
    @PreAuthorize("@accessControl.canAccessDoctor(#id)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByDoctor(id)));
    }

    // GET /appointments/patient/{id}
    @GetMapping("/patient/{id}")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getPatientAppointments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByPatient(id)));
    }

    // GET /appointments/{id}
    @GetMapping("/{id}")
    @PreAuthorize("@accessControl.canAccessAppointment(#id)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    // PATCH /appointments/{id}/status?status=COMPLETED
    @PatchMapping("/{id}/status")
    @PreAuthorize("@accessControl.canUpdateAppointmentStatus(#id)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                appointmentService.updateStatus(id, status)));
    }

    // DELETE /appointments/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("@accessControl.canAccessAppointment(#id)")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) AppointmentCancellationRequest request) {
        appointmentService.cancelAppointment(id, request != null ? request.getReason() : null);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", null));
    }

    // PATCH /appointments/{id}/reschedule
    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("@accessControl.canAccessAppointment(#id)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        AppointmentResponse response = appointmentService.rescheduleAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled", response));
    }
}
