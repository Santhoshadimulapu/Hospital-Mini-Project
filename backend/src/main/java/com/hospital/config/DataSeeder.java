package com.hospital.config;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.hospital.entity.Admin;
import com.hospital.entity.Doctor;
import com.hospital.entity.Hospital;
import com.hospital.repository.AdminRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.HospitalRepository;

@Component
@Profile("!prod")
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

        private static final Logger log = Logger.getLogger(DataSeeder.class.getName());

        private final HospitalRepository hospitalRepository;
        private final DoctorRepository doctorRepository;
        private final AdminRepository adminRepository;
        private final PasswordEncoder passwordEncoder;

        @Value("${app.seed.admin-email:admin@hospital.local}")
        private String seedAdminEmail;

        @Value("${app.seed.admin-password:change-me-admin-password}")
        private String seedAdminPassword;

    public DataSeeder(HospitalRepository hospitalRepository,
                      DoctorRepository doctorRepository,
                      AdminRepository adminRepository,
                      PasswordEncoder passwordEncoder) {
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed admin if not exists
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
                        admin.setUsername(seedAdminEmail);
                        admin.setPassword(passwordEncoder.encode(seedAdminPassword));
            admin.setRole("ADMIN");
            adminRepository.save(admin);
                        log.info(() -> "Seeded admin user: " + seedAdminEmail);
        }

        if (hospitalRepository.count() > 0) {
            return; // already seeded
        }

        String encodedPassword = passwordEncoder.encode("doctor123");

        // ── Hospital 1: Apollo Hospitals, Chennai ──
        Hospital h1 = saveHospital("Apollo Hospitals", "Chennai",
                "21 Greams Lane, Off Greams Road", "044-28290200",
                "Cardiology, Neurology, Orthopedics, Oncology", 4.7);

        saveDoctor("Rajesh Kumar", "rajesh.kumar@apollo.com", encodedPassword,
                "Cardiology", "Mon,Tue,Wed,Thu,Fri", 30, h1);
        saveDoctor("Priya Sharma", "priya.sharma@apollo.com", encodedPassword,
                "Neurology", "Mon,Wed,Fri", 45, h1);
        saveDoctor("Arun Menon", "arun.menon@apollo.com", encodedPassword,
                "Orthopedics", "Tue,Thu,Sat", 30, h1);

        // ── Hospital 2: Fortis Hospital, Mumbai ──
        Hospital h2 = saveHospital("Fortis Hospital", "Mumbai",
                "Mulund Goregaon Link Road, Mulund West", "022-25994000",
                "Gastroenterology, Urology, Cardiology", 4.5);

        saveDoctor("Sneha Patil", "sneha.patil@fortis.com", encodedPassword,
                "Gastroenterology", "Mon,Tue,Wed,Thu", 30, h2);
        saveDoctor("Vikram Deshmukh", "vikram.deshmukh@fortis.com", encodedPassword,
                "Urology", "Wed,Thu,Fri,Sat", 45, h2);

        // ── Hospital 3: AIIMS, Delhi ──
        Hospital h3 = saveHospital("AIIMS Delhi", "Delhi",
                "Sri Aurobindo Marg, Ansari Nagar", "011-26588500",
                "General Medicine, Dermatology, Psychiatry, Pediatrics", 4.8);

        saveDoctor("Ananya Singh", "ananya.singh@aiims.com", encodedPassword,
                "Dermatology", "Mon,Tue,Wed,Fri", 20, h3);
        saveDoctor("Rohan Gupta", "rohan.gupta@aiims.com", encodedPassword,
                "Psychiatry", "Mon,Wed,Thu,Sat", 60, h3);
        saveDoctor("Kavitha Nair", "kavitha.nair@aiims.com", encodedPassword,
                "Pediatrics", "Tue,Thu,Fri,Sat", 30, h3);

        // ── Hospital 4: Manipal Hospital, Bangalore ──
        Hospital h4 = saveHospital("Manipal Hospital", "Bangalore",
                "98 HAL Old Airport Road, Kodihalli", "080-25024444",
                "Oncology, Pulmonology, ENT", 4.6);

        saveDoctor("Suresh Reddy", "suresh.reddy@manipal.com", encodedPassword,
                "Oncology", "Mon,Tue,Wed,Thu,Fri", 45, h4);
        saveDoctor("Deepa Rao", "deepa.rao@manipal.com", encodedPassword,
                "Pulmonology", "Mon,Wed,Fri", 30, h4);

        // ── Hospital 5: KIMS Hospital, Hyderabad ──
        Hospital h5 = saveHospital("KIMS Hospital", "Hyderabad",
                "1-8-31/1, Minister Road, Secunderabad", "040-44885000",
                "Nephrology, Cardiology, Neurosurgery", 4.4);

        saveDoctor("Mohammed Irfan", "mohammed.irfan@kims.com", encodedPassword,
                "Nephrology", "Mon,Tue,Thu,Fri", 30, h5);
        saveDoctor("Lakshmi Prasad", "lakshmi.prasad@kims.com", encodedPassword,
                "Neurosurgery", "Wed,Thu,Fri,Sat", 45, h5);

        // ── Hospital 6: Narayana Health, Kolkata ──
        Hospital h6 = saveHospital("Narayana Health", "Kolkata",
                "120/1 Anandapur, EM Bypass Road", "033-66266626",
                "Cardiac Surgery, Endocrinology, Rheumatology", 4.5);

        saveDoctor("Amit Chatterjee", "amit.chatterjee@narayana.com", encodedPassword,
                "Cardiac Surgery", "Mon,Tue,Wed,Thu", 45, h6);
        saveDoctor("Shalini Bose", "shalini.bose@narayana.com", encodedPassword,
                "Endocrinology", "Tue,Wed,Fri,Sat", 30, h6);

        // ── Hospital 7: CMC Vellore ──
        Hospital h7 = saveHospital("CMC Vellore", "Vellore",
                "Ida Scudder Road, Vellore", "0416-2281000",
                "Ophthalmology, General Surgery, Hematology", 4.9);

        saveDoctor("Thomas Mathew", "thomas.mathew@cmcvellore.com", encodedPassword,
                "Ophthalmology", "Mon,Wed,Thu,Fri", 20, h7);
        saveDoctor("Divya Joseph", "divya.joseph@cmcvellore.com", encodedPassword,
                "General Surgery", "Mon,Tue,Thu,Sat", 30, h7);

        // ── Hospital 8: Medanta, Gurgaon ──
        Hospital h8 = saveHospital("Medanta The Medicity", "Gurgaon",
                "CH Baktawar Singh Road, Sector 38", "0124-4141414",
                "Liver Transplant, Robotic Surgery, Spine Surgery", 4.7);

        saveDoctor("Sanjay Mehta", "sanjay.mehta@medanta.com", encodedPassword,
                "Liver Transplant", "Mon,Tue,Wed,Thu,Fri", 60, h8);
        saveDoctor("Nidhi Agarwal", "nidhi.agarwal@medanta.com", encodedPassword,
                "Spine Surgery", "Tue,Thu,Sat", 45, h8);

        // ── Hospital 9: Amrita Hospital, Kochi ──
        Hospital h9 = saveHospital("Amrita Hospital", "Kochi",
                "AIMS Ponekkara, Edappally", "0484-2851234",
                "Gynecology, Neonatology, Plastic Surgery", 4.3);

        saveDoctor("Meera Krishnan", "meera.krishnan@amrita.com", encodedPassword,
                "Gynecology", "Mon,Tue,Wed,Fri", 30, h9);
        saveDoctor("Rahul Varma", "rahul.varma@amrita.com", encodedPassword,
                "Plastic Surgery", "Wed,Thu,Fri,Sat", 45, h9);

        // ── Hospital 10: Ruby Hall Clinic, Pune ──
        Hospital h10 = saveHospital("Ruby Hall Clinic", "Pune",
                "40 Sasoon Road, Pune", "020-26163391",
                "Sports Medicine, Orthopedics, Diabetology", 4.4);

        saveDoctor("Vivek Joshi", "vivek.joshi@rubyhall.com", encodedPassword,
                "Sports Medicine", "Mon,Wed,Fri,Sat", 30, h10);
        saveDoctor("Pooja Kulkarni", "pooja.kulkarni@rubyhall.com", encodedPassword,
                "Diabetology", "Tue,Thu,Fri", 30, h10);

        log.info("Seeded 10 hospitals and 22 doctors successfully.");
    }

    private Hospital saveHospital(String name, String city, String address,
                                   String phone, String specialties, double rating) {
        Hospital h = new Hospital();
        h.setName(name);
        h.setCity(city);
        h.setAddress(address);
        h.setPhone(phone);
        h.setSpecialties(specialties);
        h.setRating(rating);
        return hospitalRepository.save(h);
    }

    private void saveDoctor(String name, String email, String password,
                            String specialization, String availableDays,
                            int consultationTime, Hospital hospital) {
        Doctor d = new Doctor();
        d.setName(name);
        d.setEmail(email);
        d.setPassword(password);
        d.setSpecialization(specialization);
        d.setAvailableDays(availableDays);
        d.setConsultationTime(consultationTime);
        d.setHospital(hospital);
        doctorRepository.save(d);
    }
}
