package com.hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

    @EntityGraph(attributePaths = "hospital")
    @Query("SELECT d FROM Doctor d LEFT JOIN d.hospital h " +
           "WHERE (:search IS NULL OR :search = '' " +
           "OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(d.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:hospitalId IS NULL OR h.id = :hospitalId)")
    Page<Doctor> searchPaged(String search, Long hospitalId, Pageable pageable);

    long countByHospitalId(Long hospitalId);
}
