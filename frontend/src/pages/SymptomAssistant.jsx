import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeartbeat, FaSearch, FaHospital, FaUserMd, FaExclamationTriangle, FaRobot, FaPills, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import aiService from '../services/aiService';
import LoadingSpinner from '../components/LoadingSpinner';

const urgencyColors = {
  HIGH:    { bg: '#fff2f2', border: '#e74c3c', text: '#b33939', label: 'HIGH URGENCY' },
  MEDIUM:  { bg: '#fff8f0', border: '#e67e22', text: '#b85c00', label: 'MEDIUM URGENCY' },
  LOW:     { bg: '#f0fff4', border: '#27ae60', text: '#196f3d', label: 'LOW URGENCY' },
  UNKNOWN: { bg: '#f8fafc', border: '#95a5a6', text: '#7f8c8d', label: 'URGENCY UNKNOWN' },
};

export default function SymptomAssistant() {
  const [symptoms, setSymptoms] = useState('');
  const [city, setCity] = useState(localStorage.getItem('selectedCity') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error('Please enter your symptoms');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.recommendDoctors({
        symptoms: symptoms.trim(),
        city: city.trim() || null,
      });
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const urgency = result ? (urgencyColors[result.urgencyLevel] || urgencyColors.UNKNOWN) : null;
  const isGpt = result?.aiProvider === 'GPT-4o-mini';

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="page-header">
          <h1>AI Symptom Assistant</h1>
          <p>Describe symptoms to get suggested specializations and doctors</p>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Symptoms *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Example: chest pain, shortness of breath, fatigue for 2 days"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Preferred City (optional)</label>
                <input
                  className="form-control"
                  placeholder="Example: Hyderabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSearch style={{ marginRight: 8 }} />
                {loading ? 'Analyzing...' : 'Get AI Recommendation'}
              </button>
            </form>
          </div>
        </div>

        {loading && <LoadingSpinner />}

        {result && (
          <>
            {/* Urgency badge */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {result.urgencyLevel && result.urgencyLevel !== 'UNKNOWN' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: urgency.bg, color: urgency.text,
                  border: `1px solid ${urgency.border}`
                }}>
                  {urgency.label}
                </span>
              )}
            </div>

            {result.emergencyFlag && (
              <div className="card" style={{ marginBottom: 20, border: '1px solid #e74c3c', background: '#fff5f5' }}>
                <div className="card-body" style={{ color: '#b33939', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <FaExclamationTriangle style={{ marginTop: 4 }} />
                  <div>
                    <h3 style={{ marginBottom: 6 }}>Urgent Attention Suggested</h3>
                    <p>{result.emergencyMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* GPT reasoning block */}
            {isGpt && result.aiReasoning && (
              <div className="card" style={{ marginBottom: 20, border: '1px solid #a8d8f0', background: '#eaf6ff' }}>
                <div className="card-body">
                  <h4 style={{ marginBottom: 8, color: '#1a6fa0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaRobot /> AI Analysis
                  </h4>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#1a4f70' }}>{result.aiReasoning}</p>
                </div>
              </div>
            )}

            <div className="card" style={{ marginBottom: 20, border: '1px solid #e67e22', background: '#fff7eb' }}>
              <div className="card-body" style={{ color: '#9a4d00', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <FaExclamationTriangle style={{ marginTop: 4 }} />
                <div>
                  <h3 style={{ marginBottom: 6 }}>Medication Safety Warning</h3>
                  <p style={{ margin: 0 }}>
                    AI medication suggestions are for informational support only. Always verify with a qualified doctor and do not blindly follow AI suggestions.
                  </p>
                </div>
              </div>
            </div>

            {result.symptomSummary && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                  <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaInfoCircle /> Symptom Information
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.symptomSummary}</p>
                </div>
              </div>
            )}

            {(result.medicationSuggestions || []).length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                  <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPills /> Suggested Medications to Discuss with Doctor
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {(result.medicationSuggestions || []).map((med, idx) => (
                      <div key={`${med.name || 'med'}-${idx}`} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: '#fafafa' }}>
                        <h4 style={{ marginBottom: 6 }}>{med.name || 'Medication option'}</h4>
                        {med.purpose && (
                          <p style={{ marginBottom: 6, color: 'var(--text-muted)' }}>
                            <strong>Information:</strong> {med.purpose}
                          </p>
                        )}
                        {med.precautions && (
                          <p style={{ margin: 0, color: '#b33939' }}>
                            <strong>Precaution:</strong> {med.precautions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(result.precautions || []).length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                  <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaShieldAlt /> General Precautions
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)' }}>
                    {(result.precautions || []).map((item, idx) => (
                      <li key={`precaution-${idx}`} style={{ marginBottom: 6 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaHeartbeat /> Recommended Specializations
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {(result.specializationMatches || []).map((item, idx) => (
                    <span key={`${item.specialization}-${idx}`} className="badge" style={{ padding: '10px 12px' }}>
                      {item.specialization} {!isGpt && `(score: ${item.score})`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="page-header" style={{ marginTop: 12 }}>
              <h2 style={{ fontSize: 22 }}>Suggested Doctors</h2>
              <p>{(result.doctorSuggestions || []).length} recommendation(s)</p>
            </div>

            {(result.doctorSuggestions || []).length === 0 ? (
              <div className="empty-state">
                <h3>No matching doctors found</h3>
                <p>Try a broader symptom description.</p>
              </div>
            ) : (
              <div className="grid grid-3">
                {(result.doctorSuggestions || []).map((doc) => (
                  <div key={doc.doctorId} className="doctor-card">
                    <div className="doctor-avatar"><FaUserMd /></div>
                    <h3>Dr. {doc.doctorName}</h3>
                    <p className="specialization">{doc.specialization}</p>
                    <p className="consultation-time">{doc.consultationTime || 15} min consultation</p>

                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaHospital size={12} />
                      {doc.hospitalName || 'Hospital not assigned'}
                      {doc.hospitalCity ? `, ${doc.hospitalCity}` : ''}
                    </p>

                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      {doc.hospitalId && (
                        <Link to={`/hospitals/${doc.hospitalId}`} className="btn btn-outline btn-sm">View Hospital</Link>
                      )}
                      <Link to="/patient/book" className="btn btn-primary btn-sm">Book</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card" style={{ marginTop: 24, background: '#f8fafc' }}>
              <div className="card-body">
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
                  <strong>Disclaimer:</strong> {result.disclaimer}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

