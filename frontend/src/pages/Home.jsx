import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { FaUserMd, FaCalendarCheck, FaClipboardList, FaHospital } from 'react-icons/fa';
import { useAuth } from '../utils/AuthContext';
import { useState } from 'react';

export default function Home({ city }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/hospitals?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/hospitals');
    }
  };

  return (
    <>
      {/* Hero / Search Section */}
      <section className="hero">
        <div className="container">
          <form className="hero-search" onSubmit={handleHeroSearch}>
            <div className="search-location">
              <FiMapPin size={18} />
              <span>{city || 'Your City'}</span>
            </div>
            <div className="search-input">
              <FiSearch size={18} />
              <input
                type="text"
                placeholder="Search hospitals, specialties..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      {/* Service Cards */}
      <section className="services-section">
        <div className="container">
          <div className="grid grid-3">
            <Link to={isAuthenticated ? '/patient/book' : '/login'} className="service-card">
              <div className="card-image service-card-blue">
                <FaCalendarCheck />
              </div>
              <div className="card-content">
                <h3>Book Appointment</h3>
                <p>Confirmed appointments</p>
              </div>
            </Link>

            <Link to="/doctors-list" className="service-card">
              <div className="card-image service-card-purple">
                <FaUserMd />
              </div>
              <div className="card-content">
                <h3>Find Doctors</h3>
                <p>Browse by specialization</p>
              </div>
            </Link>

            <Link to="/hospitals" className="service-card">
              <div className="card-image service-card-teal">
                <FaHospital />
              </div>
              <div className="card-content">
                <h3>Find Hospitals</h3>
                <p>Search hospitals near you</p>
              </div>
            </Link>

            <Link to="/ai/symptoms" className="service-card">
              <div className="card-image service-card-green">
                <FaUserMd />
              </div>
              <div className="card-content">
                <h3>AI Symptom Assistant</h3>
                <p>Get doctor recommendations from symptoms</p>
              </div>
            </Link>

            <Link to={isAuthenticated ? '/patient/queue' : '/login'} className="service-card">
              <div className="card-image service-card-green">
                <FaClipboardList />
              </div>
              <div className="card-content">
                <h3>Queue Status</h3>
                <p>Track your wait time</p>
              </div>
            </Link>

            <Link to={isAuthenticated ? '/patient/appointments' : '/login'} className="service-card">
              <div className="card-image service-card-orange">
                <FaHospital />
              </div>
              <div className="card-content">
                <h3>My Appointments</h3>
                <p>View your history</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Consult top doctors for any health concern</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                Private consultations with verified doctors in all specialties
              </p>
            </div>
            <Link to="/doctors-list" className="btn btn-outline">View All Specialties</Link>
          </div>
        </div>
      </section>
    </>
  );
}
