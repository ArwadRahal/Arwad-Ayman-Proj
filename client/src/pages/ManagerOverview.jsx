// src/pages/ManagerOverview.jsx
import React, { useState, useEffect } from "react";
import EventModal from "../components/EventModal";
import AddTrainingModal from "../components/AddTrainingModal";
import "../styles/ManagerOverview.css";
import { useNavigate } from "react-router-dom";

export default function ManagerOverview() {
  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  // בדיקת הרשאה
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "Admin") {
      setIsAuthorized(false);
      navigate("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  // חישוב תאריכי השבוע
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });

    setWeekDates(dates);
  }, []);

  // Fetch לשרטוט האימונים בתוך השבוע
  useEffect(() => {
    if (weekDates.length === 0) return;

    const start = weekDates[0].toISOString().slice(0, 10);
    const end = weekDates[6].toISOString().slice(0, 10);

    fetch("http://localhost:8801/schedule")
      .then((response) => {
        if (!response.ok) {
          console.error("בעיה בקבלת המידע מהשרת:", response.statusText);
          return Promise.reject();
        }
        return response.json();
      })
      .then((data) => {
        const filtered = data.filter(
          (s) => s.session_date >= start && s.session_date <= end
        );
        setSessions(filtered);
      })
      .catch((error) => {
        console.error("❌ שגיאה בהבאת הנתונים:", error);
      });
  }, [weekDates, refreshFlag]);

  function openEventModal(session) {
    setSelectedEvent(session);
    setEventModalOpen(true);
  }

  if (isAuthorized === null) return null;
  if (isAuthorized === false) return null;

  return (
    <div className="manager-overview">
      <div className="main-area">
        <header className="top-nav">
          <h1>ניהול לוח אימונים</h1>
          <button className="add-btn" onClick={() => setAddModalOpen(true)}>
            ➕ הוספת אימון
          </button>
        </header>

        <section className="calendar-weekly">
          <div className="week-header">
            {weekDates.map((d, i) => (
              <div key={i} className="weekday">
                <div className="day-name">
                  {["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][i]}
                </div>
                <div className="day-date">
                  {d.toLocaleDateString("he-IL", {
                    day: "numeric",
                    month: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="week-grid">
            {weekDates.map((d, i) => {
              const dayKey = d.toISOString().slice(0, 10);
              const daySessions = sessions.filter((s) => {
                const localDate = new Date(s.session_date);
                const year = localDate.getFullYear();
                const month = String(localDate.getMonth() + 1).padStart(2, "0");
                const date = String(localDate.getDate()).padStart(2, "0");
                return `${year}-${month}-${date}` === dayKey;
              });

              return (
                <div key={i} className="day-column">
                  {daySessions.length === 0 ? (
                    <div className="empty-day">אין אימונים ביום זה</div>
                  ) : (
                    daySessions.map((s, j) => (
                      <div
                        key={j}
                        className="session-card"
                        onClick={() => openEventModal(s)}
                      >
                        <div>
                          <strong>👩‍🏫 מאמנת {s.coach_name}</strong>
                        </div>
                        <div>🕒 {s.start_time}–{s.end_time || ""}</div>
                        <div>🏷️ {s.session_type}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <AddTrainingModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={() => {
          setAddModalOpen(false);
          setRefreshFlag((prev) => !prev);
        }}
      />

      <EventModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => setEventModalOpen(false)}
        actions={[
          { label: "✏️ עריכה", onClick: () => console.log("עריכה תיכון") },
          { label: "🗑️ מחיקה", onClick: () => console.log("מחיקה תיכון") },
          { label: "ℹ️ פרטים", onClick: () => console.log("הצגת פרטים") },
        ]}
      />
    </div>
  );
}
