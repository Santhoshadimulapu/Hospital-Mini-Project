package com.hospital.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "appointments", uniqueConstraints = {
    @UniqueConstraint(
        name = "uk_doctor_date_time",
        columnNames = {"doctor_id", "appointment_date", "slot_time"}
    )
})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "slot_time", nullable = false)
    private LocalTime slotTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "last_rescheduled_at")
    private LocalDateTime lastRescheduledAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = Status.BOOKED;
        }
    }

    public enum Status {
        BOOKED, WAITING, COMPLETED, CANCELLED
    }

    public Appointment() {}

    public Appointment(Long id, Patient patient, Doctor doctor, LocalDate appointmentDate, LocalTime slotTime, Status status) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.slotTime = slotTime;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public LocalTime getSlotTime() { return slotTime; }
    public void setSlotTime(LocalTime slotTime) { this.slotTime = slotTime; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public LocalDateTime getLastRescheduledAt() { return lastRescheduledAt; }
    public void setLastRescheduledAt(LocalDateTime lastRescheduledAt) { this.lastRescheduledAt = lastRescheduledAt; }

    public static AppointmentBuilder builder() { return new AppointmentBuilder(); }

    public static class AppointmentBuilder {
        private Long id;
        private Patient patient;
        private Doctor doctor;
        private LocalDate appointmentDate;
        private LocalTime slotTime;
        private Status status;

        public AppointmentBuilder id(Long id) { this.id = id; return this; }
        public AppointmentBuilder patient(Patient patient) { this.patient = patient; return this; }
        public AppointmentBuilder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public AppointmentBuilder appointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; return this; }
        public AppointmentBuilder slotTime(LocalTime slotTime) { this.slotTime = slotTime; return this; }
        public AppointmentBuilder status(Status status) { this.status = status; return this; }

        public Appointment build() {
            return new Appointment(id, patient, doctor, appointmentDate, slotTime, status);
        }
    }
}
