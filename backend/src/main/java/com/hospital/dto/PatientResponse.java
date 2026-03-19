package com.hospital.dto;

public class PatientResponse {
    private Long id;
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private String email;
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
    private String createdAt;

    public PatientResponse() {}

    public PatientResponse(Long id, String name, Integer age, String gender, String phone, String email, 
                          String address, String city, String state, String zipCode, String bloodGroup,
                          String emergencyContactName, String emergencyContactPhone, String allergies,
                          String chronicConditions, String currentMedications, String occupation,
                          String maritalStatus, String createdAt) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
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
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public static PatientResponseBuilder builder() { return new PatientResponseBuilder(); }

    public static class PatientResponseBuilder {
        private Long id;
        private String name;
        private Integer age;
        private String gender;
        private String phone;
        private String email;
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
        private String createdAt;

        public PatientResponseBuilder id(Long id) { this.id = id; return this; }
        public PatientResponseBuilder name(String name) { this.name = name; return this; }
        public PatientResponseBuilder age(Integer age) { this.age = age; return this; }
        public PatientResponseBuilder gender(String gender) { this.gender = gender; return this; }
        public PatientResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public PatientResponseBuilder email(String email) { this.email = email; return this; }
        public PatientResponseBuilder address(String address) { this.address = address; return this; }
        public PatientResponseBuilder city(String city) { this.city = city; return this; }
        public PatientResponseBuilder state(String state) { this.state = state; return this; }
        public PatientResponseBuilder zipCode(String zipCode) { this.zipCode = zipCode; return this; }
        public PatientResponseBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public PatientResponseBuilder emergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; return this; }
        public PatientResponseBuilder emergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; return this; }
        public PatientResponseBuilder allergies(String allergies) { this.allergies = allergies; return this; }
        public PatientResponseBuilder chronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; return this; }
        public PatientResponseBuilder currentMedications(String currentMedications) { this.currentMedications = currentMedications; return this; }
        public PatientResponseBuilder occupation(String occupation) { this.occupation = occupation; return this; }
        public PatientResponseBuilder maritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; return this; }
        public PatientResponseBuilder createdAt(String createdAt) { this.createdAt = createdAt; return this; }

        public PatientResponse build() {
            return new PatientResponse(id, name, age, gender, phone, email, address, city, state, 
                                      zipCode, bloodGroup, emergencyContactName, emergencyContactPhone, 
                                      allergies, chronicConditions, currentMedications, occupation, 
                                      maritalStatus, createdAt);
        }
    }
}
