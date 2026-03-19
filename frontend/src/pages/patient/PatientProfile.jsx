import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import patientService from '../../services/patientService';
import { useAuth } from '../../utils/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    occupation: '',
    maritalStatus: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientService.getProfile(user.userId);
      const data = res.data.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        age: data.age || '',
        gender: data.gender || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        bloodGroup: data.bloodGroup || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        allergies: data.allergies || '',
        chronicConditions: data.chronicConditions || '',
        currentMedications: data.currentMedications || '',
        occupation: data.occupation || '',
        maritalStatus: data.maritalStatus || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientService.updateProfile(user.userId, formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original profile
    setFormData({
      name: profile.name || '',
      age: profile.age || '',
      gender: profile.gender || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipCode || '',
      bloodGroup: profile.bloodGroup || '',
      emergencyContactName: profile.emergencyContactName || '',
      emergencyContactPhone: profile.emergencyContactPhone || '',
      allergies: profile.allergies || '',
      chronicConditions: profile.chronicConditions || '',
      currentMedications: profile.currentMedications || '',
      occupation: profile.occupation || '',
      maritalStatus: profile.maritalStatus || '',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>My Profile</h1>
            <p>View and manage your personal information</p>
          </div>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <FaEdit style={{ marginRight: 8 }} /> Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ marginRight: 8 }} /> Basic Information
            </h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="age"
                  className="form-control"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  className="form-control"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  className="form-control"
                  value={formData.occupation}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Marital Status</label>
                <select
                  name="maritalStatus"
                  className="form-control"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Contact Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  className="form-control"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  className="form-control"
                  value={formData.zipCode}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="ZIP/Postal Code"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Emergency Contact</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="form-control"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Full name"
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className="form-control"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Medical Information</h2>
            
            <div className="form-group">
              <label>Known Allergies</label>
              <textarea
                name="allergies"
                className="form-control"
                rows="3"
                value={formData.allergies}
                onChange={handleChange}
                disabled={!editing}
                placeholder="List any known allergies (e.g., Penicillin, Peanuts, etc.)"
              />
            </div>

            <div className="form-group">
              <label>Chronic Conditions</label>
              <textarea
                name="chronicConditions"
                className="form-control"
                rows="3"
                value={formData.chronicConditions}
                onChange={handleChange}
                disabled={!editing}
                placeholder="List any chronic medical conditions (e.g., Diabetes, Hypertension, etc.)"
              />
            </div>

            <div className="form-group">
              <label>Current Medications</label>
              <textarea
                name="currentMedications"
                className="form-control"
                rows="3"
                value={formData.currentMedications}
                onChange={handleChange}
                disabled={!editing}
                placeholder="List current medications and dosages"
              />
            </div>
          </div>

          {editing && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
                disabled={saving}
              >
                <FaTimes style={{ marginRight: 8 }} /> Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                <FaSave style={{ marginRight: 8 }} /> 
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
