package com.hospital.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.DeleteAccountRequest;
import com.hospital.dto.PasswordChangeRequest;
import com.hospital.dto.PatientProfileUpdateRequest;
import com.hospital.dto.PatientRegisterRequest;
import com.hospital.dto.PatientResponse;
import com.hospital.dto.SecurityUpdateRequest;
import com.hospital.service.AppointmentService;
import com.hospital.service.PatientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;

    public PatientController(PatientService patientService, AppointmentService appointmentService) {
        this.patientService = patientService;
        this.appointmentService = appointmentService;
    }

    // POST /patients/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PatientResponse>> register(
            @Valid @RequestBody PatientRegisterRequest request) {
        PatientResponse response = patientService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", response));
    }

    // GET /patients/{id}
    @GetMapping("/{id}")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    // GET /patients/{id}/appointments
    @GetMapping("/{id}/appointments")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getPatientAppointments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByPatient(id)));
    }

    // PUT /patients/{id}/profile
    @PutMapping("/{id}/profile")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<PatientResponse>> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody PatientProfileUpdateRequest request) {
        PatientResponse response = patientService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    // PUT /patients/{id}/security
    @PutMapping("/{id}/security")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<PatientResponse>> updateSecurity(
            @PathVariable Long id,
            @Valid @RequestBody SecurityUpdateRequest request) {
        PatientResponse response = patientService.updateSecurity(id, request);
        return ResponseEntity.ok(ApiResponse.success("Security settings updated successfully", response));
    }

    // PUT /patients/{id}/password
    @PutMapping("/{id}/password")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordChangeRequest request) {
        patientService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    // DELETE /patients/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("@accessControl.canAccessPatient(#id)")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @PathVariable Long id,
            @Valid @RequestBody DeleteAccountRequest request) {
        patientService.deleteAccount(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }
}
