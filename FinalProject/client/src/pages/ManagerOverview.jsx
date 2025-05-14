// src/pages/ManagerOverview.jsx
import React, { useState, useEffect } from "react";
import EventModal from "../components/EventModal";
import AddTrainingModal from "../components/AddTrainingModal";
import Sidebar from "../components/Sidebar";
import "../styles/ManagerOverview.css";

export default function ManagerOverview() {
  // fake currentUser for demo—replace with your actual auth state
  const [user] = useState({ role: "manager" });

  const [weekDates, setWeekDates] = useState([]);
  const [sessions, setSessions] = useState([]);

  // For modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // 1. Compute dates for this week (Sunday–Saturday)
  useEffect(() => {
    const today = new Date();
    const dow   = today.getDay(); // 0=Sunday…6=Saturday
    const sun   = new Date(today);
    sun.setDate(today.getDate() - dow);

    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      return d;
    });
    setWeekDates(dates);
  }, []);

  // 2. Load all sessions and filter to this week
  useEffect(() => {
    if (weekDates.length === 0) return;
    fetch("/schedule")
      .then(res => res.json())
      .then(all => {
        const start = weekDates[0].toISOString().slice(0,10);
        const end   = weekDates[6].toISOString().slice(0,10);
        setSessions(all.filter(s =>
          s.session_date >= start && s.session_date <= end
        ));
      });
  }, [weekDates]);

  function openEventModal(session) {
    setSelectedEvent(session);
    setEventModalOpen(true);
  }

  return (
    <div className="manager-overview">
      {/* Right-side sidebar */}
      <Sidebar role={user.role} />

      {/* Main content pushes left of sidebar */}
      <div className="main-area">
        <header className="top-nav">
          <h1>ניהול לוח אימונים</h1>
          <button
            className="add-btn"
            onClick={() => setAddModalOpen(true)}
          >
            ➕ הוספת אימון
          </button>
        </header>

        <section className="calendar-weekly">
          <div className="week-header">
            {weekDates.map((d,i) => (
              <div key={i} className="weekday">
                <div className="day-name">
                  {["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][i]}
                </div>
                <div className="day-date">
                  {d.toLocaleDateString("he-IL",{ day:"numeric", month:"numeric" })}
                </div>
              </div>
            ))}
          </div>

          <div className="week-grid">
            {weekDates.map((d,i) => {
              const dayKey = d.toISOString().slice(0,10);
              const daySessions = sessions.filter(s => s.session_date === dayKey);

              return (
                <div key={i} className="day-column">
                  {daySessions.length === 0
                    ? <div className="empty-day">אין אימונים ביום זה</div>
                    : daySessions.map((s,j) => (
                        <div
                          key={j}
                          className="session-card"
                          onClick={() => openEventModal(s)}
                        >
                          <div><strong>👩‍🏫 {s.coach_name}</strong></div>
                          <div>🕒 {s.start_time}–{s.end_time}</div>
                          <div>🏷️ {s.session_type}</div>
                        </div>
                      ))
                  }
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Add Training Modal */}
      <AddTrainingModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={() => {
          setAddModalOpen(false);
          // reload sessions after add
          fetch("/schedule").then(r=>r.json()).then(a=>setSessions(a));
        }}
      />

      {/* Event Detail / Edit Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => setEventModalOpen(false)}
        actions={[
          { label: "✏️ עריכה", onClick: () => {/* TODO: open edit in AddTrainingModal */} },
          { label: "🗑️ מחיקה", onClick: () => {/* TODO: call DELETE /schedule/:id */} },
          { label: "ℹ️ פרטים", onClick: () => {} }
        ]}
      />
    </div>
  );
}
