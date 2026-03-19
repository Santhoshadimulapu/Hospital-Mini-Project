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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.HospitalRequest;
import com.hospital.dto.HospitalResponse;
import com.hospital.service.HospitalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    // GET /hospitals
    @GetMapping
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getAllHospitals() {
        return ResponseEntity.ok(ApiResponse.success(hospitalService.getAllHospitals()));
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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hospital created successfully", response));
    }
}
