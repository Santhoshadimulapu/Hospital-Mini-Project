import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaHospital, FaUserMd, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import hospitalService from '../services/hospitalService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HospitalSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const city = localStorage.getItem('selectedCity') || '';

  useEffect(() => {
    const fetch = city
      ? hospitalService.getByCity(city)
      : hospitalService.getAll();

    fetch
      .then((res) => {
        const list = res.data.data || [];
        setHospitals(list);
        setFiltered(list);
      })
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false));
  }, [city]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(hospitals);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.specialties?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q)
      )
    );
  }, [search, hospitals]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header-flex">
          <div>
            <h1>Find Hospitals{city ? ` in ${city}` : ''}</h1>
            <p>Search hospitals and browse their doctors</p>
          </div>
        </div>

        <div className="hospital-search-bar">
          <FiSearch size={20} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by hospital name, specialty, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <FaHospital size={48} />
            <h3>No hospitals found</h3>
            <p>{search ? 'Try a different search term' : 'No hospitals registered yet'}</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {filtered.map((hospital) => (
              <div
                key={hospital.id}
                className="hospital-card"
                onClick={() => navigate(`/hospitals/${hospital.id}`)}
              >
                <div className="hospital-card-header">
                  <div className="hospital-icon">
                    <FaHospital />
                  </div>
                  <div>
                    <h3>{hospital.name}</h3>
                    {hospital.rating && (
                      <span className="hospital-rating">
                        <FaStar /> {hospital.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hospital-card-body">
                  <p className="hospital-info-row">
                    <FaMapMarkerAlt />
                    <span>{hospital.address}, {hospital.city}</span>
                  </p>
                  {hospital.phone && (
                    <p className="hospital-info-row">
                      <FaPhone />
                      <span>{hospital.phone}</span>
                    </p>
                  )}
                  {hospital.specialties && (
                    <div className="hospital-specialties">
                      {hospital.specialties.split(',').map((s, i) => (
                        <span key={i} className="specialty-tag">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="hospital-footer">
                    <span className="doctor-count">
                      <FaUserMd /> {hospital.doctorCount} Doctor{hospital.doctorCount !== 1 ? 's' : ''}
                    </span>
                    <span className="btn btn-primary btn-sm">View Doctors →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
