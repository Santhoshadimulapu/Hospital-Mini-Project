package com.hospital.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer age;

    private String gender;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Additional profile fields
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String bloodGroup;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String allergies;
    private String chronicConditions;
    private String currentMedications;
    private String occupation;
    private String maritalStatus;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Patient() {}

    public Patient(Long id, String name, Integer age, String gender, String phone, String email, String password, 
                   String address, String city, String state, String zipCode, String bloodGroup,
                   String emergencyContactName, String emergencyContactPhone, String allergies,
                   String chronicConditions, String currentMedications, String occupation, 
                   String maritalStatus, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.bloodGroup = bloodGroup;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.allergies = allergies;
        this.chronicConditions = chronicConditions;
        this.currentMedications = currentMedications;
        this.occupation = occupation;
        this.maritalStatus = maritalStatus;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }
    public String getCurrentMedications() { return currentMedications; }
    public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }
    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }
    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static PatientBuilder builder() { return new PatientBuilder(); }

    public static class PatientBuilder {
        private Long id;
        private String name;
        private Integer age;
        private String gender;
        private String phone;
        private String email;
        private String password;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String bloodGroup;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String allergies;
        private String chronicConditions;
        private String currentMedications;
        private String occupation;
        private String maritalStatus;
        private LocalDateTime createdAt;

        public PatientBuilder id(Long id) { this.id = id; return this; }
        public PatientBuilder name(String name) { this.name = name; return this; }
        public PatientBuilder age(Integer age) { this.age = age; return this; }
        public PatientBuilder gender(String gender) { this.gender = gender; return this; }
        public PatientBuilder phone(String phone) { this.phone = phone; return this; }
        public PatientBuilder email(String email) { this.email = email; return this; }
        public PatientBuilder password(String password) { this.password = password; return this; }
        public PatientBuilder address(String address) { this.address = address; return this; }
        public PatientBuilder city(String city) { this.city = city; return this; }
        public PatientBuilder state(String state) { this.state = state; return this; }
        public PatientBuilder zipCode(String zipCode) { this.zipCode = zipCode; return this; }
        public PatientBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public PatientBuilder emergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; return this; }
        public PatientBuilder emergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; return this; }
        public PatientBuilder allergies(String allergies) { this.allergies = allergies; return this; }
        public PatientBuilder chronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; return this; }
        public PatientBuilder currentMedications(String currentMedications) { this.currentMedications = currentMedications; return this; }
        public PatientBuilder occupation(String occupation) { this.occupation = occupation; return this; }
        public PatientBuilder maritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; return this; }
        public PatientBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Patient build() {
            return new Patient(id, name, age, gender, phone, email, password, address, city, state, 
                             zipCode, bloodGroup, emergencyContactName, emergencyContactPhone, 
                             allergies, chronicConditions, currentMedications, occupation, 
                             maritalStatus, createdAt);
        }
    }
}
