package com.hospital.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.hospital.entity.AuditLog;
import com.hospital.repository.AuditLogRepository;
import com.hospital.security.AuthenticatedUser;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String action, String targetType, Long targetId, String details) {
        AuditLog log = new AuditLog();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user) {
            log.setActorId(user.getUserId());
            log.setActorRole(user.getRole());
            log.setActorEmail(user.getEmail());
        } else {
            log.setActorRole("SYSTEM");
            log.setActorEmail("system");
        }

        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);

        auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}