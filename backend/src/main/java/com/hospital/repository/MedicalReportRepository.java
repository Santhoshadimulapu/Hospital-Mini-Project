package com.hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.entity.MedicalReport;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {

    Optional<MedicalReport> findByAppointmentId(Long appointmentId);

    List<MedicalReport> findByPatientId(Long patientId);

    List<MedicalReport> findByDoctorId(Long doctorId);

    List<MedicalReport> findByPatientIdAndDoctorId(Long patientId, Long doctorId);

    boolean existsByAppointmentId(Long appointmentId);

    boolean existsByIdAndPatientId(Long id, Long patientId);

    boolean existsByIdAndDoctorId(Long id, Long doctorId);
}
