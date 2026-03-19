package com.hospital.dto;

public class QueueResponse {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String doctorName;
    private Integer queueNumber;
    private Integer priorityLevel;
    private Integer estimatedTime;
    private String status;

    public QueueResponse() {}

    public QueueResponse(Long id, Long appointmentId, Long patientId, String patientName, String doctorName, Integer queueNumber, Integer priorityLevel, Integer estimatedTime, String status) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorName = doctorName;
        this.queueNumber = queueNumber;
        this.priorityLevel = priorityLevel;
        this.estimatedTime = estimatedTime;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public Integer getQueueNumber() { return queueNumber; }
    public void setQueueNumber(Integer queueNumber) { this.queueNumber = queueNumber; }
    public Integer getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }
    public Integer getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static QueueResponseBuilder builder() { return new QueueResponseBuilder(); }

    public static class QueueResponseBuilder {
        private Long id;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private String doctorName;
        private Integer queueNumber;
        private Integer priorityLevel;
        private Integer estimatedTime;
        private String status;

        public QueueResponseBuilder id(Long id) { this.id = id; return this; }
        public QueueResponseBuilder appointmentId(Long appointmentId) { this.appointmentId = appointmentId; return this; }
        public QueueResponseBuilder patientId(Long patientId) { this.patientId = patientId; return this; }
        public QueueResponseBuilder patientName(String patientName) { this.patientName = patientName; return this; }
        public QueueResponseBuilder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public QueueResponseBuilder queueNumber(Integer queueNumber) { this.queueNumber = queueNumber; return this; }
        public QueueResponseBuilder priorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; return this; }
        public QueueResponseBuilder estimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; return this; }
        public QueueResponseBuilder status(String status) { this.status = status; return this; }

        public QueueResponse build() {
            return new QueueResponse(id, appointmentId, patientId, patientName, doctorName, queueNumber, priorityLevel, estimatedTime, status);
        }
    }
}
