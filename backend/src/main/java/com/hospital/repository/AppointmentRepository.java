package com.hospital.repository;

import com.hospital.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    boolean existsByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
            Long doctorId, LocalDate date, LocalTime slotTime, Appointment.Status status);

    long countByDoctorIdAndAppointmentDateAndStatusNot(
            Long doctorId, LocalDate date, Appointment.Status status);

    List<Appointment> findByAppointmentDate(LocalDate date);
}
