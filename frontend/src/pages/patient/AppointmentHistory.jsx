import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import patientService from '../../services/patientService';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../utils/AuthContext';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AppointmentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointmentId: null,
    appointmentDate: '',
    slotTime: '',
    reason: '',
  });

  const fetchAppointments = () => {
    patientService.getAppointments(user.userId)
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const openCancelModal = (id) => {
    setCancelModal({ open: true, appointmentId: id, reason: '' });
  };

  const handleCancelSubmit = async () => {
    if (!cancelModal.appointmentId) return;
    setSubmitting(true);
    try {
      await appointmentService.cancel(cancelModal.appointmentId, cancelModal.reason || null);
      toast.success('Appointment cancelled');
      setCancelModal({ open: false, appointmentId: null, reason: '' });
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openRescheduleModal = (appt) => {
    setRescheduleModal({
      open: true,
      appointmentId: appt.id,
      appointmentDate: appt.appointmentDate || '',
      slotTime: (appt.slotTime || '09:00').slice(0, 5),
      reason: '',
    });
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleModal.appointmentId || !rescheduleModal.appointmentDate || !rescheduleModal.slotTime) {
      toast.warning('Date and time are required');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentService.reschedule(rescheduleModal.appointmentId, {
        appointmentDate: rescheduleModal.appointmentDate,
        slotTime: rescheduleModal.slotTime,
        reason: rescheduleModal.reason || null,
      });
      toast.success('Appointment rescheduled');
      setRescheduleModal({ open: false, appointmentId: null, appointmentDate: '', slotTime: '', reason: '' });
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>View and manage your appointment history</p>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt size={48} />
            <h3>No appointments yet</h3>
            <p>Book your first appointment to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 500 }}>Dr. {appt.doctorName}</td>
                    <td>{appt.specialization}</td>
                    <td>{formatDate(appt.appointmentDate)}</td>
                    <td>{formatTime(appt.slotTime)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
                    </td>
                    <td>
                      {(appt.status === 'BOOKED' || appt.status === 'WAITING') && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => openRescheduleModal(appt)}>
                            Reschedule
                          </button>
                          <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }} onClick={() => openCancelModal(appt.id)}>
                            Cancel
                          </button>
                        </>
                      )}
                      {appt.hasReport && (
                        <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={() => navigate(`/report/${appt.id}`)}>
                          <FaFileAlt style={{ marginRight: 4 }} /> View Report
                        </button>
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
            <p className="modal-subtitle">Optional: add a reason for cancellation.</p>
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

      {rescheduleModal.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Reschedule Appointment</h3>
            <p className="modal-subtitle">Update date and time for your appointment.</p>

            <div className="form-group">
              <label>New Date</label>
              <input
                type="date"
                className="form-control"
                value={rescheduleModal.appointmentDate}
                onChange={(e) => setRescheduleModal((prev) => ({ ...prev, appointmentDate: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>New Time</label>
              <input
                type="time"
                className="form-control"
                value={rescheduleModal.slotTime}
                onChange={(e) => setRescheduleModal((prev) => ({ ...prev, slotTime: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Reason (Optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Reason"
                value={rescheduleModal.reason}
                onChange={(e) => setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setRescheduleModal({ open: false, appointmentId: null, appointmentDate: '', slotTime: '', reason: '' })}
                disabled={submitting}
              >
                Close
              </button>
              <button className="btn btn-primary" onClick={handleRescheduleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
