package com.hospital.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospital.dto.AuthResponse;
import com.hospital.dto.LoginRequest;
import com.hospital.entity.Admin;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.exception.BadRequestException;
import com.hospital.repository.AdminRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.security.JwtTokenProvider;

@Service
public class AuthService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(PatientRepository patientRepository, DoctorRepository doctorRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        String role = request.getRole().toUpperCase();

        switch (role) {
            case "PATIENT" -> {
                Patient patient = patientRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new BadRequestException("Invalid email or password"));
                if (!passwordEncoder.matches(request.getPassword(), patient.getPassword())) {
                    throw new BadRequestException("Invalid email or password");
                }
                String token = jwtTokenProvider.generateToken(patient.getEmail(), "PATIENT", patient.getId());
                return AuthResponse.builder()
                        .token(token).id(patient.getId()).name(patient.getName()).email(patient.getEmail()).role("PATIENT")
                        .build();
            }
            case "DOCTOR" -> {
                Doctor doctor = doctorRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new BadRequestException("Invalid email or password"));
                if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
                    throw new BadRequestException("Invalid email or password");
                }
                String token = jwtTokenProvider.generateToken(doctor.getEmail(), "DOCTOR", doctor.getId());
                return AuthResponse.builder()
                        .token(token).id(doctor.getId()).name(doctor.getName()).email(doctor.getEmail()).role("DOCTOR")
                        .build();
            }
            case "ADMIN" -> {
                Admin admin = adminRepository.findByUsername(request.getEmail())
                        .orElseThrow(() -> new BadRequestException("Invalid username or password"));
                if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                    throw new BadRequestException("Invalid username or password");
                }
                String token = jwtTokenProvider.generateToken(admin.getUsername(), "ADMIN", admin.getId());
                return AuthResponse.builder()
                        .token(token).id(admin.getId()).name(admin.getUsername()).email(admin.getUsername()).role("ADMIN")
                        .build();
            }
            default -> throw new BadRequestException("Invalid role. Must be PATIENT, DOCTOR, or ADMIN");
        }
    }
}
