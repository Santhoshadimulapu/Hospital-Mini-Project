package com.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    public Admin() {}

    public Admin(Long id, String username, String password, String role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static AdminBuilder builder() { return new AdminBuilder(); }

    public static class AdminBuilder {
        private Long id;
        private String username;
        private String password;
        private String role;

        public AdminBuilder id(Long id) { this.id = id; return this; }
        public AdminBuilder username(String username) { this.username = username; return this; }
        public AdminBuilder password(String password) { this.password = password; return this; }
        public AdminBuilder role(String role) { this.role = role; return this; }

        public Admin build() {
            return new Admin(id, username, password, role);
        }
    }
}
