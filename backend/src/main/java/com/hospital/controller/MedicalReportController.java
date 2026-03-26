package com.hospital.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.MedicalReportRequest;
import com.hospital.dto.MedicalReportResponse;
import com.hospital.service.MedicalReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/reports")
public class MedicalReportController {

    private final MedicalReportService reportService;

    public MedicalReportController(MedicalReportService reportService) {
        this.reportService = reportService;
    }

    // POST /reports/doctor/{doctorId} — doctor creates a report
    @PostMapping("/doctor/{doctorId}")
    @PreAuthorize("@accessControl.canAccessDoctor(#doctorId)")
    public ResponseEntity<ApiResponse<MedicalReportResponse>> createReport(
            @PathVariable Long doctorId,
            @Valid @RequestBody MedicalReportRequest request) {
        MedicalReportResponse response = reportService.createReport(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medical report created successfully", response));
    }

    // GET /reports/{id} — get report by id
    @GetMapping("/{id}")
    @PreAuthorize("@accessControl.canAccessReport(#id)")
    public ResponseEntity<ApiResponse<MedicalReportResponse>> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportById(id)));
    }

    // GET /reports/appointment/{appointmentId} — get report by appointment
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("@accessControl.canAccessAppointment(#appointmentId)")
    public ResponseEntity<ApiResponse<MedicalReportResponse>> getReportByAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportByAppointment(appointmentId)));
    }

    // GET /reports/patient/{patientId} — patient's all reports
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@accessControl.canViewPatientReports(#patientId)")
    public ResponseEntity<ApiResponse<List<MedicalReportResponse>>> getPatientReports(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportsByPatient(patientId)));
    }

    // GET /reports/doctor/{doctorId} — doctor's all reports
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("@accessControl.canAccessDoctor(#doctorId)")
    public ResponseEntity<ApiResponse<List<MedicalReportResponse>>> getDoctorReports(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportsByDoctor(doctorId)));
    }
}
