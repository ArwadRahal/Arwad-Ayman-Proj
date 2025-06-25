// src/pages/TraineeView.jsx
import React, { useState, useEffect } from 'react';
import EventModal from '../components/EventModal';
import MotivationalBanner from '../components/MotivationalBanner';
import defaultAvatar from '../assets/default-avatar.svg';
import '../styles/TraineeDashboard.css';

export default function TraineeView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  // جلب بيانات المتدرّبة من ال-localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const traineeName = currentUser?.name || "";
  // معالجة الصورة لتكون من السيرفر إذا موجودة
  const traineeImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  useEffect(() => {
    const traineeId = currentUser?.id;
    if (!traineeId) return;
    fetch(`http://localhost:8801/schedule/trainee/${traineeId}`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
    // eslint-disable-next-line
  }, []);

  // حساب تواريخ الأسبوع الحالي
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

  // دالة تنسيق الوقت hh:mm
  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  };

  return (
    <div className="trainee-dashboard">
      <div className="main-content">
        <div className="trainee-header">
          <img
            src={traineeImg}
            alt="Trainee"
            className="trainee-avatar"
            onError={e => { e.target.src = defaultAvatar; }}
          />
          <h2>שלום {traineeName}!</h2>
        </div>
        <MotivationalBanner />
        <h3 className="schedule-title">לוח אימונים לשבוע זה</h3>
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
                        <div>מאמנת: {ev.coach_name}</div>
                        <div>{ev.session_type}</div>
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
