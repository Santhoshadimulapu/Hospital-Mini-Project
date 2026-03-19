package com.hospital.dto;

public class DoctorSlotsUpdateRequest {
    private String availableDays;
    private Integer consultationTime;

    public DoctorSlotsUpdateRequest() {}

    public DoctorSlotsUpdateRequest(String availableDays, Integer consultationTime) {
        this.availableDays = availableDays;
        this.consultationTime = consultationTime;
    }

    public String getAvailableDays() { return availableDays; }
    public void setAvailableDays(String availableDays) { this.availableDays = availableDays; }
    public Integer getConsultationTime() { return consultationTime; }
    public void setConsultationTime(Integer consultationTime) { this.consultationTime = consultationTime; }
}
