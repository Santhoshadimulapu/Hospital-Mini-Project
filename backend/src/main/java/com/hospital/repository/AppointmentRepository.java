package com.hospital.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    boolean existsByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
            Long doctorId, LocalDate date, LocalTime slotTime, Appointment.Status status);

    long countByDoctorIdAndAppointmentDateAndStatusNot(
            Long doctorId, LocalDate date, Appointment.Status status);

    List<Appointment> findByAppointmentDate(LocalDate date);

        boolean existsByIdAndPatientId(Long id, Long patientId);

        boolean existsByIdAndDoctorId(Long id, Long doctorId);
}
