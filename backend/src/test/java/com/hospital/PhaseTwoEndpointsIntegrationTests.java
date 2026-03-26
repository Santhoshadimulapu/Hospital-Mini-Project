package com.hospital;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.AppointmentRescheduleRequest;
import com.hospital.dto.DoctorUpdateRequest;
import com.hospital.dto.HospitalRequest;
import com.hospital.entity.Admin;
import com.hospital.entity.Appointment;
import com.hospital.entity.Doctor;
import com.hospital.entity.Hospital;
import com.hospital.entity.Patient;
import com.hospital.repository.AdminRepository;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.AuditLogRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.HospitalRepository;
import com.hospital.repository.MedicalReportRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.QueueRepository;
import com.hospital.security.AuthenticatedUser;

import jakarta.transaction.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PhaseTwoEndpointsIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Test
    void adminCanUpdateAndDeleteDoctor() throws Exception {
        Hospital hospital = saveHospital("City Care");
        Doctor doctor = saveDoctor(hospital, "doctor.old@hospital.com", "Dr Old");

        DoctorUpdateRequest updateRequest = new DoctorUpdateRequest();
        updateRequest.setName("Dr Updated");
        updateRequest.setEmail("doctor.updated@hospital.com");
        updateRequest.setSpecialization("Cardiology");
        updateRequest.setAvailableDays("MON,TUE,WED");
        updateRequest.setConsultationTime(25);
        updateRequest.setHospitalId(hospital.getId());

        mockMvc.perform(put("/doctors/{id}", doctor.getId())
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("doctor.updated@hospital.com"));

        mockMvc.perform(delete("/doctors/{id}", doctor.getId())
                        .with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertFalse(doctorRepository.existsById(doctor.getId()));
    }

    @Test
    void adminCanUpdateAndDeleteHospital() throws Exception {
        Hospital hospital = saveHospital("Old Hospital");

        HospitalRequest request = new HospitalRequest();
        request.setName("Updated Hospital");
        request.setCity("Hyderabad");
        request.setAddress("Road 1");
        request.setPhone("+919999999999");
        request.setSpecialties("Cardiology");
        request.setImageUrl("https://example.com/h.jpg");
        request.setRating(4.4);

        mockMvc.perform(put("/hospitals/{id}", hospital.getId())
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Hospital"));

        mockMvc.perform(delete("/hospitals/{id}", hospital.getId())
                        .with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertFalse(hospitalRepository.existsById(hospital.getId()));
    }

    @Test
    void patientCanRescheduleOwnAppointment() throws Exception {
        Hospital hospital = saveHospital("Metro Hospital");
        Doctor doctor = saveDoctor(hospital, "doc1@hospital.com", "Dr One");
        doctor.setAvailableDays("MON,TUE,WED,THU,FRI,SAT,SUN");
        doctor = doctorRepository.save(doctor);

        Patient patient = savePatient("patient1@hospital.com", "+919876543210");
        Appointment appointment = saveAppointment(patient, doctor, LocalDate.now().plusDays(1), LocalTime.of(10, 0));

        AppointmentRescheduleRequest request = new AppointmentRescheduleRequest();
        request.setAppointmentDate(LocalDate.now().plusDays(2).toString());
        request.setSlotTime("11:00");
        request.setReason("Need a later time");

        mockMvc.perform(patch("/appointments/{id}/reschedule", appointment.getId())
                        .with(authentication(patientAuth(patient)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slotTime").value("11:00"))
                .andExpect(jsonPath("$.data.status").value("BOOKED"));

        Appointment updated = appointmentRepository.findById(appointment.getId()).orElseThrow();
        assertEquals(LocalDate.parse(request.getAppointmentDate()), updated.getAppointmentDate());
        assertEquals(LocalTime.of(11, 0), updated.getSlotTime());
        assertTrue(queueRepository.findByAppointmentId(appointment.getId()).isPresent());
    }

    @Test
    void adminCanViewAuditLogsAfterDoctorUpdate() throws Exception {
        Hospital hospital = saveHospital("Audit Hospital");
        Doctor doctor = saveDoctor(hospital, "audit.doc@hospital.com", "Dr Audit");

        DoctorUpdateRequest updateRequest = new DoctorUpdateRequest();
        updateRequest.setName("Dr Audit Updated");
        updateRequest.setEmail("audit.doc.updated@hospital.com");
        updateRequest.setSpecialization("Dermatology");
        updateRequest.setAvailableDays("MON,THU");
        updateRequest.setConsultationTime(20);
        updateRequest.setHospitalId(hospital.getId());

        mockMvc.perform(put("/doctors/{id}", doctor.getId())
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/admin/audit-logs")
                        .with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[*].action", hasItem("DOCTOR_UPDATED")));

        assertTrue(auditLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(log -> log.getAction())
                .toList()
                .contains("DOCTOR_UPDATED"));
    }

        @Test
        void patientCannotRescheduleAnotherPatientsAppointment() throws Exception {
                Hospital hospital = saveHospital("Guard Hospital");
                Doctor doctor = saveDoctor(hospital, "guard.doc@hospital.com", "Dr Guard");

                Patient owner = savePatient("owner@hospital.com", "+919811111111");
                Patient anotherPatient = savePatient("other@hospital.com", "+919822222222");
                Appointment appointment = saveAppointment(owner, doctor, LocalDate.now().plusDays(1), LocalTime.of(9, 30));

                AppointmentRescheduleRequest request = new AppointmentRescheduleRequest();
                request.setAppointmentDate(LocalDate.now().plusDays(2).toString());
                request.setSlotTime("10:30");
                request.setReason("Trying unauthorized reschedule");

                mockMvc.perform(patch("/appointments/{id}/reschedule", appointment.getId())
                                                .with(authentication(patientAuth(anotherPatient)))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void nonAdminCannotAccessAuditLogs() throws Exception {
                Patient patient = savePatient("nonadmin@hospital.com", "+919833333333");

                mockMvc.perform(get("/admin/audit-logs")
                                                .with(authentication(patientAuth(patient))))
                                .andExpect(status().isForbidden());
        }

        @Test
        void rescheduleToConflictingSlotReturnsConflict() throws Exception {
                Hospital hospital = saveHospital("Conflict Hospital");
                Doctor doctor = saveDoctor(hospital, "conflict.doc@hospital.com", "Dr Conflict");

                Patient patientOne = savePatient("conflict.one@hospital.com", "+919844444444");
                Patient patientTwo = savePatient("conflict.two@hospital.com", "+919855555555");

                Appointment target = saveAppointment(patientOne, doctor, LocalDate.now().plusDays(1), LocalTime.of(10, 0));
                saveAppointment(patientTwo, doctor, LocalDate.now().plusDays(1), LocalTime.of(11, 0));

                AppointmentRescheduleRequest request = new AppointmentRescheduleRequest();
                request.setAppointmentDate(LocalDate.now().plusDays(1).toString());
                request.setSlotTime("11:00");
                request.setReason("Conflicting slot");

                mockMvc.perform(patch("/appointments/{id}/reschedule", target.getId())
                                                .with(authentication(patientAuth(patientOne)))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isConflict());
        }

        @Test
        void nonAdminCannotDeleteDoctor() throws Exception {
                Hospital hospital = saveHospital("Role Hospital");
                Doctor doctor = saveDoctor(hospital, "role.doc@hospital.com", "Dr Role");
                Patient patient = savePatient("role.patient@hospital.com", "+919866666666");

                mockMvc.perform(delete("/doctors/{id}", doctor.getId())
                                                .with(authentication(patientAuth(patient))))
                                .andExpect(status().isForbidden());
        }

        @Test
        void deleteDoctorWithLinkedAppointmentReturnsBadRequest() throws Exception {
                Hospital hospital = saveHospital("Linked Hospital");
                Doctor doctor = saveDoctor(hospital, "linked.doc@hospital.com", "Dr Linked");
                Patient patient = savePatient("linked.patient@hospital.com", "+919877777777");
                saveAppointment(patient, doctor, LocalDate.now().plusDays(1), LocalTime.of(12, 0));

                mockMvc.perform(delete("/doctors/{id}", doctor.getId())
                                                .with(authentication(adminAuth())))
                                .andExpect(status().isBadRequest());
        }

                @Test
                void doctorsPagedSupportsSearchAndHospitalFilter() throws Exception {
                        Hospital alpha = saveHospital("Alpha Hospital");
                        Hospital beta = saveHospital("Beta Hospital");

                        saveDoctor(alpha, "alpha.one@hospital.com", "Dr Alpha One");
                        saveDoctor(beta, "beta.one@hospital.com", "Dr Beta One");

                        mockMvc.perform(get("/doctors/paged")
                                                        .param("page", "0")
                                                        .param("size", "10")
                                                        .param("q", "alpha")
                                                        .param("hospitalId", alpha.getId().toString()))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.totalElements").value(1))
                                        .andExpect(jsonPath("$.data.items[0].hospitalId").value(alpha.getId()));
                }

                @Test
                void hospitalsPagedSupportsCityAndSearchFilter() throws Exception {
                        Hospital hyderabad = saveHospital("Care Hyderabad");
                        Hospital bengaluru = saveHospital("Care Bengaluru");
                        bengaluru.setCity("Bengaluru");
                        hospitalRepository.save(bengaluru);

                        mockMvc.perform(get("/hospitals/paged")
                                                        .param("page", "0")
                                                        .param("size", "10")
                                                        .param("q", "care")
                                                        .param("city", "Hyderabad"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.totalElements").value(1))
                                        .andExpect(jsonPath("$.data.items[0].id").value(hyderabad.getId()));
                }

    private Authentication adminAuth() {
        Admin admin = adminRepository.findByUsername("phase2-admin")
                .orElseGet(() -> adminRepository.save(Admin.builder()
                        .username("phase2-admin")
                        .password("secret")
                        .role("ADMIN")
                        .build()));

        AuthenticatedUser principal = new AuthenticatedUser(admin.getId(), admin.getUsername(), "ADMIN");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private Authentication patientAuth(Patient patient) {
        AuthenticatedUser principal = new AuthenticatedUser(patient.getId(), patient.getEmail(), "PATIENT");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_PATIENT")));
    }

    private Hospital saveHospital(String name) {
        Hospital hospital = new Hospital();
        hospital.setName(name);
        hospital.setCity("Hyderabad");
        hospital.setAddress("Main Road");
        hospital.setSpecialties("General Medicine");
        hospital.setRating(4.2);
        return hospitalRepository.save(hospital);
    }

    private Doctor saveDoctor(Hospital hospital, String email, String name) {
        Doctor doctor = Doctor.builder()
                .name(name)
                .email(email)
                .password("encoded-pass")
                .specialization("General Medicine")
                .availableDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .consultationTime(30)
                .hospital(hospital)
                .build();
        return doctorRepository.save(doctor);
    }

    private Patient savePatient(String email, String phone) {
        Patient patient = Patient.builder()
                .name("Patient One")
                .email(email)
                .phone(phone)
                .password("encoded-pass")
                .build();
        return patientRepository.save(patient);
    }

    private Appointment saveAppointment(Patient patient, Doctor doctor, LocalDate date, LocalTime time) {
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .slotTime(time)
                .status(Appointment.Status.BOOKED)
                .build();
        return appointmentRepository.save(appointment);
    }
}
