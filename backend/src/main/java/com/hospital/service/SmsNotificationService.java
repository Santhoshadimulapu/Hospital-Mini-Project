package com.hospital.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.repository.QueueRepository;

@Service
public class SmsNotificationService {

    private static final Logger log = Logger.getLogger(SmsNotificationService.class.getName());
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    @Value("${sms.hospital-name:City Hospital}")
    private String hospitalName;

    private final RestTemplate restTemplate;
    private final QueueRepository queueRepository;

    public SmsNotificationService(RestTemplateBuilder restTemplateBuilder, QueueRepository queueRepository) {
        this.restTemplate = restTemplateBuilder.build();
        this.queueRepository = queueRepository;
    }

    public void sendBookingConfirmation(Appointment appointment, int queueNumber, int estimatedWaitMinutes) {
        String doctorName = appointment.getDoctor().getName();
        String hospital = resolveHospitalName(appointment);
        String msg = "Appointment Confirmation\n"
                + "Your appointment with Dr. " + doctorName + " at " + hospital + " is confirmed.\n"
                + "Date: " + formatDate(appointment.getAppointmentDate()) + "\n"
                + "Time: " + formatTime(appointment.getSlotTime()) + "\n"
                + "Token No: " + queueNumber + "\n"
                + "Estimated Wait: " + estimatedWaitMinutes + " mins\n"
                + "Please arrive 15 minutes early.";
        sendToPatient(appointment, msg);
    }

    public void sendAppointmentReminder(Appointment appointment, int queueNumber) {
        String doctorName = appointment.getDoctor().getName();
        String hospital = resolveHospitalName(appointment);
        String msg = "Appointment Reminder\n"
                + "Reminder: You have an appointment with Dr. " + doctorName + " tomorrow at "
                + formatTime(appointment.getSlotTime()) + " at " + hospital + ".\n"
            + "Token No: " + queueNumber + ".";
        sendToPatient(appointment, msg);
    }

    public void sendPatientCalled(Appointment appointment) {
        String msg = "Queue Notification\n"
                + "Your turn is approaching at " + resolveHospitalName(appointment) + ".\n"
                + "Token No: " + resolveQueueNumber(appointment) + "\n"
                + "Please reach the waiting area within 10 minutes.";
        sendToPatient(appointment, msg);
    }

    public void sendMissedCallAndRequeued(Appointment appointment, int newQueueNumber) {
        String msg = "Hospital App: You missed your call. Your token has been moved to the end of queue as No. "
                + newQueueNumber + ". If this is an emergency, please contact hospital staff immediately.";
        sendToPatient(appointment, msg);
    }

    public void sendAppointmentCancelled(Appointment appointment) {
        String doctorName = appointment.getDoctor().getName();
        String msg = "Appointment Cancellation\n"
            + "Your appointment with Dr. " + doctorName + " on "
            + formatDate(appointment.getAppointmentDate()) + " at " + formatTime(appointment.getSlotTime())
            + " has been cancelled.\n"
            + "To rebook, visit the hospital portal.";
        sendToPatient(appointment, msg);
    }

    public void sendStatusUpdated(Appointment appointment, String status) {
        String msg;
        if ("RESCHEDULED".equalsIgnoreCase(status)) {
            msg = "Appointment Rescheduled\n"
                + "Your appointment with Dr. " + appointment.getDoctor().getName() + " has been rescheduled.\n"
                + "New Time: " + formatDate(appointment.getAppointmentDate()) + ", " + formatTime(appointment.getSlotTime()) + "\n"
                + "Token No: " + resolveQueueNumber(appointment) + "\n"
                + resolveHospitalName(appointment);
        } else {
            msg = "Appointment Update\n"
                + "Your appointment status is now " + status + " for Dr. " + appointment.getDoctor().getName()
                + " on " + formatDate(appointment.getAppointmentDate()) + " at " + formatTime(appointment.getSlotTime()) + ".";
        }
        sendToPatient(appointment, msg);
    }

    public void sendQueueUpdate(Appointment appointment, int queuePosition, int estimatedWaitMinutes) {
        String msg = "Queue Notification\n"
            + "Your turn is approaching at " + resolveHospitalName(appointment) + ".\n"
            + "Token No: " + queuePosition + "\n"
            + "Estimated Wait: " + estimatedWaitMinutes + " mins\n"
            + "Please reach the waiting area within 10 minutes.";
        sendToPatient(appointment, msg);
    }

    public void sendRegistrationConfirmation(Patient patient) {
        if (patient == null) {
            return;
        }
        String msg = "Registration Confirmation\n"
            + "Registration successful.\n"
            + "Patient ID: P" + patient.getId() + "\n"
            + "Hospital: " + hospitalName + "\n"
            + "Use this ID for future appointments.";
        sendSms(patient.getPhone(), msg);
        }

    private void sendToPatient(Appointment appointment, String body) {
        if (appointment == null || appointment.getPatient() == null) {
            return;
        }
        sendSms(appointment.getPatient().getPhone(), body);
    }

    public void sendSms(String toNumber, String body) {
        if (!smsEnabled) {
            log.info("SMS disabled. Skipping message: " + body);
            return;
        }

        if (toNumber == null || toNumber.isBlank()) {
            log.warning("SMS skipped: patient phone missing.");
            return;
        }

        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank()
                || fromNumber == null || fromNumber.isBlank()) {
            log.warning("SMS skipped: Twilio config incomplete.");
            return;
        }

        String normalizedTo = normalizePhone(toNumber);
        if (normalizedTo == null || normalizedTo.isBlank() || !isValidE164(normalizedTo)) {
            log.warning("SMS skipped: invalid patient phone number after normalization: " + toNumber + " -> " + normalizedTo);
            return;
        }

        String normalizedFrom = normalizePhone(fromNumber);
        if (normalizedFrom == null || normalizedFrom.isBlank() || !isValidE164(normalizedFrom)) {
            log.warning("SMS skipped: invalid Twilio from-number after normalization: " + fromNumber + " -> " + normalizedFrom);
            return;
        }

        try {
            String endpoint = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String auth = accountSid + ":" + authToken;
            String encoded = java.util.Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encoded);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", normalizedTo);
            form.add("From", normalizedFrom);
            form.add("Body", body);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS sent successfully to " + normalizedTo);
            } else {
                log.warning("Twilio SMS failed with status " + response.getStatusCode() + ": " + response.getBody());
            }
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            log.warning("Twilio HTTP error " + ex.getStatusCode() + ": " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.warning("Failed to send SMS to " + toNumber + ": " + ex.getMessage());
        }
    }

    private String normalizePhone(String raw) {
        if (raw == null) {
            return null;
        }

        String value = raw.trim().replaceAll("[^0-9+]", "");
        if (value.isBlank()) {
            return null;
        }

        // Handle +0XXXXXXXXXX invalid pattern by treating as local number.
        if (value.startsWith("+0")) {
            value = value.substring(1);
        }

        // Handle 00-prefixed international numbers (e.g., 0091...)
        if (value.startsWith("00") && value.length() > 2) {
            value = "+" + value.substring(2);
        }

        // Already E.164-like number.
        if (value.startsWith("+")) {
            return value;
        }

        // India local formats
        if (value.startsWith("0") && value.length() == 11) {
            return "+91" + value.substring(1);
        }
        if (value.length() == 10) {
            return "+91" + value;
        }
        if (value.startsWith("91") && value.length() == 12) {
            return "+" + value;
        }

        // Generic fallback: keep as international if length is plausible.
        if (value.length() >= 8 && value.length() <= 15) {
            return "+" + value;
        }

        return null;
    }

    private boolean isValidE164(String phone) {
        return phone != null && phone.matches("^\\+[1-9][0-9]{7,14}$");
    }

    private String resolveHospitalName(Appointment appointment) {
        if (appointment != null && appointment.getDoctor() != null && appointment.getDoctor().getHospital() != null
                && appointment.getDoctor().getHospital().getName() != null
                && !appointment.getDoctor().getHospital().getName().isBlank()) {
            return appointment.getDoctor().getHospital().getName();
        }
        return hospitalName;
    }

    private int resolveQueueNumber(Appointment appointment) {
        if (appointment == null || appointment.getId() == null) {
            return 0;
        }

        return queueRepository.findByAppointmentId(appointment.getId())
                .map(q -> q.getQueueNumber())
                .orElse(0);
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMAT) : "";
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMAT) : "";
    }
}
