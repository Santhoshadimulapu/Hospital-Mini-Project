import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserMd, FaClock, FaCalendarAlt } from 'react-icons/fa';
import patientService from '../../services/patientService';
import queueService from '../../services/queueService';
import { useAuth } from '../../utils/AuthContext';
import { formatDate, formatTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function QueueStatus() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [queueData, setQueueData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAppointmentsAndQueues = async () => {
    try {
      // Fetch patient's appointments
      const res = await patientService.getAppointments(user.userId);
      const appts = res.data.data || [];
      
      // Filter only BOOKED and WAITING appointments
      const activeAppts = appts.filter(a => 
        a.status === 'BOOKED' || a.status === 'WAITING'
      );
      
      setAppointments(activeAppts);

      // Fetch queue status for each doctor
      const queues = {};
      for (const appt of activeAppts) {
        try {
          const qRes = await queueService.getStatus(appt.doctorId);
          queues[appt.doctorId] = qRes.data.data || [];
        } catch (err) {
          console.error('Failed to fetch queue for doctor', appt.doctorId);
        }
      }
      setQueueData(queues);
    } catch (error) {
      toast.error('Failed to load queue status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndQueues();
    // Refresh every 15 seconds
    const interval = setInterval(fetchAppointmentsAndQueues, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (appointments.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header">
            <h1>My Queue Status</h1>
            <p>Track your position in the queue for your appointments</p>
          </div>
          <div className="empty-state">
            <FaCalendarAlt size={48} />
            <h3>No Active Appointments</h3>
            <p>You don't have any booked appointments to track. Book an appointment to see your queue status.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>My Queue Status</h1>
          <p>Track your position in the queue for your appointments</p>
        </div>

        <div className="grid grid-2">
          {appointments.map((appt) => {
            const queue = queueData[appt.doctorId] || [];
            const myQueueEntry = queue.find(q => q.patientId === user.userId);
            const myPosition = myQueueEntry ? myQueueEntry.queueNumber : null;
            
            return (
              <div key={appt.id} className="card" style={{ padding: '20px' }}>
                <div className="queue-doctor-info" style={{ marginBottom: 16 }}>
                  <div className="doctor-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>
                    <FaUserMd />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, marginBottom: 4 }}>Dr. {appt.doctorName}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>
                      {appt.specialization}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <FaCalendarAlt style={{ marginRight: 4, fontSize: 10 }} />
                      {formatDate(appt.appointmentDate)} at {formatTime(appt.slotTime)}
                    </p>
                  </div>
                </div>

                {myPosition !== null ? (
                  <>
                    <div style={{ 
                      background: 'var(--primary-light)', 
                      borderRadius: 8, 
                      padding: '16px',
                      textAlign: 'center',
                      marginBottom: 12
                    }}>
                      <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--primary)' }}>
                        #{myPosition}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Your Queue Number
                      </div>
                    </div>

                    <div className="wait-time" style={{ marginBottom: 8 }}>
                      <FaClock style={{ marginRight: 6 }} />
                      Est. wait: <span>{myQueueEntry.estimatedTime} min</span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                      <strong>{queue.length}</strong> patient(s) in queue
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    background: '#f5f5f5', 
                    borderRadius: 8, 
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                      You are not yet in the queue. The queue will be updated when your appointment is active.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
          ↻ Queue status refreshes automatically every 15 seconds
        </p>
      </div>
    </div>
  );
}
