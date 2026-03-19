package com.hospital.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.MedicalReportRequest;
import com.hospital.dto.MedicalReportResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.Doctor;
import com.hospital.entity.Hospital;
import com.hospital.entity.MedicalReport;
import com.hospital.entity.Patient;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.MedicalReportRepository;

@Service
public class MedicalReportService {

    private final MedicalReportRepository reportRepository;
    private final AppointmentRepository appointmentRepository;

    public MedicalReportService(MedicalReportRepository reportRepository,
                                AppointmentRepository appointmentRepository) {
        this.reportRepository = reportRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public MedicalReportResponse createReport(Long doctorId, MedicalReportRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("You can only create reports for your own appointments");
        }

        if (appointment.getStatus() != Appointment.Status.COMPLETED) {
            throw new BadRequestException("Report can only be created for completed appointments");
        }

        if (reportRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new BadRequestException("A report already exists for this appointment");
        }

        MedicalReport report = new MedicalReport();
        report.setAppointment(appointment);
        report.setDoctor(appointment.getDoctor());
        report.setPatient(appointment.getPatient());
        report.setAssessment(request.getAssessment());
        report.setDiagnosis(request.getDiagnosis());
        report.setPrescription(request.getPrescription());

        reportRepository.save(report);
        return mapToResponse(report);
    }

    public MedicalReportResponse getReportById(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        return mapToResponse(report);
    }

    public MedicalReportResponse getReportByAppointment(Long appointmentId) {
        MedicalReport report = reportRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No report found for this appointment"));
        return mapToResponse(report);
    }

    public List<MedicalReportResponse> getReportsByPatient(Long patientId) {
        return reportRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MedicalReportResponse> getReportsByDoctor(Long doctorId) {
        return reportRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MedicalReportResponse mapToResponse(MedicalReport report) {
        MedicalReportResponse res = new MedicalReportResponse();
        res.setId(report.getId());
        res.setAppointmentId(report.getAppointment().getId());
        res.setAppointmentDate(report.getAppointment().getAppointmentDate().toString());
        res.setSlotTime(report.getAppointment().getSlotTime().toString());

        Doctor doctor = report.getDoctor();
        res.setDoctorId(doctor.getId());
        res.setDoctorName(doctor.getName());
        res.setSpecialization(doctor.getSpecialization());

        Patient patient = report.getPatient();
        res.setPatientId(patient.getId());
        res.setPatientName(patient.getName());
        res.setPatientEmail(patient.getEmail());
        res.setPatientPhone(patient.getPhone());
        res.setPatientAge(patient.getAge());
        res.setPatientGender(patient.getGender());
        res.setPatientBloodGroup(patient.getBloodGroup());

        Hospital hospital = doctor.getHospital();
        if (hospital != null) {
            res.setHospitalName(hospital.getName());
            res.setHospitalAddress(hospital.getAddress());
            res.setHospitalPhone(hospital.getPhone());
        }

        res.setAssessment(report.getAssessment());
        res.setDiagnosis(report.getDiagnosis());
        res.setPrescription(report.getPrescription());
        res.setCreatedAt(report.getCreatedAt().toString());

        return res;
    }
}
