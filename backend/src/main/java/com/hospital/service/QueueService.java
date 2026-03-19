package com.hospital.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.QueueResponse;
import com.hospital.dto.WaitTimeResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.Queue;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.QueueRepository;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final DoctorRepository doctorRepository;
        private final AppointmentRepository appointmentRepository;
        private final SmsNotificationService smsNotificationService;

        public QueueService(QueueRepository queueRepository,
                                                DoctorRepository doctorRepository,
                                                AppointmentRepository appointmentRepository,
                                                SmsNotificationService smsNotificationService) {
        this.queueRepository = queueRepository;
        this.doctorRepository = doctorRepository;
                this.appointmentRepository = appointmentRepository;
                this.smsNotificationService = smsNotificationService;
    }

    /**
     * Create a queue entry after booking.
     *
     * PRIORITY QUEUE LOGIC:
     * - priorityLevel 0 = Normal
     * - priorityLevel 1 = Elderly
     * - priorityLevel 2 = Emergency (highest priority)
     *
     * Higher priority patients get lower effective position in queue.
     * Queue is ordered by: priorityLevel DESC, queueNumber ASC
     */
    public void createQueueEntry(Appointment appointment, int priorityLevel) {
        Integer maxQueue = queueRepository.findMaxQueueNumberForDoctorOnDate(
                appointment.getDoctor().getId(), appointment.getAppointmentDate());

        int avgConsultation = appointment.getDoctor().getConsultationTime() != null
                ? appointment.getDoctor().getConsultationTime() : 15;

        int assignedQueueNumber = maxQueue + 1;
        int estimatedWait = maxQueue * avgConsultation;

        Queue queue = Queue.builder()
                .appointment(appointment)
                .queueNumber(assignedQueueNumber)
                .priorityLevel(priorityLevel)
                .estimatedTime(estimatedWait)
                .build();

        queueRepository.save(queue);
        smsNotificationService.sendBookingConfirmation(appointment, assignedQueueNumber, estimatedWait);
        notifyQueueUpdatesForDoctor(appointment.getDoctor().getId(), appointment.getAppointmentDate(),
                "Queue updated after booking");
    }

    /**
     * Get queue status for a specific doctor on a date.
     * Returns list ordered by priority (DESC) then queue number (ASC).
     *
     * Example queue:
     *   Queue 1 (priority 0 - Normal)
     *   Queue 2 (priority 2 - Emergency) ← appears first due to higher priority
     *   Queue 3 (priority 0 - Normal)
     */
    public List<QueueResponse> getQueueByDoctor(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
        }
                return getActiveQueueByDoctor(doctorId, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * WAIT TIME ESTIMATION
     *
     * Formula:
     *   wait_time = patients_ahead × avg_consultation_time
     *
     * Example:
     *   Doctor takes 10 min per patient
     *   You are queue #6, current patient is #3
     *   Wait = (6 - 3) × 10 = 30 minutes
     */
    public WaitTimeResponse getWaitTime(Long appointmentId) {
        Queue queue = queueRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found for appointment: " + appointmentId));

        Appointment appointment = queue.getAppointment();
        int avgConsultation = appointment.getDoctor().getConsultationTime() != null
                ? appointment.getDoctor().getConsultationTime() : 15;

        List<Queue> orderedQueue = getActiveQueueByDoctor(
                appointment.getDoctor().getId(), appointment.getAppointmentDate());

        int patientsAhead = 0;
        for (int i = 0; i < orderedQueue.size(); i++) {
            if (orderedQueue.get(i).getAppointment().getId().equals(appointmentId)) {
                patientsAhead = i;
                break;
            }
        }

        int estimatedWait = patientsAhead * avgConsultation;

        return WaitTimeResponse.builder()
                .appointmentId(appointmentId)
                .queueNumber(queue.getQueueNumber())
                .patientsAhead(patientsAhead)
                .estimatedWaitMinutes(estimatedWait)
                .avgConsultationTime(avgConsultation)
                .build();
    }

    /**
     * Remove queue entry when appointment is cancelled.
     * Wait times for remaining patients auto-recalculate because
     * countPatientsAhead filters out CANCELLED/COMPLETED statuses.
     */
    @Transactional
    public void removeQueueEntry(Long appointmentId) {
                Optional<Queue> queueOptional = queueRepository.findByAppointmentId(appointmentId);
                if (queueOptional.isEmpty()) {
                        return;
                }

                Queue queue = queueOptional.get();
                Appointment appointment = queue.getAppointment();

                queueRepository.delete(queue);
                smsNotificationService.sendAppointmentCancelled(appointment);
                notifyQueueUpdatesForDoctor(appointment.getDoctor().getId(), appointment.getAppointmentDate(),
                                "Queue updated after cancellation");
        }

        @Transactional
        public QueueResponse callNextPatient(Long doctorId, LocalDate date) {
                if (!doctorRepository.existsById(doctorId)) {
                        throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
                }

                List<Queue> queueList = getActiveQueueByDoctor(doctorId, date);
                if (queueList.isEmpty()) {
                        throw new ResourceNotFoundException("No active patients in queue for doctor id: " + doctorId);
                }

                Queue nextQueue = queueList.stream()
                                .filter(q -> q.getAppointment().getStatus() == Appointment.Status.BOOKED)
                                .findFirst()
                                .orElse(queueList.get(0));

                Appointment appointment = nextQueue.getAppointment();
                if (appointment.getStatus() == Appointment.Status.BOOKED) {
                        appointment.setStatus(Appointment.Status.WAITING);
                        appointmentRepository.save(appointment);
                        smsNotificationService.sendPatientCalled(appointment);
                }

                notifyQueueUpdatesForDoctor(doctorId, date, "Queue updated after calling next patient");
                return mapToResponse(nextQueue);
        }

        @Transactional
        public QueueResponse skipMissedAndMoveToEnd(Long appointmentId) {
                Queue queue = queueRepository.findByAppointmentId(appointmentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found for appointment: " + appointmentId));

                Appointment appointment = queue.getAppointment();
                if (appointment.getStatus() == Appointment.Status.CANCELLED || appointment.getStatus() == Appointment.Status.COMPLETED) {
                        throw new BadRequestException("Cannot skip a completed or cancelled appointment");
                }

                Long doctorId = appointment.getDoctor().getId();
                LocalDate date = appointment.getAppointmentDate();

                Integer maxQueue = queueRepository.findMaxQueueNumberForDoctorOnDate(doctorId, date);
                queue.setQueueNumber(maxQueue + 1);
                appointment.setStatus(Appointment.Status.BOOKED);

                queueRepository.save(queue);
                appointmentRepository.save(appointment);

                smsNotificationService.sendMissedCallAndRequeued(appointment, queue.getQueueNumber());
                notifyQueueUpdatesForDoctor(doctorId, date, "Queue updated after missed call and requeue");

                return callNextPatient(doctorId, date);
        }

        @Transactional
        public void notifyQueueUpdatesForDoctor(Long doctorId, LocalDate date, String reason) {
                List<Queue> queueList = getActiveQueueByDoctor(doctorId, date);
                if (queueList.isEmpty()) {
                        return;
                }

                int avgConsultation = queueList.get(0).getAppointment().getDoctor().getConsultationTime() != null
                                ? queueList.get(0).getAppointment().getDoctor().getConsultationTime() : 15;

                for (int i = 0; i < queueList.size(); i++) {
                        Queue entry = queueList.get(i);
                        int queuePosition = i + 1;
                        int estimatedWait = i * avgConsultation;
                        entry.setEstimatedTime(estimatedWait);
                        queueRepository.save(entry);
                        smsNotificationService.sendQueueUpdate(entry.getAppointment(), queuePosition, estimatedWait);
                }
        }

        private List<Queue> getActiveQueueByDoctor(Long doctorId, LocalDate date) {
                return queueRepository.findByDoctorAndDateOrdered(doctorId, date);
    }

    private QueueResponse mapToResponse(Queue queue) {
        return QueueResponse.builder()
                .id(queue.getId())
                .appointmentId(queue.getAppointment().getId())
                                .patientId(queue.getAppointment().getPatient().getId())
                .patientName(queue.getAppointment().getPatient().getName())
                .doctorName(queue.getAppointment().getDoctor().getName())
                .queueNumber(queue.getQueueNumber())
                .priorityLevel(queue.getPriorityLevel())
                .estimatedTime(queue.getEstimatedTime())
                .status(queue.getAppointment().getStatus().name())
                .build();
    }
}
