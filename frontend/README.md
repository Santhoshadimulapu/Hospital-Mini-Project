# 💻 Hospital Frontend — React 18 + Vite 5

A modern, responsive web application for hospital appointment management and queue tracking, built with React and optimized for production with Vite.

## 📋 Prerequisites

- **Node.js 18+** and **npm 9+**
- **Vite 5.x** (bundled)
- **Backend API** running (typically `http://localhost:8080`)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
# Edit .env to set VITE_API_BASE_URL if backend is on different host
```

### 3. Start Development Server
```bash
npm run dev
```

**Frontend runs at**: `http://localhost:5173`

---

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── CitySelector.jsx         # City filter dropdown
│   │   ├── Footer.jsx               # Page footer
│   │   ├── LoadingSpinner.jsx       # Loading indicator
│   │   ├── Navbar.jsx               # Navigation bar with auth
│   │   └── ProtectedRoute.jsx       # Route guard for auth
│   ├── pages/                       # Page components (routes)
│   │   ├── DoctorsList.jsx          # Doctor directory
│   │   ├── Home.jsx                 # Landing page
│   │   ├── HospitalDetail.jsx       # Hospital detail view
│   │   ├── HospitalSearch.jsx       # Hospital & doctor search
│   │   ├── Login.jsx                # Login form
│   │   ├── Register.jsx             # Patient registration
│   │   ├── ReportView.jsx           # Medical report view
│   │   ├── SymptomAssistant.jsx     # AI symptom checker
│   │   ├── admin/                   # Admin pages
│   │   │   ├── AdminAppointments.jsx
│   │   │   ├── AdminDashboard.jsx   # Analytics dashboard
│   │   │   └── ManageDoctors.jsx
│   │   │   └── ManageHospitals.jsx
│   │   ├── doctor/                  # Doctor pages
│   │   │   ├── DoctorAppointments.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── ManageSlots.jsx
│   │   │   └── MedicalReportForm.jsx
│   │   └── patient/                 # Patient pages
│   │       ├── AccountSettings.jsx
│   │       ├── AppointmentHistory.jsx
│   │       ├── BookAppointment.jsx
│   │       ├── PatientProfile.jsx
│   │       └── QueueStatus.jsx
│   ├── services/                    # API service modules
│   │   ├── adminService.js          # Admin API calls
│   │   ├── aiService.js             # AI symptom API
│   │   ├── appointmentService.js    # Appointment CRUD
│   │   ├── authService.js           # Login/auth
│   │   ├── doctorService.js         # Doctor API
│   │   ├── hospitalService.js       # Hospital API
│   │   ├── patientService.js        # Patient API
│   │   ├── queueService.js          # Queue status API
│   │   └── reportService.js         # Report API
│   ├── utils/                       # Utility modules
│   │   ├── api.js                   # Axios instance & interceptors
│   │   ├── AuthContext.jsx          # Global auth state (Context API)
│   │   └── helpers.js               # Date, format, validation helpers
│   ├── App.jsx                      # Root component with routing
│   ├── index.css                    # Global styles
│   └── main.jsx                     # Vite entry point
├── public/                          # Static assets
│   └── index.html                   # Main HTML page
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite configuration (chunk splitting)
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

---

## ⚙️ Configuration & Environment Variables

### Development (Default: `http://localhost:8080`)

No configuration needed if backend is on localhost:8080.

### Production (`.env`):

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

The environment variable is read at **build time** (Vite preprocessor) and embedded into the bundle. No runtime configuration needed.

---

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Output: `dist/` folder with optimized bundle

**Build Optimizations**:
- ✅ Automatic code splitting (jspdf-vendor, html2canvas, charts, react-vendor)
- ✅ Minification and tree-shaking
- ✅ Source maps disabled in production
- ✅ ~250KB gzipped main bundle

### Preview Production Build Locally
```bash
npm run preview
```

Runs production build on `http://localhost:5173` to verify before deploy.

---

## 🌐 Deployment to Vercel

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Import in Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Select GitHub repository
4. Set **Root Directory** to `frontend`
5. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://your-render-backend.onrender.com
   ```
6. Click **Deploy**

### Build Settings (Auto-Detected)
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 🔐 Authentication & Security

### JWT Token Handling
- Login response includes JWT token in `Authorization` header
- Token stored in `localStorage` (frontend) / memory
- Included in all API requests via Axios interceptor

### Protected Routes
```jsx
<ProtectedRoute allowedRoles={["PATIENT"]}>
  <BookAppointment />
</ProtectedRoute>
```

### Role-Based Access
```
PATIENT  → /patient/*
DOCTOR   → /doctor/*
ADMIN    → /admin/*
PUBLIC   → /home, /search, /doctors, /login, /register
```

### Automatic Logout
- If JWT expires → automatic redirect to login
- Invalid token → auto-refresh attempt
- On logout → token cleared from storage

---

## 🎨 Key UI Pages & Features

### Public Pages
| Page | Path | Description |
|------|------|-------------|
| **Home** | `/` | Landing page with search |
| **Hospital Search** | `/search` | Search hospitals by city, doctor specialization |
| **Doctors Directory** | `/doctors` | Browse all doctors |
| **Login** | `/login` | User authentication |
| **Register** | `/register` | Patient registration |

### Patient Pages
| Page | Path | Description |
|------|------|-------------|
| **Patient Dashboard** | `/patient/dashboard` | Overview & quick access |
| **Book Appointment** | `/patient/book` | Search doctors & book slots |
| **Appointments** | `/patient/appointments` | View & manage bookings |
| **Queue Status** | `/patient/queue` | Live queue tracking (wait time estimation) |
| **Profile** | `/patient/profile` | Account & medical history |
| **Reports** | `/patient/reports` | View medical reports |
| **AI Symptom Assistant** | `/symptom-assistant` | AI-powered symptom checker |

### Doctor Pages
| Page | Path | Description |
|------|------|-------------|
| **Doctor Dashboard** | `/doctor/dashboard` | Overview & stats |
| **Manage Slots** | `/doctor/slots` | Update availability & timings |
| **Appointments** | `/doctor/appointments` | View scheduled appointments |
| **Medical Reports** | `/doctor/reports` | Upload/view patient reports |

### Admin Pages
| Page | Path | Description |
|------|------|-------------|
| **Admin Dashboard** | `/admin/dashboard` | Analytics & key metrics |
| **Manage Doctors** | `/admin/doctors` | CRUD operations on doctors |
| **Manage Hospitals** | `/admin/hospitals` | Hospital management |
| **Appointments** | `/admin/appointments` | Global appointment oversight |

---

## 🔌 API Integration

### API Service Pattern

Each service module provides a clean interface:

```javascript
// Example: appointmentService.js
export const bookAppointment = async (appointmentData) => {
  return await api.post('/appointments/book', appointmentData);
};

export const getPatientAppointments = async (patientId) => {
  return await api.get(`/appointments/patient/${patientId}`);
};
```

### Usage in Components

```jsx
import { bookAppointment } from '../services/appointmentService';

const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleBook = async (data) => {
  try {
    setLoading(true);
    const response = await bookAppointment(data);
    console.log('Booked:', response.data);
  } catch (err) {
    setError(err.response?.data?.message || 'Booking failed');
  } finally {
    setLoading(false);
  }
};
```

---

## 📊 State Management

### Global Auth Context
```javascript
// utils/AuthContext.jsx
const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Access in components:
const { user, token, login, logout } = useAuth();
```

### Local Component State
- Forms use `useState` for input state
- API responses stored in local component state
- Derived state (filtered lists, totals) computed locally

### No External State Management
- Kept simple with React Context API
- No Redux/MobX dependency overhead

---

## 🧑‍💼 Component Overview

### Navbar Component
- Displays user name & role
- Login/logout links
- Navigation menu based on role

### ProtectedRoute Component
```jsx
// Usage
<ProtectedRoute allowedRoles={["ADMIN", "DOCTOR"]}>
  <AdminDashboard />
</ProtectedRoute>

// Redirects unauthenticated users to /login
```

### LoadingSpinner Component
- Displays during API calls
- Centered, non-blocking overlay

### CitySelector Component
- Dropdown filter for hospital search
- Populated from hospital data

---

## 🧪 Testing

### Unit Tests (if configured)
```bash
npm run test
```

### Manual Testing Workflow
1. Start backend: `mvn spring-boot:run` (port 8080)
2. Start frontend: `npm run dev` (port 5173)
3. Test user flows:
   - Register patient
   - Search hospitals & doctors
   - Book appointment
   - View queue status
   - Login as doctor & update slots

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format  # If prettier configured
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Backend connection refused** | Ensure backend is running on `http://localhost:8080`, or set `VITE_API_BASE_URL` |
| **CORS errors** | Check backend `CORS_ORIGINS` includes frontend URL |
| **Blank page** | Open browser DevTools (F12) → Console tab for errors |
| **Slow page load** | Check Network tab for slow API calls, verify backend response |
| **Login not working** | Verify JWT token saved in localStorage, check browser console |
| **Not finding components** | Check import paths use correct relative paths |
| **Build fails** | Run `npm cache clean --force`, then `npm install`, then `npm run build` |

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Uses ES2020 syntax (Vite default).

---

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | 18.3 | UI library |
| **react-router** | 6.x | Client-side routing |
| **axios** | 1.7 | HTTP client |
| **vite** | 5.4 | Build tool & dev server |
| **chart.js** | Latest | Admin dashboard charts |
| **jspdf** | Latest | Medical report PDF generation |
| **html2canvas** | Latest | Report screenshot capture |

---

## 🎯 Performance Optimization

### Vite Bundle Splitting
```javascript
// vite.config.js
manualChunks: {
  'jspdf-vendor': ['jspdf', 'html2canvas'],
  'charts': ['chart.js'],
  'react-vendor': ['react', 'react-dom', 'react-router']
}
```

Results:
- Main bundle: ~250KB gzipped
- Vendors loaded on-demand
- Faster initial page load

### Image Optimization
- Use WebP format where possible
- Lazy load non-critical images
- Optimize SVG assets

---

## 🔗 API Endpoints Used

See [Backend README](../backend/README.md) for complete API documentation.

**Common endpoints**:
```
POST   /api/auth/login
POST   /patients/register
GET    /doctors
POST   /appointments/book
GET    /queue/status/{doctorId}
GET    /admin/statistics
```

---

## 🌍 Deployment Environments

### Local Development
```
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```

### Production (Vercel + Render)
```
Frontend: https://your-app.vercel.app
Backend:  https://your-render-backend.onrender.com
```

Set `VITE_API_BASE_URL` to backend URL in Vercel dashboard.

---

## 📝 Best Practices

- ✅ Use components for reusable UI
- ✅ Keep API calls in service modules
- ✅ Handle errors with user-friendly messages
- ✅ Validate form inputs before submission
- ✅ Show loading states during API calls
- ✅ Clear sensitive data on logout
- ✅ Use meaningful component & function names
- ✅ Extract magic strings/numbers to constants

---

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
- [React Router Documentation](https://reactrouter.com)
- [Backend API Docs](../backend/README.md)

---

**Last Updated**: March 2026  
**React Version**: 18.3.1  
**Vite Version**: 5.4.x  
**Status**: Production-Ready
