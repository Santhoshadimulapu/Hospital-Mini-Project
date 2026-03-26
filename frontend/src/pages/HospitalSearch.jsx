import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaHospital, FaUserMd, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import hospitalService from '../services/hospitalService';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebouncedValue from '../utils/useDebouncedValue';

export default function HospitalSearch() {
  const PAGE_SIZE = 8;
  const PAGE_SIZE_OPTIONS = [6, 8, 12, 16, 24];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [pageInfo, setPageInfo] = useState({ page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true });
  const [currentPage, setCurrentPage] = useState(0);
  const city = localStorage.getItem('selectedCity') || '';
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchHospitals = (page = 0) => {
    hospitalService.getPaged({
      page,
      size: pageSize,
      q: debouncedSearch.trim() || undefined,
      city: city || undefined,
      sortBy,
      sortDir,
    })
      .then((res) => {
        const data = res.data.data || {};
        setHospitals(data.items || []);
        setPageInfo({
          page: data.page || 0,
          size: data.size || pageSize,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          last: data.last ?? true,
        });
        setCurrentPage(data.page || 0);
      })
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchHospitals(0);
  }, [city, debouncedSearch, pageSize, sortBy, sortDir]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;
    setLoading(true);
    fetchHospitals(nextPage);
  };

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

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <div className="hospital-search-bar" style={{ marginBottom: 0, flex: '1 1 320px' }}>
            <FiSearch size={20} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by hospital name, specialty, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="city">Sort: City</option>
            <option value="rating">Sort: Rating</option>
            <option value="id">Sort: Recently Added</option>
          </select>

          <select className="form-control" style={{ width: 'auto', minWidth: 120 }} value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 120 }}
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>Per page: {option}</option>
            ))}
          </select>
        </div>

        {hospitals.length === 0 ? (
          <div className="empty-state">
            <FaHospital size={48} />
            <h3>No hospitals found</h3>
            <p>{search ? 'Try a different search term' : 'No hospitals registered yet'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-2">
              {hospitals.map((hospital) => (
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

            {pageInfo.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Showing {hospitals.length} of {pageInfo.totalElements} hospitals
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>
                    Previous
                  </button>
                  <button className="btn btn-outline btn-sm" disabled={pageInfo.last} onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
