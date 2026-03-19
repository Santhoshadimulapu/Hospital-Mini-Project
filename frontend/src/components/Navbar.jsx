import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FiLogOut, FiMapPin, FiChevronDown } from 'react-icons/fi';

export default function Navbar({ city, onCityClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/hospitals">Find Hospitals</NavLink>
          <NavLink to="/doctors-list">Find Doctors</NavLink>
          <NavLink to="/ai/symptoms">AI Assistant</NavLink>
        </>
      );
    }

    switch (user.role) {
      case 'PATIENT':
        return (
          <>
            <NavLink to="/patient/book">Book Appointment</NavLink>
            <NavLink to="/patient/appointments">My Appointments</NavLink>
            <NavLink to="/patient/queue">Queue Status</NavLink>
            <NavLink to="/patient/profile">My Profile</NavLink>
            <NavLink to="/patient/account">Account & Security</NavLink>
            <NavLink to="/ai/symptoms">AI Assistant</NavLink>
          </>
        );
      case 'DOCTOR':
        return (
          <>
            <NavLink to="/doctor/dashboard">Dashboard</NavLink>
            <NavLink to="/doctor/appointments">Appointments</NavLink>
            <NavLink to="/doctor/slots">Manage Slots</NavLink>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
            <NavLink to="/admin/hospitals">Manage Hospitals</NavLink>
            <NavLink to="/admin/doctors">Manage Doctors</NavLink>
            <NavLink to="/admin/appointments">Appointments</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="dot" />
        MedQueue
        <span className="dot" />
      </Link>

      <button className="navbar-city" onClick={onCityClick}>
        <FiMapPin size={16} />
        <span>{city || 'Select City'}</span>
        <FiChevronDown size={14} />
      </button>

      <div className="navbar-links">
        {renderLinks()}
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <div className="navbar-user">
              <span>{user.name || user.email}</span>
              <span className="role-badge">{user.role}</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-outline btn-sm">Login / Signup</Link>
        )}
      </div>
    </nav>
  );
}
