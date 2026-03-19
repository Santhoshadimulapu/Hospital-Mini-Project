package com.hospital.dto;

import java.util.List;

public class SymptomRecommendationResponse {

    private String symptoms;
    private String city;
    private boolean emergencyFlag;
    private String emergencyMessage;
    private String disclaimer;
    private List<SpecializationMatch> specializationMatches;
    private List<DoctorSuggestion> doctorSuggestions;
    private String aiProvider;
    private String aiReasoning;
    private String urgencyLevel;

    public SymptomRecommendationResponse() {}

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public boolean isEmergencyFlag() {
        return emergencyFlag;
    }

    public void setEmergencyFlag(boolean emergencyFlag) {
        this.emergencyFlag = emergencyFlag;
    }

    public String getEmergencyMessage() {
        return emergencyMessage;
    }

    public void setEmergencyMessage(String emergencyMessage) {
        this.emergencyMessage = emergencyMessage;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }

    public List<SpecializationMatch> getSpecializationMatches() {
        return specializationMatches;
    }

    public void setSpecializationMatches(List<SpecializationMatch> specializationMatches) {
        this.specializationMatches = specializationMatches;
    }

    public List<DoctorSuggestion> getDoctorSuggestions() {
        return doctorSuggestions;
    }

    public void setDoctorSuggestions(List<DoctorSuggestion> doctorSuggestions) {
        this.doctorSuggestions = doctorSuggestions;
    }

    public String getAiProvider() {
        return aiProvider;
    }

    public void setAiProvider(String aiProvider) {
        this.aiProvider = aiProvider;
    }

    public String getAiReasoning() {
        return aiReasoning;
    }

    public void setAiReasoning(String aiReasoning) {
        this.aiReasoning = aiReasoning;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public static class SpecializationMatch {
        private String specialization;
        private int score;

        public SpecializationMatch() {}

        public SpecializationMatch(String specialization, int score) {
            this.specialization = specialization;
            this.score = score;
        }

        public String getSpecialization() {
            return specialization;
        }

        public void setSpecialization(String specialization) {
            this.specialization = specialization;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }
    }

    public static class DoctorSuggestion {
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private Integer consultationTime;
        private Long hospitalId;
        private String hospitalName;
        private String hospitalCity;
        private int matchScore;

        public DoctorSuggestion() {}

        public Long getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(Long doctorId) {
            this.doctorId = doctorId;
        }

        public String getDoctorName() {
            return doctorName;
        }

        public void setDoctorName(String doctorName) {
            this.doctorName = doctorName;
        }

        public String getSpecialization() {
            return specialization;
        }

        public void setSpecialization(String specialization) {
            this.specialization = specialization;
        }

        public Integer getConsultationTime() {
            return consultationTime;
        }

        public void setConsultationTime(Integer consultationTime) {
            this.consultationTime = consultationTime;
        }

        public Long getHospitalId() {
            return hospitalId;
        }

        public void setHospitalId(Long hospitalId) {
            this.hospitalId = hospitalId;
        }

        public String getHospitalName() {
            return hospitalName;
        }

        public void setHospitalName(String hospitalName) {
            this.hospitalName = hospitalName;
        }

        public String getHospitalCity() {
            return hospitalCity;
        }

        public void setHospitalCity(String hospitalCity) {
            this.hospitalCity = hospitalCity;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(int matchScore) {
            this.matchScore = matchScore;
        }
    }
}