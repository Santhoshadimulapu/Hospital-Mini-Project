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
import com.hospital.dto.HospitalRequest;
import com.hospital.dto.HospitalResponse;
import com.hospital.dto.PageResponse;
import com.hospital.service.AuditLogService;
import com.hospital.service.HospitalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final AuditLogService auditLogService;

    public HospitalController(HospitalService hospitalService, AuditLogService auditLogService) {
        this.hospitalService = hospitalService;
        this.auditLogService = auditLogService;
    }

    // GET /hospitals
    @GetMapping
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getAllHospitals() {
        return ResponseEntity.ok(ApiResponse.success(hospitalService.getAllHospitals()));
    }

    // GET /hospitals/paged
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PageResponse<HospitalResponse>>> getHospitalsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 50);

        Set<String> allowedSorts = Set.of("name", "city", "rating", "id");
        String safeSortBy = allowedSorts.contains(sortBy) ? sortBy : "name";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, Sort.by(direction, safeSortBy));

        return ResponseEntity.ok(ApiResponse.success(hospitalService.getHospitalsPaged(q, city, pageable)));
    }

    // GET /hospitals/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hospitalService.getHospitalById(id)));
    }

    // GET /hospitals/city/{city}
    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(ApiResponse.success(hospitalService.getHospitalsByCity(city)));
    }

    // GET /hospitals/search?q=...&city=...
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> search(
            @RequestParam String q,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.success(hospitalService.searchHospitals(q, city)));
    }

    // POST /hospitals (admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody HospitalRequest request) {
        HospitalResponse response = hospitalService.createHospital(request);
        auditLogService.logAction("HOSPITAL_CREATED", "HOSPITAL", response.getId(), "Hospital: " + response.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hospital created successfully", response));
    }

    // PUT /hospitals/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody HospitalRequest request) {
        HospitalResponse response = hospitalService.updateHospital(id, request);
        auditLogService.logAction("HOSPITAL_UPDATED", "HOSPITAL", id, "Hospital: " + response.getName());
        return ResponseEntity.ok(ApiResponse.success("Hospital updated successfully", response));
    }

    // DELETE /hospitals/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        auditLogService.logAction("HOSPITAL_DELETED", "HOSPITAL", id, "Hospital deleted by admin");
        return ResponseEntity.ok(ApiResponse.success("Hospital deleted successfully", null));
    }
}
