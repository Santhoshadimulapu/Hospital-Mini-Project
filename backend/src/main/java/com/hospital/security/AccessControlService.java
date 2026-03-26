package com.hospital.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.MedicalReportRepository;

@Component("accessControl")
public class AccessControlService {

    private final AppointmentRepository appointmentRepository;
    private final MedicalReportRepository medicalReportRepository;

    public AccessControlService(AppointmentRepository appointmentRepository,
                                MedicalReportRepository medicalReportRepository) {
        this.appointmentRepository = appointmentRepository;
        this.medicalReportRepository = medicalReportRepository;
    }

    public boolean canAccessPatient(Long patientId) {
        if (isAdmin()) {
            return true;
        }
        return currentUser()
                .filter(u -> "PATIENT".equalsIgnoreCase(u.getRole()))
                .map(u -> u.getUserId().equals(patientId))
                .orElse(false);
    }

    public boolean canAccessDoctor(Long doctorId) {
        if (isAdmin()) {
            return true;
        }
        return currentUser()
                .filter(u -> "DOCTOR".equalsIgnoreCase(u.getRole()))
                .map(u -> u.getUserId().equals(doctorId))
                .orElse(false);
    }

    public boolean canAccessAppointment(Long appointmentId) {
        if (isAdmin()) {
            return true;
        }

        Optional<AuthenticatedUser> currentUser = currentUser();
        if (currentUser.isEmpty()) {
            return false;
        }

        AuthenticatedUser user = currentUser.get();
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            return appointmentRepository.existsByIdAndPatientId(appointmentId, user.getUserId());
        }
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            return appointmentRepository.existsByIdAndDoctorId(appointmentId, user.getUserId());
        }

        return false;
    }

    public boolean canUpdateAppointmentStatus(Long appointmentId) {
        if (isAdmin()) {
            return true;
        }

        return currentUser()
                .filter(u -> "DOCTOR".equalsIgnoreCase(u.getRole()))
                .flatMap(u -> appointmentRepository.findById(appointmentId)
                        .map(a -> a.getDoctor().getId().equals(u.getUserId())))
                .orElse(false);
    }

    public boolean canManageDoctorQueue(Long doctorId) {
        return isAdmin() || canAccessDoctor(doctorId);
    }

    public boolean canManageAppointmentQueue(Long appointmentId) {
        return canUpdateAppointmentStatus(appointmentId);
    }

    public boolean canAccessReport(Long reportId) {
        if (isAdmin()) {
            return true;
        }

        Optional<AuthenticatedUser> currentUser = currentUser();
        if (currentUser.isEmpty()) {
            return false;
        }

        AuthenticatedUser user = currentUser.get();
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            return medicalReportRepository.existsByIdAndPatientId(reportId, user.getUserId());
        }
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            return medicalReportRepository.existsByIdAndDoctorId(reportId, user.getUserId());
        }

        return false;
    }

    public boolean canViewPatientReports(Long patientId) {
        if (isAdmin()) {
            return true;
        }

        Optional<AuthenticatedUser> currentUser = currentUser();
        if (currentUser.isEmpty()) {
            return false;
        }

        AuthenticatedUser user = currentUser.get();
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            return user.getUserId().equals(patientId);
        }

        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            return !medicalReportRepository.findByPatientIdAndDoctorId(patientId, user.getUserId()).isEmpty();
        }

        return false;
    }

    private boolean isAdmin() {
        return currentUser()
                .map(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                .orElse(false);
    }

    private Optional<AuthenticatedUser> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }

        return Optional.empty();
    }
}