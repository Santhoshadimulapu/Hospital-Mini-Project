package com.hospital.dto;

public class HospitalResponse {
    private Long id;
    private String name;
    private String city;
    private String address;
    private String phone;
    private String specialties;
    private String imageUrl;
    private Double rating;
    private long doctorCount;

    public HospitalResponse() {}

    public HospitalResponse(Long id, String name, String city, String address, String phone,
                            String specialties, String imageUrl, Double rating, long doctorCount) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.address = address;
        this.phone = phone;
        this.specialties = specialties;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.doctorCount = doctorCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSpecialties() { return specialties; }
    public void setSpecialties(String specialties) { this.specialties = specialties; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public long getDoctorCount() { return doctorCount; }
    public void setDoctorCount(long doctorCount) { this.doctorCount = doctorCount; }
}
