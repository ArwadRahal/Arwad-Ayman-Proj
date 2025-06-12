import React, { useState, useEffect } from "react";
import EventModal from "../components/EventModal";
import AddTrainingModal from "../components/AddTrainingModal";
import Sidebar from "../components/Sidebar";
import "../styles/ManagerOverview.css";
import { useNavigate } from "react-router-dom";

export default function ManagerOverview() {
  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState(null); // null = בבדיקה, true = מותר, false = חסום

  const [user] = useState({ role: "manager" });
  const [weekDates, setWeekDates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "Admin") {
      setIsAuthorized(false);
      navigate("/login"); // או "/" אם שם הדף הראשי
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

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

  useEffect(() => {
    if (weekDates.length === 0) return;

    const start = weekDates[0].toISOString().slice(0, 10);
    const end = weekDates[6].toISOString().slice(0, 10);

    fetch("http://localhost:8801/schedule")
      .then((response) => {
        if (!response.ok) throw new Error("בעיה בקבלת המידע מהשרת");
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
        alert("אירעה שגיאה בעת קבלת האימונים");
      });
  }, [weekDates, refreshFlag]);

  function openEventModal(session) {
    setSelectedEvent(session);
    setEventModalOpen(true);
  }

  // ❌ אם עדיין בודקים הרשאה – לא לרנדר כלום
  if (isAuthorized === null) return null;

  // ❌ אם המשתמש חסום – גם לא לרנדר (ליתר ביטחון)
  if (isAuthorized === false) return null;

  return (
    <div className="manager-overview">
      <Sidebar role={user.role} />
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
                  {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][i]}
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
                const sessionDayKey = `${year}-${month}-${date}`;
                return sessionDayKey === dayKey;
              });

              return (
                <div key={i} className="day-column">
                  {daySessions.length === 0 ? (
                    <div className="empty-day">אין אימונים ביום זה</div>
                  ) : (
                    daySessions.map((s, j) => (
                      <div key={j} className="session-card" onClick={() => openEventModal(s)}>
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
          { label: "✏️ עריכה", onClick: () => {} },
          { label: "🗑️ מחיקה", onClick: () => {} },
          { label: "ℹ️ פרטים", onClick: () => {} },
        ]}
      />
    </div>
  );
}
