# 🏥 Hospital Backend API — Spring Boot 3.2 + Java 21

A production-ready REST API for hospital appointment management with JWT authentication, queue optimization, and AI-powered symptom assistance.

## 📋 Prerequisites

- **Java 21** (LTS)
- **MySQL 8.0+** (local and production)
- **Maven 3.9+**
- **Git** (for version control)

---

## 🚀 Quick Start

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd Hospital\ Mini\ Project/backend
```

### 2. Set Up MySQL Database
```bash
mysql -u root -p
CREATE DATABASE hospital_db;
EXIT;
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings (defaults work for local development)
```

### 4. Build & Run
```bash
# Build (includes running tests)
mvn clean install

# Run locally
mvn spring-boot:run

# Or package and run JAR
mvn -DskipTests clean package
java -jar target/hospital-backend-*.jar
```

**Server runs at**: `http://localhost:8080`

**Health Check**: `curl http://localhost:8080/actuator/health`

---

## 🗂️ Project Structure

```
backend/
├── src/main/java/com/hospital/
│   ├── HospitalBackendApplication.java       # Entry point
│   ├── config/
│   │   ├── CorsConfig.java                   # CORS configuration
│   │   ├── DataSeeder.java                   # Demo data for development
│   │   ├── OpenApiConfig.java                # Swagger/OpenAPI setup
│   │   └── SecurityConfig.java               # Spring Security & JWT
│   ├── controller/
│   │   ├── AdminController.java              # Admin endpoints
│   │   ├── AiController.java                 # AI symptom helper
│   │   ├── AppointmentController.java        # Appointment booking
│   │   ├── AuthController.java               # Login/logout
│   │   ├── DoctorController.java             # Doctor management
│   │   ├── HospitalController.java           # Hospital endpoints
│   │   ├── PatientController.java            # Patient profile
│   │   ├── QueueController.java              # Queue status
│   │   └── ReportController.java             # Medical reports
│   ├── dto/                                  # Data transfer objects
│   │   ├── *Request.java                     # Inbound DTOs
│   │   └── *Response.java                    # Outbound DTOs
│   ├── entity/                               # JPA entities
│   │   ├── Admin.java
│   │   ├── Appointment.java
│   │   ├── Doctor.java
│   │   ├── Hospital.java
│   │   ├── Patient.java
│   │   ├── Queue.java
│   │   └── User.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java       # Centralized error handling
│   │   └── CustomExceptions.java             # Domain-specific exceptions
│   ├── repository/                           # Spring Data JPA
│   │   ├── AdminRepository.java
│   │   ├── AppointmentRepository.java
│   │   ├── DoctorRepository.java
│   │   ├── HospitalRepository.java
│   │   ├── PatientRepository.java
│   │   └── QueueRepository.java
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java      # JWT filter
│   │   ├── JwtTokenProvider.java             # Token generation/validation
│   │   └── CustomUserDetailsService.java     # User authentication
│   └── service/
│       ├── AdminService.java
│       ├── AppointmentService.java
│       ├── DoctorService.java
│       ├── GptSymptomService.java            # AI - Hugging Face
│       ├── HospitalService.java
│       ├── PatientService.java
│       ├── QueueService.java
│       └── SmsService.java                   # SMS - Twilio
├── src/main/resources/
│   ├── application.properties                # Development config
│   ├── application-prod.properties           # Production config (Railway MySQL)
│   ├── application-test.properties           # Test config (H2)
│   └── logback.xml                           # Logging configuration
├── src/test/java/com/hospital/
│   └── HospitalBackendApplicationTests.java  # Unit tests (@ActiveProfiles("test"))
├── pom.xml                                   # Maven dependencies & build
├── Dockerfile                                # Container image for Render
├── .env.example                              # Environment variables template
└── README.md                                 # This file
```

---

## ⚙️ Configuration & Environment Variables

### Development (`application.properties`)

```properties
server.port=8080
spring.profiles.active=dev

# MySQL (Local)
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Security
jwt.secret=dev-secret-key-change-me-in-production
jwt.expiration.hours=24

# CORS
cors.allowed.origins=http://localhost:5173,http://localhost:3000

# App Seeding (Demo Data)
app.seed.enabled=true
app.seed.admin.email=admin@hospital.com
app.seed.admin.password=admin123

# Optional: AI & SMS
hf.api.key=${HF_API_KEY:}
twilio.account.sid=${TWILIO_ACCOUNT_SID:}
twilio.auth.token=${TWILIO_AUTH_TOKEN:}
twilio.from.number=${TWILIO_FROM_NUMBER:}
sms.enabled=false
```

### Production (`application-prod.properties`) — Railway MySQL + Render

```properties
server.port=${PORT:8080}
spring.profiles.active=prod

# MySQL - Railway with fallback composition
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://${DB_HOST}:${DB_PORT:3306}/${DB_NAME}?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# JPA - No DDL auto in prod
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# JWT - Enforced strong secret
jwt.secret=${JWT_SECRET}  # Must be >= 32 characters
jwt.expiration.hours=${JWT_EXPIRATION_HOURS:24}

# CORS - Production domain
cors.allowed.origins=${CORS_ORIGINS}

# Disable seeding in production
app.seed.enabled=false

# Actuator for health checks
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized
```

### Test (`application-test.properties`) — H2 In-Memory

```properties
spring.datasource.url=jdbc:h2:mem:hospital_test;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false

jwt.secret=test-secret-key-32-characters-minimum-required
app.seed.enabled=false
```

---

## 🔐 Security

### JWT Token Validation
- **Minimum secret length**: 32 characters (enforced at @PostConstruct)
- **Expiration validation**: Must be > 0 hours
- **Startup failure**: Application fails to start if JWT is misconfigured

### Password Hashing
- Uses **Spring Security BCrypt** with strength 10
- Passwords never stored in plain text

### CORS Protection
- Configurable per environment
- Default allows localhost only (development)
- Production restricted to frontend domain

### Role-Based Access Control
```
PATIENT   → Register, book appointments, view own records
DOCTOR    → View appointments, manage availability
ADMIN     → Full access to all resources
```

### Authentication Filter
- Intercepts all requests (except public endpoints)
- Extracts & validates JWT from `Authorization: Bearer <token>` header
- Populates `SecurityContext` with user details

### Public Endpoints (No Auth Required)
```
POST   /api/auth/login
POST   /patients/register
GET    /doctors
GET    /hospitals
GET    /actuator/health
GET    /actuator/info
```

---

## 📡 REST API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "PATIENT"
}

Response: HTTP 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "PATIENT"
  }
}
```

---

### Patient Endpoints

#### Register Patient
```http
POST /patients/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "MALE",
  "phone": "+919876543210"
}

Response: HTTP 201 (Created)
```

#### Get Patient Profile
```http
GET /patients/{patientId}
Authorization: Bearer <token>

Response: HTTP 200
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "gender": "MALE",
  "phone": "+919876543210",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Get Patient Appointments
```http
GET /patients/{patientId}/appointments
Authorization: Bearer <token>

Response: HTTP 200
[
  {
    "id": 5,
    "doctorId": 2,
    "doctorName": "Dr. Priya Sharma",
    "appointment_date": "2024-02-20",
    "slot_time": "10:00 AM",
    "status": "CONFIRMED"
  }
]
```

---

### Doctor Endpoints

#### Get All Doctors
```http
GET /doctors

Response: HTTP 200
[
  {
    "id": 1,
    "name": "Dr. Rajesh Kumar",
    "email": "rajesh.kumar@apollo.com",
    "specialization": "Cardiology",
    "hospital": "Apollo Hospitals",
    "available_days": "Mon,Tue,Wed,Thu,Fri",
    "consultation_time": 30
  }
]
```

#### Filter by Specialization
```http
GET /doctors/specialization/Cardiology

Response: HTTP 200
[...]
```

#### Get Doctor Details
```http
GET /doctors/{doctorId}

Response: HTTP 200
{
  "id": 1,
  "name": "Dr. Rajesh Kumar",
  "specialization": "Cardiology",
  "experience_years": 15,
  "available_days": "Mon,Tue,Wed,Thu,Fri",
  "consultation_time": 30,
  "rating": 4.8
}
```

#### Update Doctor Availability (Doctor only)
```http
PUT /doctors/slots/{doctorId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "available_days": "Mon,Tue,Thu,Fri",
  "from_time": "09:00",
  "to_time": "17:00"
}

Response: HTTP 200 (Updated)
```

---

### Appointment Endpoints

#### Book Appointment
```http
POST /appointments/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 2,
  "appointment_date": "2024-02-20",
  "slot_time": "10:00 AM",
  "priority_level": 0
}

Response: HTTP 201 (Created)
{
  "id": 5,
  "status": "CONFIRMED",
  "estimated_queue_time": 5
}
```

#### Get Doctor's Appointments
```http
GET /appointments/doctor/{doctorId}
Authorization: Bearer <token>

Response: HTTP 200
[
  {
    "id": 5,
    "patient_name": "John Doe",
    "appointment_date": "2024-02-20",
    "slot_time": "10:00 AM",
    "status": "CONFIRMED"
  }
]
```

#### Get Patient's Appointments
```http
GET /appointments/patient/{patientId}
Authorization: Bearer <token>

Response: HTTP 200
[...]
```

#### Get Appointment Details
```http
GET /appointments/{appointmentId}
Authorization: Bearer <token>

Response: HTTP 200
{
  "id": 5,
  "patient": { "id": 1, "name": "John Doe" },
  "doctor": { "id": 2, "name": "Dr. Priya" },
  "appointment_date": "2024-02-20",
  "slot_time": "10:00 AM",
  "status": "CONFIRMED",
  "queue_number": 3
}
```

#### Update Appointment Status
```http
PATCH /appointments/{appointmentId}/status?status=COMPLETED
Authorization: Bearer <token>

Response: HTTP 200 (Updated)
```

#### Cancel Appointment
```http
DELETE /appointments/{appointmentId}
Authorization: Bearer <token>

Response: HTTP 200 (Deleted)
```

---

### Queue Endpoints

#### Get Queue Status
```http
GET /queue/status/{doctorId}?date=2024-02-20
Authorization: Bearer <token>

Response: HTTP 200
{
  "doctorId": 2,
  "date": "2024-02-20",
  "total_in_queue": 5,
  "current_serving": 1,
  "appointments": [
    {
      "queue_number": 1,
      "patient_name": "Alice Smith",
      "priority": "Normal",
      "estimated_wait": "0 min"
    },
    {
      "queue_number": 2,
      "patient_name": "John Doe",
      "priority": "Normal",
      "estimated_wait": "30 min"
    }
  ]
}
```

#### Get Wait Time
```http
GET /queue/wait-time/{appointmentId}
Authorization: Bearer <token>

Response: HTTP 200
{
  "appointmentId": 5,
  "queue_number": 2,
  "estimated_wait_minutes": 35,
  "patients_ahead": 1
}
```

---

### Admin Endpoints

#### View All Appointments
```http
GET /admin/appointments
Authorization: Bearer <admin-token>

Response: HTTP 200
[
  {
    "id": 5,
    "patient_name": "John Doe",
    "doctor_name": "Dr. Priya",
    "appointment_date": "2024-02-20",
    "status": "CONFIRMED"
  }
]
```

#### Get Dashboard Statistics
```http
GET /admin/statistics
Authorization: Bearer <admin-token>

Response: HTTP 200
{
  "total_appointments": 150,
  "total_patients": 45,
  "total_doctors": 20,
  "total_hospitals": 12,
  "appointments_today": 8,
  "no_shows_this_week": 2
}
```

#### Cancel Appointment (Admin)
```http
DELETE /admin/appointments/{appointmentId}
Authorization: Bearer <admin-token>

Response: HTTP 200 (Deleted)
```

---

## 🗄️ Database Schema

### Patient
```sql
CREATE TABLE patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INT,
  gender ENUM('MALE', 'FEMALE', 'OTHER'),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Doctor
```sql
CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  specialization VARCHAR(100),
  hospital_id INT,
  available_days VARCHAR(50),
  consultation_time INT DEFAULT 30,
  rating DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);
```

### Hospital
```sql
CREATE TABLE hospitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Appointment
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_doctor_slot (doctor_id, appointment_date, slot_time),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
```

### Queue
```sql
CREATE TABLE queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  queue_number INT,
  priority_level INT DEFAULT 0,
  estimated_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);
```

---

## 🧪 Testing

### Run All Tests
```bash
mvn test
```

### Run Specific Test
```bash
mvn test -Dtest=HospitalBackendApplicationTests
```

### Run with Coverage
```bash
mvn clean test jacoco:report
# Report: target/site/jacoco/index.html
```

### Test Configuration
- **Profile**: `@ActiveProfiles("test")`
- **Database**: H2 in-memory (MODE=MySQL for compatibility)
- **External Services**: Mocked (no Twilio, Hugging Face calls)
- **Test Isolation**: Each test runs independently with clean database

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t hospital-backend:latest .
```

### Run Container
```bash
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-mysql-host \
  -e DB_PORT=3306 \
  -e DB_NAME=hospital_db \
  -e DB_USER=root \
  -e DB_PASSWORD=yourpassword \
  -e JWT_SECRET=your-32-char-minimum-secret \
  hospital-backend:latest
```

---

## 📊 Demo Data

On first run (when `APP_SEED_ENABLED=true`), the system seeds 20 demo doctors across 12 Indian hospitals:

| Hospital | City | Doctors |
|----------|------|---------|
| Apollo Hospitals | Chennai | Dr. Rajesh Kumar (Cardiology), Dr. Priya Sharma (Neurology), Dr. Arun Menon (Orthopedics) |
| Fortis Hospital | Mumbai | Dr. Sneha Patil (General), Dr. Vikram Deshmukh (Surgery) |
| AIIMS | Delhi | Dr. Ananya Singh (Pediatrics), Dr. Rohan Gupta (Oncology), Dr. Kavitha Nair (ENT) |
| Manipal Hospital | Bangalore | Dr. Suresh Reddy (Dermatology), Dr. Deepa Rao (Gynecology) |
| KIMS Hospital | Hyderabad | Dr. Mohammed Irfan (Cardiology), Dr. Lakshmi Prasad (General) |
| Narayana Health | Kolkata | Dr. Amit Chatterjee (Surgery), Dr. Shalini Bose (Neurology) |
| CMC Vellore | Vellore | Dr. Thomas Mathew (Orthopedics), Dr. Divya Joseph (Pediatrics) |
| Medanta | Gurgaon | Dr. Sanjay Mehta (Cardiology), Dr. Nidhi Agarwal (Gynecology) |
| Amrita Hospital | Kochi | Dr. Meera Krishnan (General), Dr. Rahul Varma (Surgery) |
| Ruby Hall Clinic | Pune | Dr. Vivek Joshi (Oncology), Dr. Pooja Kulkarni (ENT) |

**Demo Admin Login**:
- Email: `admin@hospital.com`
- Password: `admin123` (configurable via `APP_SEED_ADMIN_PASSWORD`)

---

## 🛠️ Development Commands

```bash
# Build
mvn clean install

# Run locally
mvn spring-boot:run

# Package JAR
mvn -DskipTests clean package

# Run tests only
mvn test

# Format code
mvn spotless:apply

# Generate API docs
mvn springdoc-openapi-maven-plugin:generate
# Access Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 8080 already in use** | `lsof -i :8080` to find process, or change `server.port` |
| **MySQL connection refused** | Ensure MySQL is running: `mysql --version` |
| **JWT Secret too short** | Set `JWT_SECRET` to >= 32 characters |
| **Seeding fails in prod** | Ensure `APP_SEED_ENABLED=false` |
| **CORS error on frontend** | Check `CORS_ORIGINS` includes frontend domain |
| **Tests fail** | Clear cache: `mvn clean`, ensure H2 in pom.xml test scope |

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Documentation](https://tools.ietf.org/html/rfc7519)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Maven Documentation](https://maven.apache.org/)

---

**Last Updated**: March 2026  
**Java Version**: 21  
**Spring Boot**: 3.2.5  
**Status**: Production-Ready
