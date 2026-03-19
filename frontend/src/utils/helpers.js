export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${suffix}`;
};

export const getStatusBadgeClass = (status) => {
  const map = {
    BOOKED: 'badge-booked',
    WAITING: 'badge-waiting',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
  };
  return map[status] || 'badge-booked';
};

export const generateTimeSlots = (start = 9, end = 17, interval = 30) => {
  const slots = [];
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

export const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const toTimeString = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const addMinutes = (timeStr, minutesToAdd) => {
  return toTimeString(toMinutes(timeStr) + minutesToAdd);
};

export const generateSlotRanges = (
  startHour = 9,
  endHour = 17,
  interval = 30,
  consultationMinutes = 30
) => {
  const dayStart = startHour * 60;
  const dayEnd = endHour * 60;
  const slots = [];

  for (let start = dayStart; start + consultationMinutes <= dayEnd; start += interval) {
    slots.push({
      start: toTimeString(start),
      end: toTimeString(start + consultationMinutes),
    });
  }

  return slots;
};

export const rangesOverlap = (startA, endA, startB, endB) => {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
};

export const daysOfWeek = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];
