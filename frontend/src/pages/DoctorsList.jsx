import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd } from 'react-icons/fa';
import { toast } from 'react-toastify';
import doctorService from '../services/doctorService';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebouncedValue from '../utils/useDebouncedValue';

export default function DoctorsList() {
  const PAGE_SIZE = 9;
  const PAGE_SIZE_OPTIONS = [6, 9, 12, 18, 24];
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [pageInfo, setPageInfo] = useState({ page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true });
  const [currentPage, setCurrentPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchDoctors = (page = 0) => {
    doctorService.getPaged({
      page,
      size: pageSize,
      q: debouncedSearch.trim() || undefined,
      sortBy,
      sortDir,
    })
      .then((res) => {
        const data = res.data.data || {};
        setDoctors(data.items || []);
        setPageInfo({
          page: data.page || 0,
          size: data.size || pageSize,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          last: data.last ?? true,
        });
        setCurrentPage(data.page || 0);
      })
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchDoctors(0);
  }, [debouncedSearch, pageSize, sortBy, sortDir]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;
    setLoading(true);
    fetchDoctors(nextPage);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header-flex">
          <div>
            <h1>Find Doctors</h1>
            <p>Browse our verified specialists</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <input
            className="form-control"
            style={{ minWidth: 260, maxWidth: 320 }}
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="specialization">Sort: Specialization</option>
            <option value="consultationTime">Sort: Consultation</option>
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

        {doctors.length === 0 ? (
          <div className="empty-state">
            <FaUserMd size={48} />
            <h3>No doctors found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              {doctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-avatar"><FaUserMd /></div>
                <h3>Dr. {doctor.name}</h3>
                <p className="specialization">{doctor.specialization}</p>
                <p className="consultation-time">
                  {doctor.consultationTime} min per consultation
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {doctor.availableDays}
                </p>
                <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop: 16, width: '100%' }}>
                  Book Appointment
                </Link>
              </div>
            ))}
            </div>

            {pageInfo.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Showing {doctors.length} of {pageInfo.totalElements} doctors
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
