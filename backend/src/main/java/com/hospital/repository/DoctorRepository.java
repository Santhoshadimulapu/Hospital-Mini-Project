package com.hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Override
    @EntityGraph(attributePaths = "hospital")
    List<Doctor> findAll();

    @Override
    @EntityGraph(attributePaths = "hospital")
    Optional<Doctor> findById(Long id);

    @EntityGraph(attributePaths = "hospital")
    List<Doctor> findBySpecialization(String specialization);

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "hospital")
    List<Doctor> findByHospitalId(Long hospitalId);

    long countByHospitalId(Long hospitalId);
}
