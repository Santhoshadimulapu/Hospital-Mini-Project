package com.hospital.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hospital.entity.Queue;

public interface QueueRepository extends JpaRepository<Queue, Long> {

    Optional<Queue> findByAppointmentId(Long appointmentId);

    @Query("SELECT q FROM Queue q WHERE q.appointment.doctor.id = :doctorId " +
           "AND q.appointment.appointmentDate = :date " +
           "AND q.appointment.status IN ('BOOKED', 'WAITING') " +
           "ORDER BY q.priorityLevel DESC, q.queueNumber ASC")
    List<Queue> findByDoctorAndDateOrdered(Long doctorId, LocalDate date);

    @Query("SELECT COALESCE(MAX(q.queueNumber), 0) FROM Queue q " +
           "WHERE q.appointment.doctor.id = :doctorId " +
           "AND q.appointment.appointmentDate = :date " +
           "AND q.appointment.status IN ('BOOKED', 'WAITING')")
    Integer findMaxQueueNumberForDoctorOnDate(Long doctorId, LocalDate date);

    @Query("SELECT COUNT(q) FROM Queue q " +
           "WHERE q.appointment.doctor.id = :doctorId " +
           "AND q.appointment.appointmentDate = :date " +
           "AND q.queueNumber < :currentQueueNumber " +
           "AND q.appointment.status NOT IN ('COMPLETED', 'CANCELLED')")
    long countPatientsAhead(Long doctorId, LocalDate date, Integer currentQueueNumber);

    void deleteByAppointmentId(Long appointmentId);
}
