package com.hospital.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.AppointmentBookRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.Appointment.Status;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.SlotConflictException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalReportRepository;
import com.hospital.repository.PatientRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueueService queueService;
    private final MedicalReportRepository medicalReportRepository;
    private final SmsNotificationService smsNotificationService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              QueueService queueService,
                              MedicalReportRepository medicalReportRepository,
                              SmsNotificationService smsNotificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.queueService = queueService;
        this.medicalReportRepository = medicalReportRepository;
        this.smsNotificationService = smsNotificationService;
    }

    /**
     * Book an appointment with FULL VALIDATION + TRANSACTION SAFETY.
     *
     * Validation steps:
     * 1. Patient exists
     * 2. Doctor exists
     * 3. Appointment date is NOT in the past
     * 4. Slot day belongs to doctor's available_days schedule
     * 5. SLOT CONFLICT DETECTION (concurrent-safe with pessimistic lock check)
     * 6. Create appointment + queue entry in single transaction → rollback if either fails
     */
    @Transactional
    public AppointmentResponse bookAppointment(AppointmentBookRequest request) {
        // 1. Validate patient
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        // 2. Validate doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        LocalDate date = LocalDate.parse(request.getAppointmentDate());
        LocalTime time = LocalTime.parse(request.getSlotTime());
        int consultationMinutes = doctor.getConsultationTime() != null && doctor.getConsultationTime() > 0
            ? doctor.getConsultationTime()
            : 30;
        LocalTime requestedEndTime = time.plusMinutes(consultationMinutes);

        // 3. Date must not be in the past
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        // 4. Check if doctor is available on that day of the week
        if (doctor.getAvailableDays() != null && !doctor.getAvailableDays().isBlank()) {
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase();
            List<String> availableDays = Arrays.stream(doctor.getAvailableDays().split(","))
                    .map(d -> d.trim().toUpperCase())
                    .collect(Collectors.toList());

            if (!availableDays.contains(dayName)) {
                throw new BadRequestException(
                        "Doctor " + doctor.getName() + " is not available on " + dayName +
                        ". Available days: " + doctor.getAvailableDays());
            }
        }

        // 5. SLOT CONFLICT DETECTION — prevents overlapping ranges for duration-based slots
        List<Appointment> dayAppointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctor.getId(), date);
        boolean conflict = dayAppointments.stream()
            .filter(a -> a.getStatus() != Status.CANCELLED)
            .anyMatch(a -> {
                LocalTime existingStart = a.getSlotTime();
                LocalTime existingEnd = existingStart.plusMinutes(consultationMinutes);
                return time.isBefore(existingEnd) && existingStart.isBefore(requestedEndTime);
            });

        if (conflict) {
            throw new SlotConflictException(
                "Doctor " + doctor.getName() + " already has an overlapping appointment on " + date +
                " between " + time + " and " + requestedEndTime +
                ". Please choose a different slot.");
        }

        // 6. Create appointment + queue in single transaction
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .slotTime(time)
                .status(Appointment.Status.BOOKED)
                .build();

        appointmentRepository.save(appointment);

        // Generate queue entry — if this fails, entire transaction rolls back
        int priority = (request.getPriorityLevel() != null) ? request.getPriorityLevel() : 0;
        queueService.createQueueEntry(appointment, priority);

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAppointmentsByDoctor(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
        }
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return mapToResponse(appointment);
    }

    /**
     * Cancel appointment + remove its queue entry in a single transaction.
     * The queue for remaining patients is automatically correct because
     * the queue queries filter out CANCELLED status appointments.
     */
    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }
        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(appointment);

        // Remove queue entry — remaining patients' wait times auto-recalculate
        // because countPatientsAhead excludes CANCELLED appointments
        queueService.removeQueueEntry(id);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        Appointment.Status newStatus = Appointment.Status.valueOf(status.toUpperCase());
        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);

        smsNotificationService.sendStatusUpdated(appointment, newStatus.name());
        queueService.notifyQueueUpdatesForDoctor(appointment.getDoctor().getId(), appointment.getAppointmentDate(),
            "Queue updated after appointment status change");

        return mapToResponse(appointment);
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
                .hasReport(medicalReportRepository.existsByAppointmentId(appointment.getId()))
                .hospitalId(appointment.getDoctor().getHospital() != null ? appointment.getDoctor().getHospital().getId() : null)
                .hospitalName(appointment.getDoctor().getHospital() != null ? appointment.getDoctor().getHospital().getName() : null)
                .build();
    }
}
