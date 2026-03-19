import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import patientService from '../services/patientService';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', age: '', gender: 'Male',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientService.register({ ...form, age: parseInt(form.age, 10) });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.data && typeof data.data === 'object') {
        Object.values(data.data).forEach((msg) => toast.error(msg));
      } else {
        toast.error(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join MedQueue to book appointments</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" className="form-control" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input name="phone" className="form-control" placeholder="10-digit phone number" value={form.phone} onChange={handleChange} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" className="form-control" placeholder="25" value={form.age} onChange={handleChange} required min={1} max={150} />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
