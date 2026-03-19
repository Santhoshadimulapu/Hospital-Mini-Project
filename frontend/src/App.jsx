import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './utils/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CitySelector from './components/CitySelector';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import HospitalSearch from './pages/HospitalSearch';
import HospitalDetail from './pages/HospitalDetail';
import SymptomAssistant from './pages/SymptomAssistant';

// Patient pages
import BookAppointment from './pages/patient/BookAppointment';
import AppointmentHistory from './pages/patient/AppointmentHistory';
import QueueStatus from './pages/patient/QueueStatus';
import PatientProfile from './pages/patient/PatientProfile';
import AccountSettings from './pages/patient/AccountSettings';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import ManageSlots from './pages/doctor/ManageSlots';
import MedicalReportForm from './pages/doctor/MedicalReportForm';

// Report view (shared by doctor & patient)
import ReportView from './pages/ReportView';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageHospitals from './pages/admin/ManageHospitals';

const resolveCityFromCoords = async (latitude, longitude) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }

  const data = await response.json();
  const address = data?.address || {};

  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    ''
  );
};

const getBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });

export default function App() {
  const [city, setCity] = useState(() => localStorage.getItem('selectedCity') || '');
  const [showCityModal, setShowCityModal] = useState(false);

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    localStorage.setItem('selectedCity', selectedCity);
    setShowCityModal(false);
  };

  useEffect(() => {
    let cancelled = false;

    const autoDetectAndSaveCity = async () => {
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        setShowCityModal(false);
        return;
      }

      try {
        const position = await getBrowserLocation();
        const detectedCity = await resolveCityFromCoords(
          position.coords.latitude,
          position.coords.longitude
        );

        if (!cancelled && detectedCity) {
          handleCitySelect(detectedCity);
        } else if (!cancelled) {
          setShowCityModal(true);
        }
      } catch (error) {
        if (!cancelled) {
          setShowCityModal(true);
        }
      }
    };

    autoDetectAndSaveCity();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {showCityModal && <CitySelector onSelect={handleCitySelect} />}
        <Navbar city={city} onCityClick={() => setShowCityModal(true)} />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home city={city} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors-list" element={<DoctorsList />} />
          <Route path="/hospitals" element={<HospitalSearch />} />
          <Route path="/hospitals/:id" element={<HospitalDetail />} />
          <Route path="/ai/symptoms" element={<SymptomAssistant />} />

          {/* Patient */}
          <Route path="/patient/book" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><BookAppointment /></ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><AppointmentHistory /></ProtectedRoute>
          } />
          <Route path="/patient/queue" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><QueueStatus /></ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><PatientProfile /></ProtectedRoute>
          } />
          <Route path="/patient/account" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><AccountSettings /></ProtectedRoute>
          } />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorAppointments /></ProtectedRoute>
          } />
          <Route path="/doctor/slots" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}><ManageSlots /></ProtectedRoute>
          } />
          <Route path="/doctor/report/:appointmentId" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}><MedicalReportForm /></ProtectedRoute>
          } />

          {/* Report View (accessible by patient and doctor) */}
          <Route path="/report/:appointmentId" element={
            <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}><ReportView /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminAppointments /></ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><ManageDoctors /></ProtectedRoute>
          } />
          <Route path="/admin/hospitals" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><ManageHospitals /></ProtectedRoute>
          } />
        </Routes>

        <Footer />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
