package com.hospital.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.PasswordChangeRequest;
import com.hospital.dto.PatientProfileUpdateRequest;
import com.hospital.dto.PatientRegisterRequest;
import com.hospital.dto.PatientResponse;
import com.hospital.dto.SecurityUpdateRequest;
import com.hospital.entity.Patient;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.QueueRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueRepository queueRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsNotificationService smsNotificationService;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          QueueRepository queueRepository,
                          PasswordEncoder passwordEncoder,
                          SmsNotificationService smsNotificationService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.queueRepository = queueRepository;
        this.passwordEncoder = passwordEncoder;
        this.smsNotificationService = smsNotificationService;
    }

    public PatientResponse register(PatientRegisterRequest request) {
        String normalizedPhone = normalizeIndianPhone(request.getPhone());

        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (patientRepository.existsByPhone(normalizedPhone)) {
            throw new BadRequestException("Phone number already registered");
        }

        Patient patient = Patient.builder()
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .phone(normalizedPhone)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        patientRepository.save(patient);
        smsNotificationService.sendRegistrationConfirmation(patient);
        return mapToResponse(patient);
    }

    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToResponse(patient);
    }

    public PatientResponse updateProfile(Long id, PatientProfileUpdateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        patient.setName(request.getName());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setCity(request.getCity());
        patient.setState(request.getState());
        patient.setZipCode(request.getZipCode());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(normalizeOptionalIndianPhone(request.getEmergencyContactPhone()));
        patient.setAllergies(request.getAllergies());
        patient.setChronicConditions(request.getChronicConditions());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setOccupation(request.getOccupation());
        patient.setMaritalStatus(request.getMaritalStatus());

        patientRepository.save(patient);
        return mapToResponse(patient);
    }

    public PatientResponse updateSecurity(Long id, SecurityUpdateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        String normalizedPhone = normalizeIndianPhone(request.getPhone());

        // Check if email is being changed and already exists
        if (!patient.getEmail().equals(request.getEmail()) && 
            patientRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        // Check if phone is being changed and already exists
        if (!patient.getPhone().equals(normalizedPhone) && 
            patientRepository.existsByPhone(normalizedPhone)) {
            throw new BadRequestException("Phone number already in use");
        }

        patient.setPhone(normalizedPhone);
        patient.setEmail(request.getEmail());

        patientRepository.save(patient);
        return mapToResponse(patient);
    }

    public void changePassword(Long id, PasswordChangeRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), patient.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        patient.setPassword(passwordEncoder.encode(request.getNewPassword()));
        patientRepository.save(patient);
    }

    @Transactional
    public void deleteAccount(Long id, String reason) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Delete queue entries for patient's appointments
        var appointments = appointmentRepository.findByPatientId(id);
        for (var appointment : appointments) {
            queueRepository.findByAppointmentId(appointment.getId())
                    .ifPresent(queueRepository::delete);
        }

        // Delete all appointments
        appointmentRepository.deleteAll(appointments);

        // Delete the patient
        patientRepository.delete(patient);
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .age(patient.getAge())
                .gender(patient.getGender())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .city(patient.getCity())
                .state(patient.getState())
                .zipCode(patient.getZipCode())
                .bloodGroup(patient.getBloodGroup())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .allergies(patient.getAllergies())
                .chronicConditions(patient.getChronicConditions())
                .currentMedications(patient.getCurrentMedications())
                .occupation(patient.getOccupation())
                .maritalStatus(patient.getMaritalStatus())
                .createdAt(patient.getCreatedAt() != null ? patient.getCreatedAt().toString() : null)
                .build();
    }

    private String normalizeIndianPhone(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            throw new BadRequestException("Phone number is required");
        }

        String digitsOnly = rawPhone.replaceAll("\\D", "");

        if (digitsOnly.length() == 10 && digitsOnly.matches("^[6-9]\\d{9}$")) {
            return "+91" + digitsOnly;
        }

        if (digitsOnly.length() == 11 && digitsOnly.startsWith("0")
                && digitsOnly.substring(1).matches("^[6-9]\\d{9}$")) {
            return "+91" + digitsOnly.substring(1);
        }

        if (digitsOnly.length() == 12 && digitsOnly.startsWith("91")
                && digitsOnly.substring(2).matches("^[6-9]\\d{9}$")) {
            return "+" + digitsOnly;
        }

        throw new BadRequestException("Invalid phone number format");
    }

    private String normalizeOptionalIndianPhone(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }
        return normalizeIndianPhone(rawPhone);
    }
}
