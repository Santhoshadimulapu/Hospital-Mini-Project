import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserMd, FaHospital, FaSearch } from 'react-icons/fa';
import doctorService from '../../services/doctorService';
import hospitalService from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';
import useDebouncedValue from '../../utils/useDebouncedValue';

export default function ManageDoctors() {
  const PAGE_SIZE = 9;
  const PAGE_SIZE_OPTIONS = [6, 9, 12, 18, 24];
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [pageInfo, setPageInfo] = useState({ page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true });
  const [currentPage, setCurrentPage] = useState(0);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [editModal, setEditModal] = useState({
    open: false,
    doctorId: null,
    name: '',
    email: '',
    specialization: '',
    availableDays: '',
    consultationTime: 30,
    hospitalId: '',
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, doctorId: null, name: '' });
  const [editErrors, setEditErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialization: '',
    availableDays: '', consultationTime: 30, hospitalId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = (page = currentPage) => {
    const params = {
      page,
      size: pageSize,
      q: debouncedSearchQuery.trim() || undefined,
      hospitalId: selectedHospital !== 'ALL' ? parseInt(selectedHospital, 10) : undefined,
      sortBy,
      sortDir,
    };

    return doctorService.getPaged(params)
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

  const fetchHospitals = () => {
    hospitalService.getAll()
      .then((res) => setHospitals(res.data.data || []))
      .catch(() => toast.error('Failed to load hospitals'));
  };

  useEffect(() => { fetchHospitals(); }, []);

  useEffect(() => {
    setLoading(true);
    fetchDoctors(0);
  }, [selectedHospital, debouncedSearchQuery, pageSize, sortBy, sortDir]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        consultationTime: parseInt(form.consultationTime, 10),
        hospitalId: form.hospitalId ? parseInt(form.hospitalId, 10) : null,
      };

      await doctorService.create(payload);
      toast.success('Doctor added successfully!');

      setForm({ name: '', email: '', password: '', specialization: '', availableDays: '', consultationTime: 30, hospitalId: '' });
      setShowForm(false);
      fetchDoctors(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const validateEditDoctor = (payload) => {
    const errors = {};
    if (!payload.name?.trim()) errors.name = 'Name is required';
    if (!payload.email?.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(payload.email)) errors.email = 'Enter a valid email';
    if (!payload.specialization?.trim()) errors.specialization = 'Specialization is required';
    if (!payload.hospitalId) errors.hospitalId = 'Hospital is required';
    if (!payload.availableDays?.trim()) errors.availableDays = 'Available days are required';

    const consultation = parseInt(payload.consultationTime, 10);
    if (Number.isNaN(consultation) || consultation <= 0) {
      errors.consultationTime = 'Consultation time must be greater than 0';
    }

    return errors;
  };

  const handleEdit = (doctor) => {
    setEditErrors({});
    setEditModal({
      open: true,
      doctorId: doctor.id,
      name: doctor.name || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      availableDays: doctor.availableDays || '',
      consultationTime: doctor.consultationTime || 30,
      hospitalId: doctor.hospitalId ? String(doctor.hospitalId) : '',
    });
  };

  const handleEditSubmit = async () => {
    const errors = validateEditDoctor(editModal);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await doctorService.update(editModal.doctorId, {
        name: editModal.name.trim(),
        email: editModal.email.trim(),
        specialization: editModal.specialization.trim(),
        availableDays: editModal.availableDays.trim(),
        consultationTime: parseInt(editModal.consultationTime, 10),
        hospitalId: parseInt(editModal.hospitalId, 10),
      });

      toast.success('Doctor updated successfully!');
      setEditModal({
        open: false,
        doctorId: null,
        name: '',
        email: '',
        specialization: '',
        availableDays: '',
        consultationTime: 30,
        hospitalId: '',
      });
      fetchDoctors(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.doctorId) return;
    setSubmitting(true);
    try {
      await doctorService.remove(deleteModal.doctorId);
      toast.success('Doctor deleted successfully');
      setDeleteModal({ open: false, doctorId: null, name: '' });
      fetchDoctors(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1>Manage Doctors</h1>
            <p>{pageInfo.totalElements} doctors found</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Doctor'}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search doctors by name, email, specialization, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Hospital Filter */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, marginRight: 12, fontSize: 14 }}>Filter by Hospital:</label>
          <select
            className="form-control"
            style={{ display: 'inline-block', width: 'auto', minWidth: 250 }}
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            <option value="ALL">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8, fontSize: 14 }}>Sort:</label>
            <select
              className="form-control"
              style={{ display: 'inline-block', width: 'auto', minWidth: 190 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="specialization">Specialization</option>
              <option value="consultationTime">Consultation Time</option>
              <option value="id">Recently Added</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, marginRight: 8, fontSize: 14 }}>Direction:</label>
            <select
              className="form-control"
              style={{ display: 'inline-block', width: 'auto', minWidth: 130 }}
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, marginRight: 8, fontSize: 14 }}>Per page:</label>
            <select
              className="form-control"
              style={{ display: 'inline-block', width: 'auto', minWidth: 100 }}
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
                Add New Doctor
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Name</label>
                    <input name="name" className="form-control" placeholder="Doctor name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" className="form-control" placeholder="doctor@example.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input name="password" type="password" className="form-control" placeholder="Password" value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input name="specialization" className="form-control" placeholder="e.g. Cardiology" value={form.specialization} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Hospital</label>
                    <select name="hospitalId" className="form-control" value={form.hospitalId} onChange={handleChange} required>
                      <option value="">Select Hospital</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Available Days</label>
                    <input name="availableDays" className="form-control" placeholder="MONDAY,TUESDAY,FRIDAY" value={form.availableDays} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Consultation (min)</label>
                    <input name="consultationTime" type="number" className="form-control" value={form.consultationTime} onChange={handleChange} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Doctor'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-3">
          {doctors.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-avatar"><FaUserMd /></div>
              <h3>Dr. {doc.name}</h3>
              <p className="specialization">{doc.specialization}</p>
              <p className="consultation-time">{doc.consultationTime} min per consultation</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{doc.availableDays}</p>
              {doc.hospitalName && (
                <p style={{ fontSize: 13, color: 'var(--primary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaHospital size={12} /> {doc.hospitalName}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(doc)}>Edit</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteModal({ open: true, doctorId: doc.id, name: doc.name })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {pageInfo.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Page {currentPage + 1} of {pageInfo.totalPages}
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
      </div>

      {editModal.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Edit Doctor</h3>
            <p className="modal-subtitle">Update doctor details with validation.</p>

            <div className="form-group">
              <label>Name</label>
              <input
                className={`form-control ${editErrors.name ? 'input-error' : ''}`}
                value={editModal.name}
                onChange={(e) => setEditModal((prev) => ({ ...prev, name: e.target.value }))}
              />
              {editErrors.name && <p className="field-error">{editErrors.name}</p>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className={`form-control ${editErrors.email ? 'input-error' : ''}`}
                type="email"
                value={editModal.email}
                onChange={(e) => setEditModal((prev) => ({ ...prev, email: e.target.value }))}
              />
              {editErrors.email && <p className="field-error">{editErrors.email}</p>}
            </div>

            <div className="form-group">
              <label>Specialization</label>
              <input
                className={`form-control ${editErrors.specialization ? 'input-error' : ''}`}
                value={editModal.specialization}
                onChange={(e) => setEditModal((prev) => ({ ...prev, specialization: e.target.value }))}
              />
              {editErrors.specialization && <p className="field-error">{editErrors.specialization}</p>}
            </div>

            <div className="form-group">
              <label>Hospital</label>
              <select
                className={`form-control ${editErrors.hospitalId ? 'input-error' : ''}`}
                value={editModal.hospitalId}
                onChange={(e) => setEditModal((prev) => ({ ...prev, hospitalId: e.target.value }))}
              >
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} - {h.city}</option>
                ))}
              </select>
              {editErrors.hospitalId && <p className="field-error">{editErrors.hospitalId}</p>}
            </div>

            <div className="form-group">
              <label>Available Days</label>
              <input
                className={`form-control ${editErrors.availableDays ? 'input-error' : ''}`}
                value={editModal.availableDays}
                onChange={(e) => setEditModal((prev) => ({ ...prev, availableDays: e.target.value }))}
              />
              {editErrors.availableDays && <p className="field-error">{editErrors.availableDays}</p>}
            </div>

            <div className="form-group">
              <label>Consultation Time (min)</label>
              <input
                className={`form-control ${editErrors.consultationTime ? 'input-error' : ''}`}
                type="number"
                value={editModal.consultationTime}
                onChange={(e) => setEditModal((prev) => ({ ...prev, consultationTime: e.target.value }))}
              />
              {editErrors.consultationTime && <p className="field-error">{editErrors.consultationTime}</p>}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setEditModal({
                  open: false,
                  doctorId: null,
                  name: '',
                  email: '',
                  specialization: '',
                  availableDays: '',
                  consultationTime: 30,
                  hospitalId: '',
                })}
                disabled={submitting}
              >
                Close
              </button>
              <button className="btn btn-primary" onClick={handleEditSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Delete Doctor</h3>
            <p className="modal-subtitle">Are you sure you want to delete Dr. {deleteModal.name}?</p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteModal({ open: false, doctorId: null, name: '' })}
                disabled={submitting}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
