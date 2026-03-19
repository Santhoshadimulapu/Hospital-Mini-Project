import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileAlt, FaEye } from 'react-icons/fa';
import appointmentService from '../../services/appointmentService';
import queueService from '../../services/queueService';
import { useAuth } from '../../utils/AuthContext';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueBusy, setQueueBusy] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAppointments = () => {
    appointmentService.getByDoctor(user.userId)
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCallNext = async () => {
    setQueueBusy(true);
    try {
      const res = await queueService.callNext(user.userId, selectedDate || undefined);
      const called = res.data.data;
      toast.success(called ? `Called: ${called.patientName}` : 'Next patient called');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to call next patient');
    } finally {
      setQueueBusy(false);
    }
  };

  const handleSkipNoShow = async (appointmentId) => {
    setQueueBusy(true);
    try {
      const res = await queueService.skipMissed(appointmentId);
      const called = res.data.data;
      toast.success(called ? `No-show handled. Called next: ${called.patientName}` : 'No-show handled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to handle no-show');
    } finally {
      setQueueBusy(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  let filtered = appointments;

  // Apply date filter
  if (selectedDate) {
    filtered = filtered.filter(a => a.appointmentDate === selectedDate);
  }

  // Apply status filter
  if (filter !== 'ALL') {
    filtered = filtered.filter(a => a.status === filter);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>Manage all your patient appointments</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Date:</label>
            <input
              type="date"
              className="form-control"
              style={{ width: 180 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {selectedDate && (
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedDate('')}>
              Show All Dates
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['ALL', 'BOOKED', 'WAITING', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCallNext}
            disabled={queueBusy}
          >
            {queueBusy ? 'Please wait...' : 'Call Next Patient'}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><h3>No appointments found</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 500 }}>{appt.patientName}</td>
                    <td>{formatDate(appt.appointmentDate)}</td>
                    <td>{formatTime(appt.slotTime)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span></td>
                    <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {appt.status === 'WAITING' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(appt.id, 'COMPLETED')}>
                            Complete
                          </button>
                          <button className="btn btn-warning btn-sm" onClick={() => handleSkipNoShow(appt.id)}>
                            No Show
                          </button>
                        </>
                      )}
                      {(appt.status === 'BOOKED' || appt.status === 'WAITING') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(appt.id, 'CANCELLED')}>
                          Cancel
                        </button>
                      )}
                      {appt.status === 'COMPLETED' && !appt.hasReport && (
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/report/${appt.id}`)}>
                          <FaFileAlt style={{ marginRight: 4 }} /> Write Report
                        </button>
                      )}
                      {appt.hasReport && (
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/report/${appt.id}`)}>
                          <FaEye style={{ marginRight: 4 }} /> View Report
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
    </div>
  );
}
