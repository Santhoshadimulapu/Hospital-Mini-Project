import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd } from 'react-icons/fa';
import { toast } from 'react-toastify';
import doctorService from '../services/doctorService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorService.getAll()
      .then((res) => {
        const list = res.data.data || [];
        setDoctors(list);
        setFiltered(list);
      })
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q)
      )
    );
  }, [search, doctors]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header-flex">
          <div>
            <h1>Find Doctors</h1>
            <p>Browse our verified specialists</p>
          </div>
          <input
            className="form-control"
            style={{ maxWidth: 300 }}
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <FaUserMd size={48} />
            <h3>No doctors found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map((doctor) => (
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
                <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop: 16, width: '100%' }}>
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
