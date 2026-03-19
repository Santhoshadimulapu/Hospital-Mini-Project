import { useState } from 'react';
import { toast } from 'react-toastify';
import doctorService from '../../services/doctorService';
import { useAuth } from '../../utils/AuthContext';
import { daysOfWeek } from '../../utils/helpers';

export default function ManageSlots() {
  const { user } = useAuth();
  const [selectedDays, setSelectedDays] = useState([]);
  const [consultationTime, setConsultationTime] = useState(30);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      toast.warning('Select at least one day');
      return;
    }
    setLoading(true);
    try {
      await doctorService.updateSlots(user.userId, {
        availableDays: selectedDays.join(','),
        consultationTime,
      });
      toast.success('Schedule updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Manage Slots</h1>
          <p>Set your available days and consultation duration</p>
        </div>

        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-body">
            <div className="form-group">
              <label>Available Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`slot-btn ${selectedDays.includes(day) ? 'selected' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Consultation Duration (minutes)</label>
              <select
                className="form-control"
                value={consultationTime}
                onChange={(e) => setConsultationTime(Number(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
