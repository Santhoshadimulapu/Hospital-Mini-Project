package com.hospital.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.DoctorRequest;
import com.hospital.dto.DoctorResponse;
import com.hospital.dto.DoctorSlotsUpdateRequest;
import com.hospital.dto.DoctorUpdateRequest;
import com.hospital.dto.PageResponse;
import com.hospital.entity.Doctor;
import com.hospital.entity.Hospital;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.HospitalRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final HospitalRepository hospitalRepository;

    public DoctorService(DoctorRepository doctorRepository, PasswordEncoder passwordEncoder,
                         HospitalRepository hospitalRepository) {
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.hospitalRepository = hospitalRepository;
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

        @Transactional(readOnly = true)
        public PageResponse<DoctorResponse> getDoctorsPaged(String search, Long hospitalId, Pageable pageable) {
        Page<Doctor> page = doctorRepository.searchPaged(search, hospitalId, pageable);
        List<DoctorResponse> items = page.getContent().stream()
            .map(this::mapToResponse)
            .toList();

        return PageResponse.of(
            items,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast());
        }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapToResponse(doctor);
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DoctorResponse createDoctor(DoctorRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Hospital hospital = null;
        if (request.getHospitalId() != null) {
            hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + request.getHospitalId()));
        }

        Integer consultationTime = request.getConsultationTime();

        Doctor doctor = Doctor.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .specialization(request.getSpecialization())
                .availableDays(request.getAvailableDays())
            .consultationTime(consultationTime != null ? consultationTime : 15)
                .hospital(hospital)
                .build();

        doctorRepository.save(doctor);
        return mapToResponse(doctor);
    }

    public DoctorResponse updateSlots(Long doctorId, DoctorSlotsUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (request.getAvailableDays() != null) {
            doctor.setAvailableDays(request.getAvailableDays());
        }
        if (request.getConsultationTime() != null) {
            doctor.setConsultationTime(request.getConsultationTime());
        }

        doctorRepository.save(doctor);
        return mapToResponse(doctor);
    }

    public DoctorResponse updateDoctor(Long doctorId, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (!doctor.getEmail().equalsIgnoreCase(request.getEmail())
                && doctorRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Hospital hospital = null;
        if (request.getHospitalId() != null) {
            hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + request.getHospitalId()));
        }

        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setAvailableDays(request.getAvailableDays());
        Integer consultationTime = request.getConsultationTime();
        doctor.setConsultationTime(consultationTime != null ? consultationTime : 15);
        doctor.setHospital(hospital);

        doctorRepository.save(doctor);
        return mapToResponse(doctor);
    }

    public void deleteDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        try {
            doctorRepository.delete(doctor);
            doctorRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Cannot delete doctor with linked appointments or reports");
        }
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .email(doctor.getEmail())
                .specialization(doctor.getSpecialization())
                .availableDays(doctor.getAvailableDays())
                .consultationTime(doctor.getConsultationTime())
                .hospitalId(doctor.getHospital() != null ? doctor.getHospital().getId() : null)
                .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsByHospital(Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
