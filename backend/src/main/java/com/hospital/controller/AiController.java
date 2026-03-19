package com.hospital.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.SymptomRecommendationRequest;
import com.hospital.dto.SymptomRecommendationResponse;
import com.hospital.service.SymptomRecommendationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final SymptomRecommendationService symptomRecommendationService;

    public AiController(SymptomRecommendationService symptomRecommendationService) {
        this.symptomRecommendationService = symptomRecommendationService;
    }

    @PostMapping("/recommend-doctors")
    public ResponseEntity<ApiResponse<SymptomRecommendationResponse>> recommendDoctors(
            @Valid @RequestBody SymptomRecommendationRequest request) {
        SymptomRecommendationResponse response = symptomRecommendationService.recommendDoctors(request);
        return ResponseEntity.ok(ApiResponse.success("Recommendations generated", response));
    }
}
