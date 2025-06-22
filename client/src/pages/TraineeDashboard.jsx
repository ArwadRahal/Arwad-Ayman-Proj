// src/pages/TraineeView.jsx
import React, { useState, useEffect } from 'react';
import EventModal from '../components/EventModal';
import '../styles/TraineeDashboard.css';

export default function TraineeView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const traineeId = user?.id;
    if (!traineeId) return;
    fetch(`http://localhost:8801/schedule/trainee/${traineeId}`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const startOfWeek = (() => {
    const d = new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  })();
  const endOfWeek = (() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 6);
    return d;
  })();

  const weekEvents = events.filter(ev => {
    const d = new Date(ev.session_date);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const getDayName = dateStr => days[new Date(dateStr).getDay()];

  const eventsByDay = days.reduce((acc, day) => {
    acc[day] = []; return acc;
  }, {});
  weekEvents.forEach(ev => {
    const day = getDayName(ev.session_date);
    eventsByDay[day].push(ev);
  });

  return (
    <div className="trainee-dashboard">
      <div className="dashboard-content">
        <h2>לוח אימונים שבועי</h2>
        <div className="schedule-grid">
          {days.map(day => (
            <div key={day} className="day-card">
              <h3>{day}</h3>
              {eventsByDay[day].length > 0 ? (
                eventsByDay[day].map((ev,i) => (
                  <div
                    key={i}
                    className="event-box"
                    onClick={() => { setSelectedEvent(ev); setIsModalOpen(true); }}
                  >
                    <p>{ev.start_time} - {ev.end_time}</p>
                    <p>{ev.coach_name}</p>
                    <p>{ev.session_type}</p>
                  </div>
                ))
              ) : (
                <p className="empty">אין אימון</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => setIsModalOpen(false)}
        actions={[{ label: 'סגור', onClick: () => {} }]}
      />
    </div>
  );
}
