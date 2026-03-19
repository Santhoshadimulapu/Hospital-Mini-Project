import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserMd, FaHospital } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import doctorService from '../../services/doctorService';
import hospitalService from '../../services/hospitalService';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../utils/AuthContext';
import { addMinutes, formatTime, generateSlotRanges, rangesOverlap } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [priority, setPriority] = useState(0);
  const [bookedSlots, setBookedSlots] = useState([]);

  const consultationMinutes = Math.max(15, selectedDoctor?.consultationTime || 30);
  const allSlots = generateSlotRanges(9, 17, 30, consultationMinutes);
  const city = localStorage.getItem('selectedCity') || '';

  // Load hospitals on mount
  useEffect(() => {
    const fetch = city
      ? hospitalService.getByCity(city)
      : hospitalService.getAll();

    fetch
      .then((res) => {
        const list = res.data.data || [];
        setHospitals(list);
        setFilteredHospitals(list);
      })
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false));
  }, [city]);

  // Filter hospitals by search
  useEffect(() => {
    if (!hospitalSearch.trim()) {
      setFilteredHospitals(hospitals);
      return;
    }
    const q = hospitalSearch.toLowerCase();
    setFilteredHospitals(
      hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.specialties?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q)
      )
    );
  }, [hospitalSearch, hospitals]);

  // Load doctors when hospital is selected
  useEffect(() => {
    if (selectedHospital) {
      doctorService.getByHospital(selectedHospital.id)
        .then((res) => setDoctors(res.data.data || []))
        .catch(() => toast.error('Failed to load doctors'));
    } else {
      setDoctors([]);
    }
  }, [selectedHospital]);

  // Fetch booked slots when doctor + date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      appointmentService.getByDoctor(selectedDoctor.id)
        .then((res) => {
          const appts = res.data.data || [];
          const taken = appts
            .filter(a => a.appointmentDate === selectedDate && a.status !== 'CANCELLED')
            .map(a => a.slotTime);
          setBookedSlots(taken);
        })
        .catch(() => setBookedSlots([]));
    }
  }, [selectedDoctor, selectedDate]);

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedSlot('');
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.warning('Please select doctor, date, and time slot');
      return;
    }
    setBooking(true);
    try {
      await appointmentService.book({
        patientId: user.userId,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        slotTime: selectedSlot,
        priorityLevel: priority,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Book Appointment</h1>
          <p>Find a hospital, choose a doctor, pick a date and time</p>
        </div>

        {/* Step 1: Hospital Search & Selection */}
        {!selectedHospital ? (
          <>
            <div className="hospital-search-bar">
              <FiSearch size={20} />
              <input
                type="text"
                placeholder="Search hospitals by name, specialty, or address..."
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
              />
            </div>

            {filteredHospitals.length === 0 ? (
              <div className="empty-state">
                <FaHospital size={48} />
                <h3>No hospitals found</h3>
                <p>{hospitalSearch ? 'Try a different search term' : 'No hospitals registered yet'}</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="hospital-card"
                    onClick={() => handleSelectHospital(hospital)}
                  >
                    <div className="hospital-card-header">
                      <div className="hospital-icon">
                        <FaHospital />
                      </div>
                      <div>
                        <h3>{hospital.name}</h3>
                      </div>
                    </div>
                    <div className="hospital-card-body">
                      <p className="hospital-info-row">
                        <span>{hospital.address}, {hospital.city}</span>
                      </p>
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
                        <span className="btn btn-primary btn-sm">Select →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Selected hospital banner */}
            <div className="selected-hospital-banner">
              <div className="selected-hospital-info">
                <FaHospital />
                <div>
                  <strong>{selectedHospital.name}</strong>
                  <span>{selectedHospital.address}, {selectedHospital.city}</span>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setSelectedHospital(null); setSelectedDoctor(null); setDoctors([]); }}
              >
                Change Hospital
              </button>
            </div>

            {/* Step 2: Doctor selection + booking */}
            <div className="book-layout">
              {/* Left: Doctor Selection */}
              <div>
                <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Select Doctor</h3>
                {doctors.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <FaUserMd size={36} />
                    <h3>No doctors available</h3>
                    <p>No doctors registered at this hospital yet</p>
                  </div>
                ) : (
                  <div className="doctor-select-list">
                    {doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className={`doctor-card doctor-card-selectable ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedDoctor(doc); setSelectedSlot(''); }}
                      >
                        <div className="doctor-card-row">
                          <div className="doctor-avatar" style={{ marginBottom: 0, width: 48, height: 48, fontSize: 18 }}>
                            <FaUserMd />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 15 }}>Dr. {doc.name}</h3>
                            <p className="specialization">{doc.specialization}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.consultationTime} min • {doc.availableDays}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Date, Slot, Priority */}
              <div>
                {selectedDoctor && (
                  <div className="card">
                    <div className="card-body">
                      <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
                        Booking with Dr. {selectedDoctor.name}
                      </h3>

                      <div className="form-group">
                        <label>Appointment Date</label>
                        <input
                          type="date"
                          className="form-control"
                          min={today}
                          value={selectedDate}
                          onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                        />
                      </div>

                      {selectedDate && (
                        <>
                          <div className="form-group">
                            <label>Available Time Slots</label>
                            <div className="slot-grid">
                              {allSlots.map((slot) => {
                                const isBooked = bookedSlots.some((bookedStart) =>
                                  rangesOverlap(
                                    slot.start,
                                    slot.end,
                                    bookedStart,
                                    addMinutes(bookedStart, consultationMinutes)
                                  )
                                );
                                return (
                                  <button
                                    key={slot.start}
                                    type="button"
                                    className={`slot-btn ${selectedSlot === slot.start ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                    disabled={isBooked}
                                    onClick={() => setSelectedSlot(slot.start)}
                                  >
                                    {formatTime(slot.start)} - {formatTime(slot.end)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Priority Level</label>
                            <select className="form-control" value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
                              <option value={0}>Normal</option>
                              <option value={1}>Medium Priority</option>
                              <option value={2}>Emergency</option>
                            </select>
                          </div>

                          <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            onClick={handleBook}
                            disabled={!selectedSlot || booking}
                          >
                            {booking ? 'Booking...' : 'Confirm Appointment'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!selectedDoctor && doctors.length > 0 && (
                  <div className="empty-state">
                    <FaUserMd size={48} />
                    <h3>Select a doctor</h3>
                    <p>Choose from the list on the left to proceed</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
