import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserMd, FaHospital, FaSearch } from 'react-icons/fa';
import doctorService from '../../services/doctorService';
import hospitalService from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialization: '',
    availableDays: '', consultationTime: 30, hospitalId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = () => {
    doctorService.getAll()
      .then((res) => setDoctors(res.data.data || []))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  const fetchHospitals = () => {
    hospitalService.getAll()
      .then((res) => setHospitals(res.data.data || []))
      .catch(() => toast.error('Failed to load hospitals'));
  };

  useEffect(() => { fetchDoctors(); fetchHospitals(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doctorService.create({
        ...form,
        consultationTime: parseInt(form.consultationTime, 10),
        hospitalId: form.hospitalId ? parseInt(form.hospitalId, 10) : null,
      });
      toast.success('Doctor added successfully!');
      setForm({ name: '', email: '', password: '', specialization: '', availableDays: '', consultationTime: 30, hospitalId: '' });
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  let filteredDoctors = selectedHospital === 'ALL'
    ? doctors
    : selectedHospital === 'NONE'
      ? doctors.filter(d => !d.hospitalId)
      : doctors.filter(d => d.hospitalId === parseInt(selectedHospital, 10));

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredDoctors = filteredDoctors.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.hospitalName?.toLowerCase().includes(q)
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header-flex">
          <div>
            <h1>Manage Doctors</h1>
            <p>{filteredDoctors.length} of {doctors.length} doctors</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Doctor'}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search doctors by name, email, specialization, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Hospital Filter */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 600, marginRight: 12, fontSize: 14 }}>Filter by Hospital:</label>
          <select
            className="form-control"
            style={{ display: 'inline-block', width: 'auto', minWidth: 250 }}
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            <option value="ALL">All Hospitals</option>
            <option value="NONE">No Hospital Assigned</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Add New Doctor</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Name</label>
                    <input name="name" className="form-control" placeholder="Doctor name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" className="form-control" placeholder="doctor@example.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input name="password" type="password" className="form-control" placeholder="Password" value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input name="specialization" className="form-control" placeholder="e.g. Cardiology" value={form.specialization} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Hospital</label>
                    <select name="hospitalId" className="form-control" value={form.hospitalId} onChange={handleChange} required>
                      <option value="">Select Hospital</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Available Days</label>
                    <input name="availableDays" className="form-control" placeholder="MONDAY,TUESDAY,FRIDAY" value={form.availableDays} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Consultation (min)</label>
                    <input name="consultationTime" type="number" className="form-control" value={form.consultationTime} onChange={handleChange} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Doctor'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-3">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-avatar"><FaUserMd /></div>
              <h3>Dr. {doc.name}</h3>
              <p className="specialization">{doc.specialization}</p>
              <p className="consultation-time">{doc.consultationTime} min per consultation</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{doc.availableDays}</p>
              {doc.hospitalName && (
                <p style={{ fontSize: 13, color: 'var(--primary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaHospital size={12} /> {doc.hospitalName}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
