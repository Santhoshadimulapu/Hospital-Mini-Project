package com.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SecurityUpdateRequest {

    @NotBlank(message = "Phone is required")
    @Pattern(
            regexp = "^(?:\\+91[6-9]\\d{9}|0[6-9]\\d{9}|[6-9]\\d{9})$",
            message = "Phone must be a valid Indian mobile number (10 digits, 0XXXXXXXXXX, or +91XXXXXXXXXX)"
    )
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    public SecurityUpdateRequest() {}

    public SecurityUpdateRequest(String phone, String email) {
        this.phone = phone;
        this.email = email;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
