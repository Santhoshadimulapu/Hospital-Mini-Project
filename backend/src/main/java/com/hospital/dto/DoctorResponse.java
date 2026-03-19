package com.hospital.dto;

public class DoctorResponse {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private String availableDays;
    private Integer consultationTime;
    private Long hospitalId;
    private String hospitalName;

    public DoctorResponse() {}

    public DoctorResponse(Long id, String name, String email, String specialization, String availableDays, Integer consultationTime, Long hospitalId, String hospitalName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.specialization = specialization;
        this.availableDays = availableDays;
        this.consultationTime = consultationTime;
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getAvailableDays() { return availableDays; }
    public void setAvailableDays(String availableDays) { this.availableDays = availableDays; }
    public Integer getConsultationTime() { return consultationTime; }
    public void setConsultationTime(Integer consultationTime) { this.consultationTime = consultationTime; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public static DoctorResponseBuilder builder() { return new DoctorResponseBuilder(); }

    public static class DoctorResponseBuilder {
        private Long id;
        private String name;
        private String email;
        private String specialization;
        private String availableDays;
        private Integer consultationTime;
        private Long hospitalId;
        private String hospitalName;

        public DoctorResponseBuilder id(Long id) { this.id = id; return this; }
        public DoctorResponseBuilder name(String name) { this.name = name; return this; }
        public DoctorResponseBuilder email(String email) { this.email = email; return this; }
        public DoctorResponseBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public DoctorResponseBuilder availableDays(String availableDays) { this.availableDays = availableDays; return this; }
        public DoctorResponseBuilder consultationTime(Integer consultationTime) { this.consultationTime = consultationTime; return this; }
        public DoctorResponseBuilder hospitalId(Long hospitalId) { this.hospitalId = hospitalId; return this; }
        public DoctorResponseBuilder hospitalName(String hospitalName) { this.hospitalName = hospitalName; return this; }

        public DoctorResponse build() {
            return new DoctorResponse(id, name, email, specialization, availableDays, consultationTime, hospitalId, hospitalName);
        }
    }
}
