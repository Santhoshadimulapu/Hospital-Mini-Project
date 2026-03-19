# 🏥 Hospital Appointment & Queue Management System

A full-stack hospital platform enabling seamless patient registration, doctor discovery, appointment booking, and intelligent queue management with AI-powered symptom assistance.

## ✨ Key Features

- **Patient Portal**: Registration, profile management, appointment booking, medical reports
- **Doctor Dashboard**: Slot management, appointment handling, medical record access
- **Admin Dashboard**: Hospital/doctor management, analytics, appointment oversight
- **Intelligent Queue System**: Priority-based queue with wait time estimation
- **AI Symptom Assistant**: AI-powered symptom checker (Hugging Face integration)
- **SMS Notifications**: Appointment reminders and updates (Twilio integration)
- **Hospital Search**: City-based hospital and doctor discovery
- **Secure Authentication**: JWT-based role-based access control (RBAC)

---

## 🛠️ Tech Stack

### Backend
- **Java 21** (LTS)
- **Spring Boot 3.2.5** with Spring Security 6.x
- **Spring Data JPA** with Hibernate 6.4.4
- **MySQL 8.0+** (primary database)
- **JWT** (io.jsonwebtoken 0.12.5) for stateless authentication
- **Maven 3.9+** for build management

### Frontend
- **React 18.3.1** with React Router
- **Vite 5.4** (build tool with optimized chunking)
- **Axios 1.7.x** for HTTP requests
- **Chart.js** for admin dashboard analytics
- **jsPDF + html2canvas** for report generation
- **TailwindCSS** (if styling framework used)

### Database & Deployment
- **MySQL 8.0+** (local dev, Railway production)
- **Render** (backend deployment, Docker)
- **Vercel** (frontend deployment)
- **H2 In-Memory** (testing with MySQL-compatible mode)

---

## 📁 Project Structure

```
Hospital Mini Project/
├── backend/                              # Spring Boot API
│   ├── src/main/java/com/hospital/      # Application code
│   │   ├── config/                       # Security, CORS, OpenAPI, data seeding
│   │   ├── controller/                   # REST endpoints
│   │   ├── dto/                          # Data transfer objects
│   │   ├── entity/                       # JPA entities
│   │   ├── repository/                   # Data access layer
│   │   ├── security/                     # JWT, auth filters
│   │   └── service/                      # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties        # Dev config (env vars)
│   │   ├── application-prod.properties   # Prod config (Railway MySQL)
│   │   └── application-test.properties   # Test config (H2)
│   ├── src/test/java/                    # Unit tests (@ActiveProfiles("test"))
│   ├── pom.xml                           # Maven dependencies
│   ├── Dockerfile                        # Container image
│   ├── .env.example                      # Environment variables template
│   └── README.md                         # Backend-specific setup
├── frontend/                             # React + Vite
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   ├── pages/                        # Page/route components
│   │   ├── services/                     # API service modules
│   │   ├── utils/                        # API client, auth context, helpers
│   │   ├── App.jsx                       # Root component
│   │   └── main.jsx                      # Entry point
│   ├── public/                           # Static assets
│   ├── package.json                      # Dependencies, build scripts
│   ├── vite.config.js                    # Build optimization (chunk splitting)
│   ├── .env.example                      # Environment variables template
│   └── README.md                         # Frontend-specific setup
├── render.yaml                           # Render deployment blueprint
├── .gitignore                            # Excludes .env, secrets, build artifacts
├── README.md                             # This file
└── PROJECT_REPORT.md                     # Architecture & tech decisions
```

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** (for backend)
- **Node.js 18+** & **npm 9+** (for frontend)
- **MySQL 8.0+** (local development)
- **Maven 3.9+** (for backend build)

### 1️⃣ Backend Setup

```bash
# Clone and navigate
cd Hospital\ Mini\ Project/backend

# Copy environment template and configure
cp .env.example .env
# Edit .env with your MySQL credentials (for local dev, using defaults is fine)

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

**Health Check**: `curl http://localhost:8080/actuator/health`

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Copy environment template (optional for local dev)
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Database Setup (Local)

```bash
# Create database in MySQL CLI
mysql -u root -p
CREATE DATABASE hospital_db;
EXIT;
```

On first backend run, the `DataSeeder` automatically populates demo data (hospitals, doctors) for development.

---

## 🔐 Security & Configuration

### Environment Variables

**Backend** (see `backend/.env.example`):
```
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/hospital_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=

JWT_SECRET=your-secret-key-32-characters-minimum-required
JWT_EXPIRATION_HOURS=24

CORS_ORIGINS=http://localhost:5173

# Optional: AI & SMS features
HF_API_KEY=your-huggingface-api-key
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
SMS_ENABLED=false

# For local dev
APP_SEED_ENABLED=true
SPRING_PROFILES_ACTIVE=dev
```

**Frontend** (see `frontend/.env.example`):
```
VITE_API_BASE_URL=http://localhost:8080
```

### Security Highlights
✅ **JWT Validation**: Secret length enforced (min 32 chars) at startup  
✅ **Password Hashing**: Bcrypt with configurable strength  
✅ **CORS Protected**: Configurable origins per environment  
✅ **H2 Test Database**: Isolated test profile, no external DB dependency  
✅ **Production-Safe Seeding**: Disabled in prod, configurable via `APP_SEED_ENABLED`  
✅ **No Hardcoded Secrets**: All credentials externalized to environment variables  

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login                      # Login (email, password, role)
```

### Patient APIs
```
POST   /patients/register                   # Register new patient
GET    /patients/{id}                       # Get patient profile
GET    /patients/{id}/appointments          # Patient's appointments
PUT    /patients/{id}                       # Update profile
```

### Doctor APIs  
```
GET    /doctors                             # All doctors
GET    /doctors/{id}                        # Doctor details
GET    /doctors/specialization/{spec}       # Filter by specialization
PUT    /doctors/slots/{id}                  # Update availability
```

### Appointment APIs
```
POST   /appointments/book                   # Book appointment
GET    /appointments/doctor/{id}            # Doctor's appointments
GET    /appointments/patient/{id}           # Patient's appointments
PATCH  /appointments/{id}/status            # Update status
DELETE /appointments/{id}                   # Cancel appointment
```

### Queue APIs
```
GET    /queue/status/{doctorId}             # Current queue status
GET    /queue/wait-time/{appointmentId}     # Estimated wait time
```

### Admin APIs
```
GET    /admin/appointments                  # All appointments
GET    /admin/statistics                    # Dashboard analytics
DELETE /admin/appointments/{id}             # Cancel appointment
```

See `backend/README.md` for detailed endpoint documentation.

---

## 🌐 Production Deployment

### Recommended Setup: Railway MySQL + Render Backend + Vercel Frontend

#### Step 1: Provision Railway MySQL Database
1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add MySQL plugin
3. Copy connection variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

#### Step 2: Deploy Backend (Render)
1. Push this repo to GitHub
2. Sign up at [render.com](https://render.com)
3. Create **New** → **Blueprint** deploy
4. Connect GitHub repo, set root dir to `backend`
5. Add these environment variables:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | `<MYSQLHOST from Railway>` |
| `DB_PORT` | `<MYSQLPORT from Railway>` |
| `DB_NAME` | `<MYSQLDATABASE from Railway>` |
| `DB_USER` | `<MYSQLUSER from Railway>` |
| `DB_PASSWORD` | `<MYSQLPASSWORD from Railway>` |
| `JWT_SECRET` | `<generate 32+ char random secret>` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `APP_SEED_ENABLED` | `false` |
| `HF_API_KEY` | `<if using AI features>` |
| `SMS_ENABLED` | `false` (enable only if Twilio configured) |

6. Deploy → Note the backend URL (e.g., `https://hospital-backend.onrender.com`)

#### Step 3: Deploy Frontend (Vercel)
1. Sign up at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://hospital-backend.onrender.com`
5. Deploy

#### Step 4: Verify
```bash
# Health check — backend should return {"status":"UP"}
curl https://hospital-backend.onrender.com/actuator/health

# Frontend should load Hospital Management System UI
open https://your-app.vercel.app
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests (uses H2 in-memory database)
mvn test

# Run specific test
mvn test -Dtest=HospitalBackendApplicationTests

# Run with coverage
mvn clean test jacoco:report
```

### Frontend Tests
```bash
cd frontend

# Run Vitest or Jest (if configured)
npm run test
```

Tests use isolated profiles (backend: `@ActiveProfiles("test")`, frontend: local H2 database) and do not require external services.

---

## 🐳 Docker & Local Deployment

### Build Docker Image
```bash
cd backend
docker build -t hospital-backend:latest .
```

### Run with Docker Compose (recommended)
```bash
docker-compose up -d
# Starts: backend (port 8080) + MySQL (port 3306)
```

### Run Standalone
```bash
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=hospital_db \
  -e DB_USER=root \
  -e DB_PASSWORD=yourpassword \
  -e JWT_SECRET=your-32-char-minimum-secret \
  hospital-backend:latest
```

---

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Clean build
mvn clean install

# Run locally
mvn spring-boot:run

# Package for deployment
mvn -DskipTests clean package

# Run tests
mvn test

# Format code
mvn spotless:apply
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📋 Database Schema

### Entities
- **Patient** → User registration, contact, appointments
- **Doctor** → Specialization, hospital assignment, availability slots
- **Hospital** → Location, contact, associated doctors
- **Appointment** → Booking, status tracking, patient-doctor pairing
- **Queue** → Queue number, priority level, wait time estimation
- **Admin** → Administrative user with full access

See `backend/README.md` for detailed schema documentation and demo data.

---

## ⚠️ Important Security Notes

### Secrets Management
- ❌ **Never commit** `.env` files, API keys, or database passwords
- ✅ **Always use** environment variables for sensitive data
- ✅ **Rotate compromised credentials** immediately if exposed
- ✅ **Use strong JWT secrets** (minimum 32 characters, random)

### Production Best Practices
- Set `APP_SEED_ENABLED=false` (prevents demo data insertion)
- Use `SPRING_PROFILES_ACTIVE=prod` on production servers
- Enable CORS only for your frontend domain
- Use HTTPS/SSL for all connections to production
- Keep `JWT_SECRET` in a secure vault (not in repos or logs)
- Monitor `/actuator/health` endpoint for uptime alerts

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check MySQL is running: `mysql --version`
- Verify `JWT_SECRET` is set and >= 32 characters
- Check logs: `mvn spring-boot:run` shows detailed error messages

### Frontend Can't Connect to Backend
- Verify backend is running: `curl http://localhost:8080/actuator/health`
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check CORS_ORIGINS in backend matches frontend URL

### Tests Fail
- Ensure H2 is included in `pom.xml` (test scope)
- Run with `@ActiveProfiles("test")` to use H2 database
- Clear Maven cache: `mvn clean`

### Deployment Issues on Render
- Check health endpoint responds: `https://your-backend.onrender.com/actuator/health`
- Verify all required env vars are set in Render dashboard
- Check Railway MySQL is reachable from Render region
- Review Render deployment logs for errors

---

## 📚 Additional Resources

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Project Report & Architecture Decisions](./PROJECT_REPORT.md)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

---

## 👥 Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Patient** | Register, book appointments, view own records |
| **Doctor** | View appointments, manage slots, update availability |
| **Admin** | Full access: manage doctors, hospitals, view analytics |

---

## 📝 License & Attribution

This is an educational hospital management project. Built with Java, Spring Boot, React, and Vite.

---

**Last Updated**: March 2026  
**Status**: Production-Ready with MySQL, Render, Railway, Vercel integration
