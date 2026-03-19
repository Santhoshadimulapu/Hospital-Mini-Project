import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaClipboardList, FaClock } from 'react-icons/fa';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../utils/AuthContext';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getByDoctor(user.userId)
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointmentDate === today);
  const upcomingAppts = appointments.filter(a => a.appointmentDate >= today && a.status !== 'CANCELLED');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Doctor Dashboard</h1>
          <p>Welcome back, Dr. {user.name || user.email}</p>
        </div>

        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-icon blue"><FaCalendarCheck /></div>
            <div className="stat-info">
              <h3>{todayAppts.length}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FaClipboardList /></div>
            <div className="stat-info">
              <h3>{upcomingAppts.length}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><FaClock /></div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'COMPLETED').length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div style={{ marginTop: 32 }}>
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <Link to="/doctor/appointments" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {todayAppts.length === 0 ? (
            <div className="card"><div className="card-body empty-state"><h3>No appointments today</h3></div></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.map((appt) => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: 500 }}>{appt.patientName}</td>
                      <td>{formatTime(appt.slotTime)}</td>
                      <td><span className={`badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
