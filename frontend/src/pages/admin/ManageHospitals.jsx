import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHospital, FaMapMarkerAlt, FaPhone, FaStar, FaSearch } from 'react-icons/fa';
import hospitalService from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';
import useDebouncedValue from '../../utils/useDebouncedValue';

export default function ManageHospitals() {
  const PAGE_SIZE = 9;
  const PAGE_SIZE_OPTIONS = [6, 9, 12, 18, 24];
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editModal, setEditModal] = useState({
    open: false,
    hospitalId: null,
    name: '',
    city: '',
    address: '',
    phone: '',
    specialties: '',
    imageUrl: '',
    rating: '',
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, hospitalId: null, name: '' });
  const [editErrors, setEditErrors] = useState({});
  const [form, setForm] = useState({
    name: '', city: '', address: '', phone: '',
    specialties: '', imageUrl: '', rating: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [pageInfo, setPageInfo] = useState({ page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true });
  const [currentPage, setCurrentPage] = useState(0);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const fetchHospitals = (page = currentPage) => {
    const params = {
      page,
      size: pageSize,
      q: debouncedSearchQuery.trim() || undefined,
      sortBy,
      sortDir,
    };

    return hospitalService.getPaged(params)
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
  }, [debouncedSearchQuery, pageSize, sortBy, sortDir]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        rating: form.rating ? parseFloat(form.rating) : null,
      };

      await hospitalService.create(payload);
      toast.success('Hospital added successfully!');

      setForm({ name: '', city: '', address: '', phone: '', specialties: '', imageUrl: '', rating: '' });
      setShowForm(false);
      fetchHospitals(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const validateEditHospital = (payload) => {
    const errors = {};
    if (!payload.name?.trim()) errors.name = 'Hospital name is required';
    if (!payload.city?.trim()) errors.city = 'City is required';
    if (!payload.address?.trim()) errors.address = 'Address is required';

    if (payload.rating !== '' && payload.rating !== null && payload.rating !== undefined) {
      const rating = parseFloat(payload.rating);
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        errors.rating = 'Rating must be between 1 and 5';
      }
    }

    return errors;
  };

  const handleEdit = (hospital) => {
    setEditErrors({});
    setEditModal({
      open: true,
      hospitalId: hospital.id,
      name: hospital.name || '',
      city: hospital.city || '',
      address: hospital.address || '',
      phone: hospital.phone || '',
      specialties: hospital.specialties || '',
      imageUrl: hospital.imageUrl || '',
      rating: hospital.rating ?? '',
    });
  };

  const handleEditSubmit = async () => {
    const errors = validateEditHospital(editModal);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await hospitalService.update(editModal.hospitalId, {
        name: editModal.name.trim(),
        city: editModal.city.trim(),
        address: editModal.address.trim(),
        phone: editModal.phone?.trim() || null,
        specialties: editModal.specialties?.trim() || null,
        imageUrl: editModal.imageUrl?.trim() || null,
        rating: editModal.rating === '' ? null : parseFloat(editModal.rating),
      });
      toast.success('Hospital updated successfully!');
      setEditModal({
        open: false,
        hospitalId: null,
        name: '',
        city: '',
        address: '',
        phone: '',
        specialties: '',
        imageUrl: '',
        rating: '',
      });
      fetchHospitals(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.hospitalId) return;
    setSubmitting(true);
    try {
      await hospitalService.remove(deleteModal.hospitalId);
      toast.success('Hospital deleted successfully');
      setDeleteModal({ open: false, hospitalId: null, name: '' });
      fetchHospitals(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1>Manage Hospitals</h1>
            <p>{pageInfo.totalElements} hospitals found</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Hospital'}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search hospitals by name, city, address, or specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
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
              <option value="city">City</option>
              <option value="rating">Rating</option>
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
                Add New Hospital
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Hospital Name *</label>
                    <input name="name" className="form-control" placeholder="e.g. Apollo Hospital" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input name="city" className="form-control" placeholder="e.g. Hyderabad" value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Address *</label>
                    <input name="address" className="form-control" placeholder="Full address" value={form.address} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" className="form-control" placeholder="e.g. +91-40-12345678" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Rating (1-5)</label>
                    <input name="rating" type="number" step="0.1" min="1" max="5" className="form-control" placeholder="e.g. 4.5" value={form.rating} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Specialties</label>
                    <input name="specialties" className="form-control" placeholder="e.g. Cardiology, Neurology, Orthopedics" value={form.specialties} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Image URL</label>
                    <input name="imageUrl" className="form-control" placeholder="https://example.com/hospital.jpg" value={form.imageUrl} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Hospital'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-3">
          {hospitals.map((h) => (
            <div key={h.id} className="card" style={{ overflow: 'hidden' }}>
              {h.imageUrl && (
                <div style={{ height: 140, overflow: 'hidden', background: '#f0f4f8' }}>
                  <img src={h.imageUrl} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="card-body">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaHospital color="var(--primary)" /> {h.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaMapMarkerAlt size={12} /> {h.city} — {h.address}
                </p>
                {h.phone && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaPhone size={12} /> {h.phone}
                  </p>
                )}
                {h.rating && (
                  <p style={{ fontSize: 13, color: '#f39c12', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaStar size={12} /> {h.rating} / 5
                  </p>
                )}
                {h.specialties && (
                  <div style={{ marginTop: 8 }}>
                    {h.specialties.split(',').map((s, i) => (
                      <span key={i} className="badge" style={{ marginRight: 4, marginBottom: 4, fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {h.doctorCount} doctor{h.doctorCount !== 1 ? 's' : ''} registered
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(h)}>Edit</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteModal({ open: true, hospitalId: h.id, name: h.name })}
                  >
                    Delete
                  </button>
                </div>
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
            <h3>Edit Hospital</h3>
            <p className="modal-subtitle">Update hospital details with inline validation.</p>

            <div className="form-group">
              <label>Hospital Name</label>
              <input
                className={`form-control ${editErrors.name ? 'input-error' : ''}`}
                value={editModal.name}
                onChange={(e) => setEditModal((prev) => ({ ...prev, name: e.target.value }))}
              />
              {editErrors.name && <p className="field-error">{editErrors.name}</p>}
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                className={`form-control ${editErrors.city ? 'input-error' : ''}`}
                value={editModal.city}
                onChange={(e) => setEditModal((prev) => ({ ...prev, city: e.target.value }))}
              />
              {editErrors.city && <p className="field-error">{editErrors.city}</p>}
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                className={`form-control ${editErrors.address ? 'input-error' : ''}`}
                value={editModal.address}
                onChange={(e) => setEditModal((prev) => ({ ...prev, address: e.target.value }))}
              />
              {editErrors.address && <p className="field-error">{editErrors.address}</p>}
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                className="form-control"
                value={editModal.phone}
                onChange={(e) => setEditModal((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Rating (1-5)</label>
              <input
                className={`form-control ${editErrors.rating ? 'input-error' : ''}`}
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={editModal.rating}
                onChange={(e) => setEditModal((prev) => ({ ...prev, rating: e.target.value }))}
              />
              {editErrors.rating && <p className="field-error">{editErrors.rating}</p>}
            </div>

            <div className="form-group">
              <label>Specialties</label>
              <input
                className="form-control"
                value={editModal.specialties}
                onChange={(e) => setEditModal((prev) => ({ ...prev, specialties: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                className="form-control"
                value={editModal.imageUrl}
                onChange={(e) => setEditModal((prev) => ({ ...prev, imageUrl: e.target.value }))}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setEditModal({
                  open: false,
                  hospitalId: null,
                  name: '',
                  city: '',
                  address: '',
                  phone: '',
                  specialties: '',
                  imageUrl: '',
                  rating: '',
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
            <h3>Delete Hospital</h3>
            <p className="modal-subtitle">Are you sure you want to delete {deleteModal.name}?</p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteModal({ open: false, hospitalId: null, name: '' })}
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
