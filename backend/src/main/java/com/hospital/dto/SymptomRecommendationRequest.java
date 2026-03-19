package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;

public class SymptomRecommendationRequest {

    @NotBlank(message = "Symptoms are required")
    private String symptoms;

    private String city;

    public SymptomRecommendationRequest() {}

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
