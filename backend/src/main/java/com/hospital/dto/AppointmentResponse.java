package com.hospital.dto;

public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private String appointmentDate;
    private String slotTime;
    private String status;
    private String cancellationReason;
    private boolean hasReport;
    private Long hospitalId;
    private String hospitalName;

    public AppointmentResponse() {}

    public AppointmentResponse(Long id, Long patientId, String patientName, Long doctorId, String doctorName, String specialization, String appointmentDate, String slotTime, String status, String cancellationReason, boolean hasReport, Long hospitalId, String hospitalName) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.appointmentDate = appointmentDate;
        this.slotTime = slotTime;
        this.status = status;
        this.cancellationReason = cancellationReason;
        this.hasReport = hasReport;
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public boolean isHasReport() { return hasReport; }
    public void setHasReport(boolean hasReport) { this.hasReport = hasReport; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public static AppointmentResponseBuilder builder() { return new AppointmentResponseBuilder(); }

    public static class AppointmentResponseBuilder {
        private Long id;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private String appointmentDate;
        private String slotTime;
        private String status;
        private String cancellationReason;
        private boolean hasReport;
        private Long hospitalId;
        private String hospitalName;

        public AppointmentResponseBuilder id(Long id) { this.id = id; return this; }
        public AppointmentResponseBuilder patientId(Long patientId) { this.patientId = patientId; return this; }
        public AppointmentResponseBuilder patientName(String patientName) { this.patientName = patientName; return this; }
        public AppointmentResponseBuilder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public AppointmentResponseBuilder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public AppointmentResponseBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public AppointmentResponseBuilder appointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; return this; }
        public AppointmentResponseBuilder slotTime(String slotTime) { this.slotTime = slotTime; return this; }
        public AppointmentResponseBuilder status(String status) { this.status = status; return this; }
        public AppointmentResponseBuilder cancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; return this; }
        public AppointmentResponseBuilder hasReport(boolean hasReport) { this.hasReport = hasReport; return this; }
        public AppointmentResponseBuilder hospitalId(Long hospitalId) { this.hospitalId = hospitalId; return this; }
        public AppointmentResponseBuilder hospitalName(String hospitalName) { this.hospitalName = hospitalName; return this; }

        public AppointmentResponse build() {
            return new AppointmentResponse(id, patientId, patientName, doctorId, doctorName, specialization, appointmentDate, slotTime, status, cancellationReason, hasReport, hospitalId, hospitalName);
        }
    }
}
