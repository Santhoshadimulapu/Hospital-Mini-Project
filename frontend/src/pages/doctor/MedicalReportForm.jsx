import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileAlt, FaStethoscope, FaNotesMedical, FaPrescriptionBottleAlt } from 'react-icons/fa';
import reportService from '../../services/reportService';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../utils/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/helpers';

export default function MedicalReportForm() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    assessment: '',
    diagnosis: '',
    prescription: '',
  });

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const res = await appointmentService.getById(appointmentId);
      setAppointment(res.data.data);
    } catch {
      toast.error('Failed to load appointment details');
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

    if (!formData.assessment.trim() || !formData.diagnosis.trim() || !formData.prescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await reportService.create(user.userId, {
        appointmentId: parseInt(appointmentId),
        assessment: formData.assessment,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
      });
      toast.success('Medical report submitted successfully');
      navigate('/doctor/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!appointment) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3>Appointment not found</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header">
          <h1><FaFileAlt style={{ marginRight: 10 }} />Medical Report</h1>
          <p>Create a medical report for this appointment</p>
        </div>

        {/* Appointment Info Card */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--primary)' }}>Appointment Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Patient Name</div>
              <div style={{ fontWeight: 500 }}>{appointment.patientName}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date</div>
              <div style={{ fontWeight: 500 }}>{formatDate(appointment.appointmentDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time</div>
              <div style={{ fontWeight: 500 }}>{formatTime(appointment.slotTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</div>
              <div style={{ fontWeight: 500 }}>{appointment.status}</div>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              <FaStethoscope style={{ marginRight: 8, color: 'var(--primary)' }} /> Assessment
            </h3>
            <textarea
              name="assessment"
              className="form-control"
              rows="4"
              value={formData.assessment}
              onChange={handleChange}
              placeholder="Enter your assessment of the patient's condition, general health observations, vital signs, etc."
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              <FaNotesMedical style={{ marginRight: 8, color: 'var(--primary)' }} /> Diagnosis
            </h3>
            <textarea
              name="diagnosis"
              className="form-control"
              rows="4"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis details — identified conditions, test results, observations, etc."
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              <FaPrescriptionBottleAlt style={{ marginRight: 8, color: 'var(--primary)' }} /> Prescription
            </h3>
            <textarea
              name="prescription"
              className="form-control"
              rows="4"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="Enter prescribed medications, dosage, instructions, follow-up recommendations, etc."
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/doctor/appointments')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
