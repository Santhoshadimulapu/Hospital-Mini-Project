import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserMd, FaCalendarCheck, FaClock } from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStatistics()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="empty-state"><h3>Failed to load statistics</h3></div>;

  const doughnutData = {
    labels: ['Completed', 'Waiting / Booked', 'Cancelled'],
    datasets: [{
      data: [stats.completedToday, stats.waitingToday, stats.cancelledToday],
      backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: ['Patients', 'Doctors', 'Total Appts', 'Today'],
    datasets: [{
      label: 'Count',
      data: [stats.totalPatients, stats.totalDoctors, stats.totalAppointments, stats.todayAppointments],
      backgroundColor: ['#199fd9', '#00b38a', '#f39c12', '#28328c'],
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Hospital overview and analytics</p>
        </div>

        <div className="grid grid-4">
          <div className="stat-card">
            <div className="stat-icon blue"><FaUsers /></div>
            <div className="stat-info">
              <h3>{stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FaUserMd /></div>
            <div className="stat-info">
              <h3>{stats.totalDoctors}</h3>
              <p>Total Doctors</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><FaCalendarCheck /></div>
            <div className="stat-info">
              <h3>{stats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><FaClock /></div>
            <div className="stat-info">
              <h3>{stats.todayAppointments}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="chart-container">
            <h3>Hospital Overview</h3>
            <div style={{ height: 300 }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h3>Today's Status Breakdown</h3>
            <div style={{ height: 300 }}>
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
          <Link to="/admin/appointments" className="btn btn-primary">Manage Appointments</Link>
          <Link to="/admin/doctors" className="btn btn-outline">Manage Doctors</Link>
          <Link to="/admin/hospitals" className="btn btn-outline">Manage Hospitals</Link>
        </div>
      </div>
    </div>
  );
}
