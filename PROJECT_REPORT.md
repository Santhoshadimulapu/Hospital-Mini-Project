# Hospital Appointment & Queue Optimization System

## Project Report

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Existing System](#3-existing-system)
4. [Proposed System](#4-proposed-system)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Database Design](#7-database-design)
8. [Module Description](#8-module-description)
9. [API Endpoints](#9-api-endpoints)
10. [Implementation Details](#10-implementation-details)
11. [Security Implementation](#11-security-implementation)
12. [Screenshots / UI Walkthrough](#12-screenshots--ui-walkthrough)
13. [Testing](#13-testing)
14. [Future Enhancements](#14-future-enhancements)
15. [Conclusion](#15-conclusion)
16. [References](#16-references)

---

## 1. Introduction

The **Hospital Appointment & Queue Optimization System** is a full-stack web application designed to digitize and streamline the process of scheduling hospital appointments and managing patient queues. The system provides role-based interfaces for **Patients**, **Doctors**, and **Administrators**, enabling efficient appointment booking, real-time queue monitoring, and hospital analytics.

The application follows modern software engineering practices with a decoupled architecture: a Spring Boot REST API backend and a React single-page application (SPA) frontend. JWT-based authentication ensures secure access across all roles.

### 1.1 Objectives

- Eliminate manual appointment scheduling and reduce patient wait times
- Provide real-time queue tracking with priority-based ordering
- Enable doctors to manage their availability and appointment schedules
- Give administrators a centralized dashboard for hospital-wide analytics
- Implement secure, role-based access control using JWT authentication
- Build a responsive, modern UI inspired by platforms like Practo

---

## 2. Problem Statement

Traditional hospital appointment systems rely on manual processes — phone calls, physical registers, and walk-in queues. This leads to:

- **Long patient wait times** with no visibility into queue status
- **Double-booking conflicts** when multiple patients are assigned the same time slot
- **Inefficient doctor scheduling** without centralized availability management
- **No real-time data** for hospital administrators to track appointment trends
- **Paper-based records** that are error-prone and difficult to search

There is a need for a digital system that automates appointment booking with slot conflict prevention, provides live queue monitoring, and offers analytics dashboards for hospital management.

---

## 3. Existing System

| Aspect | Current State |
|--------|---------------|
| Appointment Booking | Phone calls or in-person registration at hospital counter |
| Queue Management | Physical token system with manual numbering |
| Doctor Scheduling | Paper-based or spreadsheet-managed availability |
| Patient Records | Manual registers, no searchable digital records |
| Analytics | Monthly manual reports based on register data |
| Conflict Prevention | None — double-bookings resolved at counter |

### Limitations of Existing System

1. No mechanism to prevent slot conflicts or double-bookings
2. Patients have no visibility into their queue position or estimated wait time
3. Doctors cannot manage their schedules remotely
4. No centralized dashboard for hospital statistics
5. Prone to human errors in record-keeping

---

## 4. Proposed System

The proposed system addresses every limitation of the existing system:

| Feature | Implementation |
|---------|----------------|
| **Online Appointment Booking** | Patients select a doctor, date, and time slot through a web interface |
| **Slot Conflict Prevention** | Database-level unique constraint on (doctor_id, date, slot_time) prevents double-booking |
| **Real-Time Queue Monitoring** | Live queue status page with 15-second auto-refresh polling |
| **Priority-Based Queue** | Appointments can have priority levels (0-10) that determine queue ordering |
| **Doctor Schedule Management** | Doctors update their available days and consultation duration |
| **Admin Analytics Dashboard** | Charts showing total patients, doctors, appointments, and today's status breakdown |
| **Role-Based Access** | JWT authentication with PATIENT, DOCTOR, and ADMIN roles |
| **Responsive UI** | Mobile-friendly design inspired by Practo's interface |

### Advantages of Proposed System

1. 24/7 online appointment booking from any device
2. Zero double-booking conflicts via database constraints
3. Patients can track their queue position in real-time
4. Doctors manage availability digitally
5. Administrators get instant hospital analytics
6. Secure access with encrypted passwords and JWT tokens

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│   React Frontend     │  HTTP   │  Spring Boot Backend  │
│   (Vite + SPA)       │◄──────►│  (REST API)           │
│   Port: 5173         │  JSON   │  Port: 8080           │
└──────────────────────┘         └──────────┬───────────┘
                                            │ JPA/Hibernate
                                            ▼
                                 ┌──────────────────────┐
                                 │   MySQL Database      │
                                 │   (hospital_db)       │
                                 └──────────────────────┘
```

### 5.2 Layered Architecture (Backend)

```
┌─────────────────────────────────────────┐
│            Controller Layer             │  ← REST endpoints, request validation
├─────────────────────────────────────────┤
│             Service Layer               │  ← Business logic, transactions
├─────────────────────────────────────────┤
│           Repository Layer              │  ← Data access (Spring Data JPA)
├─────────────────────────────────────────┤
│             Entity Layer                │  ← JPA entities mapped to DB tables
├─────────────────────────────────────────┤
│               MySQL                     │  ← Persistent storage
└─────────────────────────────────────────┘

Cross-cutting concerns:
  ├── Security (JWT Filter, Spring Security)
  ├── Exception Handling (Global @RestControllerAdvice)
  ├── CORS Configuration
  └── API Documentation (Swagger / OpenAPI 3.0)
```

### 5.3 Frontend Architecture

```
┌─────────────────────────────────────────┐
│                App.jsx                  │  ← Router, AuthProvider, Layout
├─────────────────────────────────────────┤
│    Pages (Patient / Doctor / Admin)     │  ← Feature-specific views
├─────────────────────────────────────────┤
│          Components                     │  ← Navbar, Footer, Spinner, etc.
├─────────────────────────────────────────┤
│           Services                      │  ← Axios API calls
├─────────────────────────────────────────┤
│            Utils                        │  ← AuthContext, helpers, api.js
└─────────────────────────────────────────┘
```

### 5.4 Authentication Flow

```
Client                          Server
  │                               │
  ├── POST /api/auth/login ──────►│  Validate credentials
  │   { email, password, role }   │  Generate JWT (email + role + userId)
  │                               │
  │◄── { token, id, name, role } ─┤  Return JWT + user info
  │                               │
  │── GET /patients/{id} ────────►│  Extract JWT from Authorization header
  │   Authorization: Bearer <JWT> │  Verify signature + expiry
  │                               │  Check role permissions
  │◄── { patient data } ─────────┤  Return authorized data
```

---

## 6. Technology Stack

### 6.1 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 | Programming language |
| Spring Boot | 3.2.5 | Application framework |
| Spring Data JPA | 3.2.x | ORM / Data access |
| Spring Security | 6.x | Authentication & authorization |
| Spring Validation | 3.2.x | Request validation (@Valid, @Pattern) |
| Hibernate | 6.x | JPA implementation |
| MySQL | 8.x | Application database |
| JJWT | 0.12.5 | JWT token generation & parsing |
| Lombok | 1.18.x | Boilerplate code reduction |
| Springdoc OpenAPI | 2.5.0 | Swagger UI / API documentation |
| Maven | 3.9.x | Build tool & dependency management |

### 6.2 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI library |
| Vite | 5.4.x | Build tool & dev server |
| React Router | 6.x | Client-side routing |
| Axios | 1.7.x | HTTP client for API calls |
| Chart.js | 4.x | Admin dashboard charts |
| react-chartjs-2 | 5.x | React wrapper for Chart.js |
| react-toastify | 10.x | Toast notifications |
| react-icons | 5.x | Icon library (FontAwesome, Feather) |

### 6.3 Tools & Platforms

| Tool | Purpose |
|------|---------|
| VS Code | IDE |
| Git | Version control |
| Postman | API testing |
| Swagger UI | Interactive API documentation |
| MySQL Workbench | Database management |

---

## 7. Database Design

### 7.1 Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   patients   │       │   appointments   │       │   doctors    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ PK id        │       │ PK id            │       │ PK id        │
│    name      │◄──1:N─┤ FK patient_id    │  N:1─►│    name      │
│    age       │       │ FK doctor_id     │       │    email     │
│    gender    │       │    appointment_  │       │    password  │
│    phone     │       │      date        │       │    special-  │
│    email     │       │    slot_time     │       │      ization │
│    password  │       │    status        │       │    available_│
│    created_at│       │                  │       │      days    │
└──────────────┘       │ UK (doctor_id,   │       │    consult-  │
                       │    date, slot)   │       │    ation_time│
                       └────────┬─────────┘       └──────────────┘
                                │
                           1:1  │
                                ▼
                       ┌──────────────────┐       ┌──────────────┐
                       │     queue        │       │   admins     │
                       ├──────────────────┤       ├──────────────┤
                       │ PK id            │       │ PK id        │
                       │ FK appointment_id│       │    username  │
                       │    queue_number  │       │    password  │
                       │    priority_level│       │    role      │
                       │    estimated_time│       └──────────────┘
                       └──────────────────┘
```

### 7.2 Table Specifications

#### patients
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| age | INT | |
| gender | VARCHAR(50) | |
| phone | VARCHAR(20) | NOT NULL, UNIQUE |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt hashed) |
| created_at | DATETIME | Auto-set on creation |

#### doctors
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt hashed) |
| specialization | VARCHAR(255) | NOT NULL |
| available_days | VARCHAR(255) | e.g., "MONDAY,WEDNESDAY,FRIDAY" |
| consultation_time | INT | In minutes (e.g., 30) |

#### appointments
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| patient_id | BIGINT | FOREIGN KEY → patients(id), NOT NULL |
| doctor_id | BIGINT | FOREIGN KEY → doctors(id), NOT NULL |
| appointment_date | DATE | NOT NULL |
| slot_time | TIME | NOT NULL |
| status | VARCHAR(20) | NOT NULL, ENUM: BOOKED / WAITING / COMPLETED / CANCELLED |

**Unique Constraint:** `(doctor_id, appointment_date, slot_time)` — prevents double-booking

#### queue
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| appointment_id | BIGINT | FOREIGN KEY → appointments(id), UNIQUE, NOT NULL |
| queue_number | INT | NOT NULL |
| priority_level | INT | NOT NULL (0-10, higher = earlier) |
| estimated_time | INT | In minutes |

#### admins
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt hashed) |
| role | VARCHAR(50) | NOT NULL |

---

## 8. Module Description

### 8.1 Authentication Module

Handles user login across all three roles (Patient, Doctor, Admin). Uses email/username + password with BCrypt verification. On success, returns a JWT token containing the user's email, role, and ID. Tokens expire after 24 hours.

**Components:**
- `AuthController` — POST /api/auth/login endpoint
- `AuthService` — Multi-role credential validation
- `JwtTokenProvider` — Token generation and parsing
- `JwtAuthenticationFilter` — Request filter that extracts and validates JWT from headers

### 8.2 Patient Module

Enables patient registration and profile management.

**Components:**
- `PatientController` — Registration, profile retrieval, appointment history
- `PatientService` — Business logic with BCrypt password encoding
- Validation: Phone number pattern (`^\d{10}$`), email uniqueness, required fields

### 8.3 Doctor Module

Manages doctor profiles, specialization search, and schedule configuration.

**Components:**
- `DoctorController` — CRUD operations, specialization filter, slot management
- `DoctorService` — Doctor creation (admin-only), slot updates
- Admin creates doctors via POST /doctors; doctors update their own slots via PUT /doctors/slots/{id}

### 8.4 Appointment Module

Core module for booking, viewing, cancelling, and updating appointment status.

**Components:**
- `AppointmentController` — Book, list by doctor, cancel, update status
- `AppointmentService` — Validation (date not in past, doctor schedule check), conflict prevention, @Transactional operations
- Automatic queue entry creation on booking with priority-based ordering

### 8.5 Queue Module

Provides real-time queue tracking with priority-based ordering and estimated wait time calculation.

**Components:**
- `QueueController` — Queue status by doctor, wait time by appointment
- `QueueService` — Queue number assignment, wait time estimation based on consultation time × patients ahead
- Priority ordering: Higher priority patients appear earlier in queue

### 8.6 Admin Module

Administrative dashboard with hospital-wide analytics and appointment management.

**Components:**
- `AdminController` — All appointments, cancel any appointment, statistics
- `AdminService` — Dashboard stats (total patients/doctors/appointments, today's breakdown by status)
- Charts: Bar chart (overview counts) + Doughnut chart (today's status distribution)

---

## 9. API Endpoints

### 9.1 Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login with email/password/role, returns JWT |

### 9.2 Patient

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/patients/register` | Public | Register new patient |
| GET | `/patients/{id}` | Authenticated | Get patient profile |
| GET | `/patients/{id}/appointments` | Authenticated | Get patient's appointments |

### 9.3 Doctor

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/doctors` | Public | List all doctors |
| POST | `/doctors` | ADMIN | Add a new doctor |
| GET | `/doctors/specialization/{spec}` | Public | Filter doctors by specialization |
| PUT | `/doctors/slots/{id}` | DOCTOR, ADMIN | Update doctor's schedule |

### 9.4 Appointment

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/appointments/book` | Authenticated | Book a new appointment |
| GET | `/appointments/doctor/{id}` | Authenticated | List appointments for a doctor |
| DELETE | `/appointments/{id}` | Authenticated | Cancel an appointment |
| PATCH | `/appointments/{id}/status` | Authenticated | Update status (WAITING, COMPLETED, etc.) |

### 9.5 Queue

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/queue/status/{doctorId}` | Public | Get queue for a doctor |
| GET | `/queue/wait-time/{appointmentId}` | Public | Get estimated wait time |

### 9.6 Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/appointments` | ADMIN | Get all appointments |
| DELETE | `/admin/appointments/{id}` | ADMIN | Cancel any appointment |
| GET | `/admin/statistics` | ADMIN | Get dashboard statistics |

### 9.7 API Documentation

| URL | Description |
|-----|-------------|
| `/swagger-ui.html` | Interactive Swagger UI |
| `/v3/api-docs` | OpenAPI 3.0 JSON specification |

---

## 10. Implementation Details

### 10.1 Backend Project Structure

```
backend/
├── pom.xml
└── src/main/java/com/hospital/
    ├── HospitalApplication.java          # Main application class
    ├── config/
    │   ├── SecurityConfig.java           # Spring Security configuration
    │   ├── CorsConfig.java               # CORS settings
    │   └── OpenApiConfig.java            # Swagger/OpenAPI configuration
    ├── security/
    │   ├── JwtTokenProvider.java          # JWT generation & validation
    │   └── JwtAuthenticationFilter.java   # HTTP request filter
    ├── entity/
    │   ├── Patient.java                   # Patient entity
    │   ├── Doctor.java                    # Doctor entity
    │   ├── Appointment.java               # Appointment entity
    │   ├── Queue.java                     # Queue entity
    │   └── Admin.java                     # Admin entity
    ├── repository/
    │   ├── PatientRepository.java
    │   ├── DoctorRepository.java
    │   ├── AppointmentRepository.java
    │   ├── QueueRepository.java
    │   └── AdminRepository.java
    ├── dto/
    │   ├── ApiResponse.java               # Unified response wrapper
    │   ├── LoginRequest.java
    │   ├── AuthResponse.java
    │   ├── PatientRegisterRequest.java
    │   ├── PatientResponse.java
    │   ├── DoctorRequest.java
    │   ├── DoctorResponse.java
    │   ├── DoctorSlotsUpdateRequest.java
    │   ├── AppointmentBookRequest.java
    │   ├── AppointmentResponse.java
    │   ├── QueueResponse.java
    │   ├── WaitTimeResponse.java
    │   └── DashboardStats.java
    ├── service/
    │   ├── AuthService.java
    │   ├── PatientService.java
    │   ├── DoctorService.java
    │   ├── AppointmentService.java
    │   ├── QueueService.java
    │   └── AdminService.java
    ├── controller/
    │   ├── AuthController.java
    │   ├── PatientController.java
    │   ├── DoctorController.java
    │   ├── AppointmentController.java
    │   ├── QueueController.java
    │   └── AdminController.java
    └── exception/
        ├── GlobalExceptionHandler.java    # @RestControllerAdvice
        ├── ResourceNotFoundException.java
        ├── BadRequestException.java
        └── SlotConflictException.java
```

### 10.2 Frontend Project Structure

```
frontend/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx                           # React entry point
    ├── App.jsx                            # Router + Layout + Auth
    ├── index.css                          # Global styles (~1100 lines)
    ├── components/
    │   ├── Navbar.jsx                     # Navigation with city selector
    │   ├── Footer.jsx                     # Site footer
    │   ├── LoadingSpinner.jsx             # Reusable loading indicator
    │   ├── ProtectedRoute.jsx             # Role-based route guard
    │   └── CitySelector.jsx              # BookMyShow-style city picker
    ├── pages/
    │   ├── Home.jsx                       # Landing page (Practo-style)
    │   ├── Login.jsx                      # Multi-role login
    │   ├── Register.jsx                   # Patient registration
    │   ├── DoctorsList.jsx                # Public doctor directory
    │   ├── patient/
    │   │   ├── BookAppointment.jsx        # Doctor → Date → Slot picker
    │   │   ├── AppointmentHistory.jsx     # Patient's appointment table
    │   │   └── QueueStatus.jsx            # Live queue with polling
    │   ├── doctor/
    │   │   ├── DoctorDashboard.jsx        # Doctor's stats + today's appts
    │   │   ├── DoctorAppointments.jsx     # Filter + status actions
    │   │   └── ManageSlots.jsx            # Day picker + consultation time
    │   └── admin/
    │       ├── AdminDashboard.jsx         # Charts + stat cards
    │       ├── AdminAppointments.jsx      # All appointments management
    │       └── ManageDoctors.jsx          # Add + view doctors
    ├── services/
    │   ├── authService.js
    │   ├── patientService.js
    │   ├── doctorService.js
    │   ├── appointmentService.js
    │   ├── queueService.js
    │   └── adminService.js
    └── utils/
        ├── api.js                         # Axios instance + JWT interceptor
        ├── AuthContext.jsx                # React context for auth state
        └── helpers.js                     # formatDate, generateTimeSlots, etc.
```

### 10.3 Key Implementation Patterns

#### Unified API Response

All backend endpoints return:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

#### Global Exception Handling

The `GlobalExceptionHandler` translates exceptions to consistent HTTP responses:
- `ResourceNotFoundException` → 404
- `BadRequestException` → 400
- `SlotConflictException` → 409
- Validation errors → 400 with field-level messages
- `DataIntegrityViolationException` → 409

#### JWT Authentication Flow

1. Login validates credentials against the appropriate table (patients/doctors/admins)
2. JWT token is generated with claims: `sub` (email), `role`, `userId`
3. Frontend stores token in localStorage
4. Axios interceptor attaches `Authorization: Bearer <token>` to every request
5. `JwtAuthenticationFilter` extracts, validates, and sets `SecurityContext`
6. 401 responses trigger automatic logout on frontend

#### Queue Priority Algorithm

When an appointment is booked:
1. Queue number is assigned as `max(existing queue numbers for doctor on date) + 1`
2. Estimated wait time = `patients_ahead × doctor.consultationTime` minutes
3. Queue is ordered by `priorityLevel DESC, queueNumber ASC`
4. Cancellation removes both appointment and queue entry

---

## 11. Security Implementation

### 11.1 Authentication

- **Password Hashing:** BCrypt with auto-generated salt
- **JWT Tokens:** HS256 signing with configurable secret key, 24-hour expiry
- **Stateless Sessions:** No server-side session storage; each request carries its own JWT

### 11.2 Authorization

| Role | Permissions |
|------|-------------|
| PUBLIC | Login, register, view doctors/queue, Swagger docs |
| PATIENT | Book/cancel appointments, view history, check queue |
| DOCTOR | View/manage own appointments, update schedule/slots |
| ADMIN | All doctor management, view/cancel any appointment, dashboard statistics |

### 11.3 Security Configuration

- CSRF disabled (stateless JWT architecture)
- CORS configured for frontend origin
- Role-based endpoint restrictions via `SecurityFilterChain`
- Method-level security via `@PreAuthorize` annotations
- Swagger endpoints explicitly permitted for documentation access

### 11.4 Frontend Security

- JWT stored in localStorage with auto-cleanup on expiry
- `ProtectedRoute` component blocks unauthorized navigation
- 401 responses trigger automatic logout and redirect to login
- Role-based menu rendering (patients see patient menu, etc.)

---

## 12. Screenshots / UI Walkthrough

> **Note:** Run the application and capture screenshots for the following pages.

### Pages to Screenshot

1. **Home Page** — Hero section with search bar, service cards (Book Appointment, Find Doctors, Queue Status, My Appointments)
2. **City Selector** — BookMyShow-style modal with popular cities grid and searchable list
3. **Login Page** — Role selector (Patient/Doctor/Admin), email, password fields
4. **Registration Page** — Patient registration form with all fields
5. **Doctors List** — Grid of doctor cards with search filter
6. **Book Appointment** — Two-panel layout: doctor selection (left) and date/slot picker (right)
7. **Appointment History** — Patient's appointments table with cancel buttons
8. **Queue Status** — Doctor selector with live queue cards showing position and wait time
9. **Doctor Dashboard** — Stats cards + today's appointments
10. **Doctor Appointments** — Filtered appointment list with status action buttons
11. **Manage Slots** — Day selection checkboxes + consultation time input
12. **Admin Dashboard** — Stat cards + Bar chart + Doughnut chart
13. **Admin Appointments** — All appointments with filter tabs and cancel actions
14. **Manage Doctors** — Add doctor form + doctor cards grid
15. **Swagger UI** — Interactive API documentation at `/swagger-ui.html`

---

## 13. Testing

### 13.1 API Testing (Postman / Swagger)

| Test Case | Endpoint | Expected Result |
|-----------|----------|-----------------|
| Patient Registration | POST /patients/register | 201 Created, patient object returned |
| Duplicate Email Registration | POST /patients/register | 409 Conflict |
| Patient Login | POST /api/auth/login | 200 OK, JWT + user info returned |
| Invalid Login | POST /api/auth/login | 400 Bad Request, error message |
| List All Doctors | GET /doctors | 200 OK, array of doctors |
| Book Appointment | POST /appointments/book | 200 OK, appointment + queue created |
| Book Duplicate Slot | POST /appointments/book | 409 Slot Conflict |
| Book Past Date | POST /appointments/book | 400 Bad Request |
| Cancel Appointment | DELETE /appointments/{id} | 200 OK, status set to CANCELLED |
| Get Queue Status | GET /queue/status/{doctorId} | 200 OK, priority-ordered queue |
| Get Wait Time | GET /queue/wait-time/{apptId} | 200 OK, estimated minutes |
| Admin Statistics | GET /admin/statistics | 200 OK, all stat fields populated |
| Unauthorized Access | GET /admin/statistics (no JWT) | 401 Unauthorized |
| Wrong Role Access | GET /admin/statistics (PATIENT JWT) | 403 Forbidden |

### 13.2 Frontend Testing

| Test Case | Page | Expected Behavior |
|-----------|------|-------------------|
| Login as Patient | Login | Redirects to /patient/book |
| Login as Doctor | Login | Redirects to /doctor/dashboard |
| Login as Admin | Login | Redirects to /admin/dashboard |
| Book Appointment | BookAppointment | Shows available slots, blocks booked ones |
| Cancel Appointment | AppointmentHistory | Appointment status changes to CANCELLED |
| Queue Auto-Refresh | QueueStatus | Queue updates every 15 seconds |
| City Selection | CitySelector | Selected city shows in Navbar and Home |
| Protected Route | Any protected page | Redirects to /login if not authenticated |
| Responsive Layout | All pages | Layouts adapt for mobile (< 640px) |

---

## 14. Future Enhancements

1. **Email/SMS Notifications** — Send appointment confirmations and queue position updates via email or SMS
2. **Payment Integration** — Integrate Razorpay/Stripe for consultation fee payment
3. **Telemedicine Module** — Add video consultation capabilities using WebRTC
4. **Patient Medical Records** — Digital health records attached to patient profiles
5. **Doctor Ratings & Reviews** — Patient feedback system after consultation
6. **Appointment Rescheduling** — Allow patients to reschedule without cancelling
7. **Multi-Hospital Support** — Extend the system for hospital chains
8. **Push Notifications** — Browser push notifications for queue position updates
9. **Analytics Reports** — Exportable PDF/Excel reports for administrators
10. **PWA Support** — Progressive Web App for offline access and mobile home screen installation

---

## 15. Conclusion

The **Hospital Appointment & Queue Optimization System** successfully demonstrates a full-stack web application that solves real-world problems in hospital management. The system provides:

- **Efficient appointment booking** with automated slot conflict prevention
- **Real-time queue monitoring** with priority-based ordering
- **Role-based access control** ensuring data security and appropriate permissions
- **Analytics dashboard** for hospital administrators
- **Modern, responsive UI** accessible from any device

The project implements industry-standard practices including:
- RESTful API design with consistent response formatting
- JWT-based stateless authentication
- Layered architecture (Controller → Service → Repository)
- Input validation at both frontend and backend
- Global exception handling
- Interactive API documentation via Swagger/OpenAPI

The application is production-ready with MySQL database support for both development and production deployments, making it suitable for deployment on cloud platforms.

---

## 16. References

1. Spring Boot Documentation — https://docs.spring.io/spring-boot/docs/current/reference/html/
2. React Documentation — https://react.dev/
3. Spring Security Reference — https://docs.spring.io/spring-security/reference/
4. JWT Introduction — https://jwt.io/introduction
5. Springdoc OpenAPI — https://springdoc.org/
6. Vite Documentation — https://vitejs.dev/
7. Chart.js Documentation — https://www.chartjs.org/docs/
8. MySQL Reference Manual — https://dev.mysql.com/doc/refman/8.0/en/
9. Axios HTTP Client — https://axios-http.com/docs/intro
10. React Router Documentation — https://reactrouter.com/

---

**Project Title:** Hospital Appointment & Queue Optimization System  
**Technology:** Spring Boot 3.2.5 + React 18 + MySQL  
**Developed By:** [Student Name]  
**Academic Year:** 2024-2025
