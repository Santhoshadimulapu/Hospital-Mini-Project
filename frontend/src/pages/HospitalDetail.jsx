import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHospital, FaUserMd, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import hospitalService from '../services/hospitalService';
import doctorService from '../services/doctorService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../utils/AuthContext';

export default function HospitalDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      hospitalService.getById(id),
      doctorService.getByHospital(id),
    ])
      .then(([hospRes, docRes]) => {
        setHospital(hospRes.data.data);
        setDoctors(docRes.data.data || []);
      })
      .catch(() => toast.error('Failed to load hospital details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!hospital) return <div className="page-wrapper"><div className="container"><h2>Hospital not found</h2></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/hospitals" className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>
          ← Back to Hospitals
        </Link>

        <div className="hospital-detail-header">
          <div className="hospital-icon-lg">
            <FaHospital />
          </div>
          <div>
            <h1>{hospital.name}</h1>
            <p className="hospital-info-row" style={{ marginTop: 8 }}>
              <FaMapMarkerAlt />
              <span>{hospital.address}, {hospital.city}</span>
            </p>
            {hospital.phone && (
              <p className="hospital-info-row">
                <FaPhone />
                <span>{hospital.phone}</span>
              </p>
            )}
            {hospital.rating && (
              <span className="hospital-rating" style={{ marginTop: 8, display: 'inline-flex' }}>
                <FaStar /> {hospital.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {hospital.specialties && (
          <div className="hospital-specialties" style={{ marginTop: 16, marginBottom: 32 }}>
            {hospital.specialties.split(',').map((s, i) => (
              <span key={i} className="specialty-tag">{s.trim()}</span>
            ))}
          </div>
        )}

        <h2 style={{ marginBottom: 20 }}>
          Doctors at {hospital.name} ({doctors.length})
        </h2>

        {doctors.length === 0 ? (
          <div className="empty-state">
            <FaUserMd size={48} />
            <h3>No doctors registered yet</h3>
            <p>Check back later for available doctors</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-avatar"><FaUserMd /></div>
                <h3>Dr. {doctor.name}</h3>
                <p className="specialization">{doctor.specialization}</p>
                <p className="consultation-time">
                  {doctor.consultationTime} min per consultation
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {doctor.availableDays}
                </p>
                <Link
                  to={isAuthenticated ? '/patient/book' : '/login'}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 16, width: '100%' }}
                >
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
