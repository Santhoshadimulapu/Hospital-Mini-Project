package com.hospital.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.hospital.dto.HospitalRequest;
import com.hospital.dto.HospitalResponse;
import com.hospital.dto.PageResponse;
import com.hospital.entity.Hospital;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.HospitalRepository;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;

    public HospitalService(HospitalRepository hospitalRepository, DoctorRepository doctorRepository) {
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

        public PageResponse<HospitalResponse> getHospitalsPaged(String search, String city, Pageable pageable) {
        Page<Hospital> page = hospitalRepository.searchPaged(search, city, pageable);
        List<HospitalResponse> items = page.getContent().stream()
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

    public HospitalResponse getHospitalById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
        return mapToResponse(hospital);
    }

    public List<HospitalResponse> getHospitalsByCity(String city) {
        return hospitalRepository.findByCityIgnoreCase(city).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<HospitalResponse> searchHospitals(String query, String city) {
        List<Hospital> results;
        if (city != null && !city.isBlank()) {
            results = hospitalRepository.searchInCity(city, query);
        } else {
            results = hospitalRepository.search(query);
        }
        return results.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public HospitalResponse createHospital(HospitalRequest request) {
        Hospital hospital = new Hospital();
        hospital.setName(request.getName());
        hospital.setCity(request.getCity());
        hospital.setAddress(request.getAddress());
        hospital.setPhone(request.getPhone());
        hospital.setSpecialties(request.getSpecialties());
        hospital.setImageUrl(request.getImageUrl());
        hospital.setRating(request.getRating());

        hospitalRepository.save(hospital);
        return mapToResponse(hospital);
    }

    public HospitalResponse updateHospital(Long id, HospitalRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));

        hospital.setName(request.getName());
        hospital.setCity(request.getCity());
        hospital.setAddress(request.getAddress());
        hospital.setPhone(request.getPhone());
        hospital.setSpecialties(request.getSpecialties());
        hospital.setImageUrl(request.getImageUrl());
        hospital.setRating(request.getRating());

        hospitalRepository.save(hospital);
        return mapToResponse(hospital);
    }

    public void deleteHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
        try {
            hospitalRepository.delete(hospital);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Cannot delete hospital with linked doctors or appointments");
        }
    }

    private HospitalResponse mapToResponse(Hospital hospital) {
        long doctorCount = doctorRepository.countByHospitalId(hospital.getId());
        HospitalResponse response = new HospitalResponse();
        response.setId(hospital.getId());
        response.setName(hospital.getName());
        response.setCity(hospital.getCity());
        response.setAddress(hospital.getAddress());
        response.setPhone(hospital.getPhone());
        response.setSpecialties(hospital.getSpecialties());
        response.setImageUrl(hospital.getImageUrl());
        response.setRating(hospital.getRating());
        response.setDoctorCount(doctorCount);
        return response;
    }
}
