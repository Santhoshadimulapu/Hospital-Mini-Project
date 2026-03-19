package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;

public class DeleteAccountRequest {

    @NotBlank(message = "Please provide a reason for deleting your account")
    private String reason;

    public DeleteAccountRequest() {}

    public DeleteAccountRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
