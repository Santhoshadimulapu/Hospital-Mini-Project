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

  const fetchAppointments = () => {
    patientService.getAppointments(user.userId)
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
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
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>
                          Cancel
                        </button>
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
    </div>
  );
}
