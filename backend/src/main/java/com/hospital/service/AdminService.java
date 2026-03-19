package com.hospital.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.DashboardStats;
import com.hospital.entity.Appointment;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;

@Service
public class AdminService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueueService queueService;

    public AdminService(AppointmentRepository appointmentRepository, PatientRepository patientRepository, DoctorRepository doctorRepository, QueueService queueService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.queueService = queueService;
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new com.hospital.exception.ResourceNotFoundException(
                        "Appointment not found with id: " + id));
        appointment.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(appointment);
        queueService.removeQueueEntry(id);
    }

    public DashboardStats getStatistics() {
        LocalDate today = LocalDate.now();

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();

        List<Appointment> allToday = appointmentRepository.findByAppointmentDate(today);

        long todayCount = allToday.size();
        long completedToday = allToday.stream()
                .filter(a -> a.getStatus() == Appointment.Status.COMPLETED).count();
        long cancelledToday = allToday.stream()
                .filter(a -> a.getStatus() == Appointment.Status.CANCELLED).count();
        long waitingToday = allToday.stream()
                .filter(a -> a.getStatus() == Appointment.Status.WAITING
                        || a.getStatus() == Appointment.Status.BOOKED).count();

        return DashboardStats.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalAppointments(totalAppointments)
                .todayAppointments(todayCount)
                .completedToday(completedToday)
                .cancelledToday(cancelledToday)
                .waitingToday(waitingToday)
                .build();
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .specialization(appointment.getDoctor().getSpecialization())
                .appointmentDate(appointment.getAppointmentDate().toString())
                .slotTime(appointment.getSlotTime().toString())
                .status(appointment.getStatus().name())
                .hospitalId(appointment.getDoctor().getHospital() != null ? appointment.getDoctor().getHospital().getId() : null)
                .hospitalName(appointment.getDoctor().getHospital() != null ? appointment.getDoctor().getHospital().getName() : null)
                .build();
    }
}
