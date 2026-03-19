import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaEnvelope, FaPhone, FaLock, FaEdit, FaSave, FaTimes, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import patientService from '../../services/patientService';
import { useAuth } from '../../utils/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Security info editing
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securityData, setSecurityData] = useState({
    phone: '',
    email: '',
  });

  // Password changing
  const [editingPassword, setEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Delete account
  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=first confirm, 2=final confirm
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteCustomReason, setDeleteCustomReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientService.getProfile(user.userId);
      const data = res.data.data;
      setProfile(data);
      setSecurityData({
        phone: data.phone || '',
        email: data.email || '',
      });
    } catch (error) {
      toast.error('Failed to load account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSavingSecurity(true);
    try {
      await patientService.updateSecurity(user.userId, securityData);
      toast.success('Contact information updated successfully');
      setEditingSecurity(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update contact information');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await patientService.changePassword(user.userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setEditingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelSecurity = () => {
    setEditingSecurity(false);
    setSecurityData({
      phone: profile.phone || '',
      email: profile.email || '',
    });
  };

  const handleCancelPassword = () => {
    setEditingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    const finalReason = deleteReason === 'Other' ? deleteCustomReason.trim() : deleteReason;
    if (!finalReason) {
      toast.error('Please provide a reason for deletion');
      return;
    }
    setDeleting(true);
    try {
      await patientService.deleteAccount(user.userId, { reason: finalReason });
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteStep(0);
    setDeleteReason('');
    setDeleteCustomReason('');
    setDeleteConfirmText('');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Account & Security</h1>
          <p>Manage your account settings and security preferences</p>
        </div>

        {/* Contact Information Section */}
        <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, display: 'flex', alignItems: 'center', margin: 0 }}>
              <FaShieldAlt style={{ marginRight: 8 }} /> Contact Information
            </h2>
            {!editingSecurity && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditingSecurity(true)}>
                <FaEdit style={{ marginRight: 6 }} /> Edit
              </button>
            )}
          </div>

          {!editingSecurity ? (
            <div>
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <FaEnvelope style={{ marginRight: 12, color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{profile.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaPhone style={{ marginRight: 12, color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Phone</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{profile.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSecuritySubmit}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={securityData.email}
                  onChange={handleSecurityChange}
                  required
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  Used for login and communications
                </small>
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={securityData.phone}
                  onChange={handleSecurityChange}
                  required
                  pattern="^[+]?[0-9]{10,15}$"
                  title="Phone must be 10-15 digits"
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  Used for appointment notifications
                </small>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleCancelSecurity}
                  disabled={savingSecurity}
                >
                  <FaTimes style={{ marginRight: 6 }} /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={savingSecurity}
                >
                  <FaSave style={{ marginRight: 6 }} /> 
                  {savingSecurity ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Password Section */}
        <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, display: 'flex', alignItems: 'center', margin: 0 }}>
              <FaLock style={{ marginRight: 8 }} /> Password
            </h2>
            {!editingPassword && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditingPassword(true)}>
                <FaEdit style={{ marginRight: 6 }} /> Change Password
              </button>
            )}
          </div>

          {!editingPassword ? (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                ••••••••••••
              </p>
              <small style={{ color: 'var(--text-muted)' }}>
                Last changed: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </small>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  Must be at least 6 characters
                </small>
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleCancelPassword}
                  disabled={savingPassword}
                >
                  <FaTimes style={{ marginRight: 6 }} /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={savingPassword}
                >
                  <FaSave style={{ marginRight: 6 }} /> 
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Info */}
        <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Account Information</h2>
          
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account ID</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.id}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Member Since</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="card" style={{ padding: '24px', border: '1px solid #e74c3c' }}>
          <h2 style={{ fontSize: 18, color: '#e74c3c', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <FaExclamationTriangle style={{ marginRight: 8 }} /> Danger Zone
          </h2>

          {deleteStep === 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Delete Account</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </div>
              </div>
              <button
                className="btn btn-sm"
                style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
                onClick={() => setDeleteStep(1)}
              >
                <FaTrashAlt style={{ marginRight: 6 }} /> Delete Account
              </button>
            </div>
          )}

          {deleteStep === 1 && (
            <div style={{ backgroundColor: '#fdf2f2', padding: 20, borderRadius: 8 }}>
              <p style={{ fontWeight: 600, color: '#c0392b', marginBottom: 12 }}>
                Are you sure you want to delete your account?
              </p>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                This will permanently delete your profile, all appointments, and queue entries. 
                You will not be able to recover this data.
              </p>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 6 }}>Why are you deleting your account? *</label>
                <select
                  className="form-control"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="No longer need the service">No longer need the service</option>
                  <option value="Found a better alternative">Found a better alternative</option>
                  <option value="Privacy concerns">Privacy concerns</option>
                  <option value="Difficult to use">Difficult to use</option>
                  <option value="Too many notifications">Too many notifications</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {deleteReason === 'Other' && (
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 6 }}>Please specify *</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={deleteCustomReason}
                    onChange={(e) => setDeleteCustomReason(e.target.value)}
                    placeholder="Tell us why you're leaving..."
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none' }}
                  onClick={() => {
                    if (!deleteReason) {
                      toast.error('Please select a reason');
                      return;
                    }
                    if (deleteReason === 'Other' && !deleteCustomReason.trim()) {
                      toast.error('Please specify your reason');
                      return;
                    }
                    setDeleteStep(2);
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <div style={{ backgroundColor: '#fdf2f2', padding: 20, borderRadius: 8 }}>
              <p style={{ fontWeight: 600, color: '#c0392b', marginBottom: 12 }}>
                <FaExclamationTriangle style={{ marginRight: 6 }} />
                Final Confirmation
              </p>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                This is your last chance. Type <strong>DELETE</strong> below to permanently delete your account.
              </p>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 6 }}>Type DELETE to confirm *</label>
                <input
                  type="text"
                  className="form-control"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  style={{ borderColor: '#e74c3c' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm"
                  style={{ 
                    backgroundColor: deleteConfirmText === 'DELETE' ? '#c0392b' : '#ccc', 
                    color: '#fff', 
                    border: 'none' 
                  }}
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== 'DELETE'}
                >
                  <FaTrashAlt style={{ marginRight: 6 }} />
                  {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
