package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;

public class AppointmentRescheduleRequest {

    @NotBlank(message = "Appointment date is required (yyyy-MM-dd)")
    private String appointmentDate;

    @NotBlank(message = "Slot time is required (HH:mm)")
    private String slotTime;

    private Long doctorId;

    private String reason;

    public String getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(String appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getSlotTime() {
        return slotTime;
    }

    public void setSlotTime(String slotTime) {
        this.slotTime = slotTime;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}