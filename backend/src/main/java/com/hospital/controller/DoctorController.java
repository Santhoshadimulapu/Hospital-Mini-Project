package com.hospital.controller;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.DoctorRequest;
import com.hospital.dto.DoctorResponse;
import com.hospital.dto.DoctorSlotsUpdateRequest;
import com.hospital.dto.DoctorUpdateRequest;
import com.hospital.dto.PageResponse;
import com.hospital.service.AuditLogService;
import com.hospital.service.DoctorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final AuditLogService auditLogService;

    public DoctorController(DoctorService doctorService, AuditLogService auditLogService) {
        this.doctorService = doctorService;
        this.auditLogService = auditLogService;
    }

    // GET /doctors
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }

    // GET /doctors/paged
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PageResponse<DoctorResponse>>> getDoctorsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 50);

        Set<String> allowedSorts = Set.of("name", "email", "specialization", "consultationTime", "id");
        String safeSortBy = allowedSorts.contains(sortBy) ? sortBy : "name";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, Sort.by(direction, safeSortBy));

        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsPaged(q, hospitalId, pageable)));
    }

    // GET /doctors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    // GET /doctors/specialization/{specialization}
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getBySpecialization(
            @PathVariable String specialization) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialization(specialization)));
    }

    // GET /doctors/hospital/{hospitalId}
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getByHospital(
            @PathVariable Long hospitalId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsByHospital(hospitalId)));
    }

    // POST /doctors
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody DoctorRequest request) {
        DoctorResponse response = doctorService.createDoctor(request);
        auditLogService.logAction("DOCTOR_CREATED", "DOCTOR", response.getId(), "Doctor: " + response.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor created successfully", response));
    }

    // PUT /doctors/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorUpdateRequest request) {
        DoctorResponse response = doctorService.updateDoctor(id, request);
        auditLogService.logAction("DOCTOR_UPDATED", "DOCTOR", id, "Doctor: " + response.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", response));
    }

    // DELETE /doctors/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        auditLogService.logAction("DOCTOR_DELETED", "DOCTOR", id, "Doctor deleted by admin");
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", null));
    }

    // PUT /doctors/slots/{id}
    @PutMapping("/slots/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateSlots(
            @PathVariable Long id,
            @RequestBody DoctorSlotsUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Slots updated", doctorService.updateSlots(id, request)));
    }
}
