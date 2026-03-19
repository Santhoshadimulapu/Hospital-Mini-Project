package com.hospital.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hospital.entity.Hospital;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    List<Hospital> findByCityIgnoreCase(String city);

    @Query("SELECT h FROM Hospital h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Hospital> search(String query);

    @Query("SELECT h FROM Hospital h WHERE LOWER(h.city) = LOWER(:city) " +
           "AND (LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Hospital> searchInCity(String city, String query);
}
