package com.hospital.dto;

public class WaitTimeResponse {
    private Long appointmentId;
    private Integer queueNumber;
    private Integer patientsAhead;
    private Integer estimatedWaitMinutes;
    private Integer avgConsultationTime;

    public WaitTimeResponse() {}

    public WaitTimeResponse(Long appointmentId, Integer queueNumber, Integer patientsAhead, Integer estimatedWaitMinutes, Integer avgConsultationTime) {
        this.appointmentId = appointmentId;
        this.queueNumber = queueNumber;
        this.patientsAhead = patientsAhead;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.avgConsultationTime = avgConsultationTime;
    }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public Integer getQueueNumber() { return queueNumber; }
    public void setQueueNumber(Integer queueNumber) { this.queueNumber = queueNumber; }
    public Integer getPatientsAhead() { return patientsAhead; }
    public void setPatientsAhead(Integer patientsAhead) { this.patientsAhead = patientsAhead; }
    public Integer getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }
    public Integer getAvgConsultationTime() { return avgConsultationTime; }
    public void setAvgConsultationTime(Integer avgConsultationTime) { this.avgConsultationTime = avgConsultationTime; }

    public static WaitTimeResponseBuilder builder() { return new WaitTimeResponseBuilder(); }

    public static class WaitTimeResponseBuilder {
        private Long appointmentId;
        private Integer queueNumber;
        private Integer patientsAhead;
        private Integer estimatedWaitMinutes;
        private Integer avgConsultationTime;

        public WaitTimeResponseBuilder appointmentId(Long appointmentId) { this.appointmentId = appointmentId; return this; }
        public WaitTimeResponseBuilder queueNumber(Integer queueNumber) { this.queueNumber = queueNumber; return this; }
        public WaitTimeResponseBuilder patientsAhead(Integer patientsAhead) { this.patientsAhead = patientsAhead; return this; }
        public WaitTimeResponseBuilder estimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; return this; }
        public WaitTimeResponseBuilder avgConsultationTime(Integer avgConsultationTime) { this.avgConsultationTime = avgConsultationTime; return this; }

        public WaitTimeResponse build() {
            return new WaitTimeResponse(appointmentId, queueNumber, patientsAhead, estimatedWaitMinutes, avgConsultationTime);
        }
    }
}
