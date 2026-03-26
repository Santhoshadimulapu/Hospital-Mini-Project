import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import adminService from '../../services/adminService';
import hospitalService from '../../services/hospitalService';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedHospital, setSelectedHospital] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });

  const fetchAppointments = () => {
    adminService.getAllAppointments()
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  const fetchHospitals = () => {
    hospitalService.getAll()
      .then((res) => setHospitals(res.data.data || []))
      .catch(() => toast.error('Failed to load hospitals'));
  };

  useEffect(() => { fetchAppointments(); fetchHospitals(); }, []);

  const openCancelModal = (id) => {
    setCancelModal({ open: true, appointmentId: id, reason: '' });
  };

  const handleCancelSubmit = async () => {
    if (!cancelModal.appointmentId) return;
    setSubmitting(true);
    try {
      await adminService.cancelAppointment(cancelModal.appointmentId, cancelModal.reason || null);
      toast.success('Appointment cancelled');
      setCancelModal({ open: false, appointmentId: null, reason: '' });
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Apply status, hospital, and search filters
  let filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
  if (selectedHospital !== 'ALL') {
    if (selectedHospital === 'NONE') {
      filtered = filtered.filter(a => !a.hospitalId);
    } else {
      filtered = filtered.filter(a => a.hospitalId === parseInt(selectedHospital, 10));
    }
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.patientName?.toLowerCase().includes(q) ||
      a.doctorName?.toLowerCase().includes(q) ||
      a.specialization?.toLowerCase().includes(q) ||
      a.hospitalName?.toLowerCase().includes(q) ||
      String(a.id).includes(q)
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>All Appointments</h1>
          <p>Manage and monitor every appointment</p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by patient name, doctor name, specialization, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Hospital Filter */}
        <div style={{ marginBottom: 16 }}>
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

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['ALL', 'BOOKED', 'WAITING', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(s)}
            >
              {s} {s !== 'ALL' && `(${appointments.filter(a => a.status === s).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><h3>No appointments found</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Hospital</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td>#{appt.id}</td>
                    <td style={{ fontWeight: 500 }}>{appt.patientName}</td>
                    <td>Dr. {appt.doctorName}</td>
                    <td>{appt.hospitalName || '—'}</td>
                    <td>{appt.specialization}</td>
                    <td>{formatDate(appt.appointmentDate)}</td>
                    <td>{formatTime(appt.slotTime)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span></td>
                    <td>
                      {(appt.status === 'BOOKED' || appt.status === 'WAITING') && (
                        <button className="btn btn-danger btn-sm" onClick={() => openCancelModal(appt.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelModal.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Cancel Appointment</h3>
            <p className="modal-subtitle">Optional: add cancellation reason for analytics.</p>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Reason"
              value={cancelModal.reason}
              onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
            />
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setCancelModal({ open: false, appointmentId: null, reason: '' })}
                disabled={submitting}
              >
                Close
              </button>
              <button className="btn btn-danger" onClick={handleCancelSubmit} disabled={submitting}>
                {submitting ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
