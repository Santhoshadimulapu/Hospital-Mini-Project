import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FiLogOut, FiMapPin, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar({ city, onCityClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const renderLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <NavLink to="/" onClick={closeMobile}>Home</NavLink>
          <NavLink to="/hospitals" onClick={closeMobile}>Find Hospitals</NavLink>
          <NavLink to="/doctors-list" onClick={closeMobile}>Find Doctors</NavLink>
          <NavLink to="/ai/symptoms" onClick={closeMobile}>AI Assistant</NavLink>
        </>
      );
    }

    switch (user.role) {
      case 'PATIENT':
        return (
          <>
            <NavLink to="/patient/book" onClick={closeMobile}>Book Appointment</NavLink>
            <NavLink to="/patient/appointments" onClick={closeMobile}>My Appointments</NavLink>
            <NavLink to="/patient/queue" onClick={closeMobile}>Queue Status</NavLink>
            <NavLink to="/patient/profile" onClick={closeMobile}>My Profile</NavLink>
            <NavLink to="/patient/account" onClick={closeMobile}>Account & Security</NavLink>
            <NavLink to="/ai/symptoms" onClick={closeMobile}>AI Assistant</NavLink>
          </>
        );
      case 'DOCTOR':
        return (
          <>
            <NavLink to="/doctor/dashboard" onClick={closeMobile}>Dashboard</NavLink>
            <NavLink to="/doctor/appointments" onClick={closeMobile}>Appointments</NavLink>
            <NavLink to="/doctor/slots" onClick={closeMobile}>Manage Slots</NavLink>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <NavLink to="/admin/dashboard" onClick={closeMobile}>Dashboard</NavLink>
            <NavLink to="/admin/hospitals" onClick={closeMobile}>Manage Hospitals</NavLink>
            <NavLink to="/admin/doctors" onClick={closeMobile}>Manage Doctors</NavLink>
            <NavLink to="/admin/appointments" onClick={closeMobile}>Appointments</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <FiMenu size={20} />
        </button>
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
      </header>

      {mobileOpen && <button className="sidebar-backdrop" onClick={closeMobile} aria-label="Close menu" />}

      <nav className={`navbar sidebar-nav ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <Link to="/" className="navbar-brand" onClick={closeMobile}>
              <span className="dot" />
              MedQueue
              <span className="dot" />
            </Link>
            <button className="mobile-close-btn" onClick={closeMobile} aria-label="Close menu">
              <FiX size={18} />
            </button>
          </div>

          <button className="navbar-city" onClick={onCityClick}>
            <FiMapPin size={16} />
            <span>{city || 'Select City'}</span>
            <FiChevronDown size={14} />
          </button>
        </div>

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
            <Link to="/login" onClick={closeMobile} className="btn btn-outline btn-sm">Login / Signup</Link>
          )}
        </div>
      </nav>
    </>
  );
}
