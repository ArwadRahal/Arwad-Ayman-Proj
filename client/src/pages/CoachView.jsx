// src/pages/CoachView.jsx
import React, { useState, useEffect } from 'react';
import EventModal from '../components/EventModal';
import defaultAvatar from '../assets/default-avatar.svg'; 
import '../styles/CoachView.css';

export default function CoachView() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const coachId = currentUser?.id;
  const coachName = currentUser?.name || "";
  // حل مشكلة الصورة هنا 👇
  const coachImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!coachId) return;
    fetch(`http://localhost:8801/schedule/coach/${coachId}`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [coachId]);

  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

  // لتحويل الوقت لصيغة hh:mm (بدون ثواني)
  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  };

  return (
    <div className="coach-dashboard">
      <div className="coach-main-content">
        <div className="coach-header">
          <img
            src={coachImg}
            alt="Coach"
            className="coach-avatar"
            onError={e => { e.target.src = defaultAvatar; }}
          />
          <h2>שלום {coachName}!</h2>
        </div>
        <h3 style={{ margin: "12px 0 18px 0" }}>לוח אימונים לשבוע זה</h3>
        <section className="calendar-weekly">
          <div className="week-header">
            {weekDates.map((d, i) => (
              <div key={i} className="weekday">
                <div className="day-name">{days[i]}</div>
                <div className="day-date">
                  {d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })}
                </div>
              </div>
            ))}
          </div>
          <div className="week-grid">
            {weekDates.map((d, i) => {
              const dayKey = d.toISOString().slice(0, 10);
              const dayEvents = events.filter(ev =>
                new Date(ev.session_date).toISOString().slice(0, 10) === dayKey
              );
              return (
                <div key={i} className="day-column">
                  {dayEvents.length === 0 ? (
                    <div className="empty-day">אין אימון</div>
                  ) : (
                    dayEvents.map((ev, j) => (
                      <div
                        key={j}
                        className="session-card"
                        onClick={() => { setSelectedEvent(ev); setIsModalOpen(true); }}
                      >
                        <div>
                          <b>{formatTime(ev.start_time)} - {formatTime(ev.end_time)}</b>
                        </div>
                        <div>{ev.session_type}</div>
                        <div>💪 {ev.trainee_count || 0} משתתפות</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <EventModal
          isOpen={isModalOpen}
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          actions={[{ label: 'סגור', onClick: () => {} }]}
        />
      </div>
    </div>
  );
}
