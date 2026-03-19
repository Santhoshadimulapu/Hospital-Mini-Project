import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHospital, FaMapMarkerAlt, FaPhone, FaStar, FaSearch } from 'react-icons/fa';
import hospitalService from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', address: '', phone: '',
    specialties: '', imageUrl: '', rating: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHospitals = () => {
    hospitalService.getAll()
      .then((res) => setHospitals(res.data.data || []))
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHospitals(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await hospitalService.create({
        ...form,
        rating: form.rating ? parseFloat(form.rating) : null,
      });
      toast.success('Hospital added successfully!');
      setForm({ name: '', city: '', address: '', phone: '', specialties: '', imageUrl: '', rating: '' });
      setShowForm(false);
      fetchHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHospitals = searchQuery.trim()
    ? hospitals.filter(h => {
        const q = searchQuery.toLowerCase();
        return h.name?.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q) ||
          h.specialties?.toLowerCase().includes(q) ||
          h.phone?.toLowerCase().includes(q);
      })
    : hospitals;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header-flex">
          <div>
            <h1>Manage Hospitals</h1>
            <p>{filteredHospitals.length} of {hospitals.length} hospitals</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Hospital'}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search hospitals by name, city, address, or specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Add New Hospital</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Hospital Name *</label>
                    <input name="name" className="form-control" placeholder="e.g. Apollo Hospital" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input name="city" className="form-control" placeholder="e.g. Hyderabad" value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Address *</label>
                    <input name="address" className="form-control" placeholder="Full address" value={form.address} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" className="form-control" placeholder="e.g. +91-40-12345678" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Rating (1-5)</label>
                    <input name="rating" type="number" step="0.1" min="1" max="5" className="form-control" placeholder="e.g. 4.5" value={form.rating} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Specialties</label>
                    <input name="specialties" className="form-control" placeholder="e.g. Cardiology, Neurology, Orthopedics" value={form.specialties} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Image URL</label>
                    <input name="imageUrl" className="form-control" placeholder="https://example.com/hospital.jpg" value={form.imageUrl} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Hospital'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-3">
          {filteredHospitals.map((h) => (
            <div key={h.id} className="card" style={{ overflow: 'hidden' }}>
              {h.imageUrl && (
                <div style={{ height: 140, overflow: 'hidden', background: '#f0f4f8' }}>
                  <img src={h.imageUrl} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="card-body">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaHospital color="var(--primary)" /> {h.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaMapMarkerAlt size={12} /> {h.city} — {h.address}
                </p>
                {h.phone && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaPhone size={12} /> {h.phone}
                  </p>
                )}
                {h.rating && (
                  <p style={{ fontSize: 13, color: '#f39c12', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaStar size={12} /> {h.rating} / 5
                  </p>
                )}
                {h.specialties && (
                  <div style={{ marginTop: 8 }}>
                    {h.specialties.split(',').map((s, i) => (
                      <span key={i} className="badge" style={{ marginRight: 4, marginBottom: 4, fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {h.doctorCount} doctor{h.doctorCount !== 1 ? 's' : ''} registered
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
