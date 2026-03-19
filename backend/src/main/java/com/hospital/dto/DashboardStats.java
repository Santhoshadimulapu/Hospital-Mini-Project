package com.hospital.dto;

public class DashboardStats {
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long todayAppointments;
    private long completedToday;
    private long cancelledToday;
    private long waitingToday;

    public DashboardStats() {}

    public DashboardStats(long totalPatients, long totalDoctors, long totalAppointments, long todayAppointments, long completedToday, long cancelledToday, long waitingToday) {
        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.totalAppointments = totalAppointments;
        this.todayAppointments = todayAppointments;
        this.completedToday = completedToday;
        this.cancelledToday = cancelledToday;
        this.waitingToday = waitingToday;
    }

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }
    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }
    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }
    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }
    public long getCompletedToday() { return completedToday; }
    public void setCompletedToday(long completedToday) { this.completedToday = completedToday; }
    public long getCancelledToday() { return cancelledToday; }
    public void setCancelledToday(long cancelledToday) { this.cancelledToday = cancelledToday; }
    public long getWaitingToday() { return waitingToday; }
    public void setWaitingToday(long waitingToday) { this.waitingToday = waitingToday; }

    public static DashboardStatsBuilder builder() { return new DashboardStatsBuilder(); }

    public static class DashboardStatsBuilder {
        private long totalPatients;
        private long totalDoctors;
        private long totalAppointments;
        private long todayAppointments;
        private long completedToday;
        private long cancelledToday;
        private long waitingToday;

        public DashboardStatsBuilder totalPatients(long totalPatients) { this.totalPatients = totalPatients; return this; }
        public DashboardStatsBuilder totalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; return this; }
        public DashboardStatsBuilder totalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; return this; }
        public DashboardStatsBuilder todayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; return this; }
        public DashboardStatsBuilder completedToday(long completedToday) { this.completedToday = completedToday; return this; }
        public DashboardStatsBuilder cancelledToday(long cancelledToday) { this.cancelledToday = cancelledToday; return this; }
        public DashboardStatsBuilder waitingToday(long waitingToday) { this.waitingToday = waitingToday; return this; }

        public DashboardStats build() {
            return new DashboardStats(totalPatients, totalDoctors, totalAppointments, todayAppointments, completedToday, cancelledToday, waitingToday);
        }
    }
}
