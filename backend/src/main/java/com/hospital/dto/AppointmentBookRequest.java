package com.hospital.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppointmentBookRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotBlank(message = "Appointment date is required (yyyy-MM-dd)")
    private String appointmentDate;

    @NotBlank(message = "Slot time is required (HH:mm)")
    private String slotTime;

    @Min(value = 0, message = "Priority level must be 0 (Normal), 1 (Elderly), or 2 (Emergency)")
    @Max(value = 2, message = "Priority level must be 0 (Normal), 1 (Elderly), or 2 (Emergency)")
    private Integer priorityLevel;

    public AppointmentBookRequest() {}

    public AppointmentBookRequest(Long patientId, Long doctorId, String appointmentDate, String slotTime, Integer priorityLevel) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentDate = appointmentDate;
        this.slotTime = slotTime;
        this.priorityLevel = priorityLevel;
    }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }
    public Integer getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }
}
