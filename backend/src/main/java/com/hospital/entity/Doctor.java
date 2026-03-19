package com.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "available_days")
    private String availableDays;

    @Column(name = "consultation_time")
    private Integer consultationTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    public Doctor() {}

    public Doctor(Long id, String name, String email, String password, String specialization, String availableDays, Integer consultationTime, Hospital hospital) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.specialization = specialization;
        this.availableDays = availableDays;
        this.consultationTime = consultationTime;
        this.hospital = hospital;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getAvailableDays() { return availableDays; }
    public void setAvailableDays(String availableDays) { this.availableDays = availableDays; }
    public Integer getConsultationTime() { return consultationTime; }
    public void setConsultationTime(Integer consultationTime) { this.consultationTime = consultationTime; }
    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }

    public static DoctorBuilder builder() { return new DoctorBuilder(); }

    public static class DoctorBuilder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private String specialization;
        private String availableDays;
        private Integer consultationTime;
        private Hospital hospital;

        public DoctorBuilder id(Long id) { this.id = id; return this; }
        public DoctorBuilder name(String name) { this.name = name; return this; }
        public DoctorBuilder email(String email) { this.email = email; return this; }
        public DoctorBuilder password(String password) { this.password = password; return this; }
        public DoctorBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public DoctorBuilder availableDays(String availableDays) { this.availableDays = availableDays; return this; }
        public DoctorBuilder consultationTime(Integer consultationTime) { this.consultationTime = consultationTime; return this; }
        public DoctorBuilder hospital(Hospital hospital) { this.hospital = hospital; return this; }

        public Doctor build() {
            return new Doctor(id, name, email, password, specialization, availableDays, consultationTime, hospital);
        }
    }
}
