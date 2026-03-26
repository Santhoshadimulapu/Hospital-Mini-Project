package com.hospital.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentCancellationRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.DashboardStats;
import com.hospital.entity.AuditLog;
import com.hospital.service.AdminService;
import com.hospital.service.AuditLogService;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    public AdminController(AdminService adminService, AuditLogService auditLogService) {
        this.adminService = adminService;
        this.auditLogService = auditLogService;
    }

    // GET /admin/appointments
    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllAppointments()));
    }

    // DELETE /admin/appointments/{id}
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) AppointmentCancellationRequest request) {
        String reason = request != null ? request.getReason() : null;
        adminService.cancelAppointment(id, reason);
        auditLogService.logAction("APPOINTMENT_CANCELLED", "APPOINTMENT", id,
                reason == null || reason.isBlank() ? "Cancelled by admin" : "Reason: " + reason);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", null));
    }

    // GET /admin/statistics
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<DashboardStats>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStatistics()));
    }

    // GET /admin/audit-logs
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getRecentLogs()));
    }
}
