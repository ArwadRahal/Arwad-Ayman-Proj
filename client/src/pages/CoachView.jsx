import React, { useState, useEffect } from "react";
import EventModal from "../components/EventModal";
import Shop from "../components/Shop";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/CoachView.css";

export default function CoachView() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const coachId = currentUser?.id;
  const coachName = currentUser?.name || "";
  const coachImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const [startOfWeek, setStartOfWeek] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!coachId) return;
    fetch(`http://localhost:8801/schedule/coach/${coachId}`)
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, [coachId]);

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  };

  // YYYY-MM-DD بدون مشاكل توقيت
  const toYmd = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  return (
    <div className="coach-dashboard">
      {/* Header مشابه للمتدرّبة */}
      <div className="coach-header-row">
        <div className="coach-header-profile">
          <img
            src={coachImg}
            alt="Coach"
            className="coach-avatar"
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
          <div className="coach-header-info">
            <h2>שלום {coachName}!</h2>
            <div className="coach-hint">ברוכה הבאה ללוח האימונים השבועי שלך 💜</div>
          </div>
        </div>
        <div className="coach-right-slot" />
      </div>

      {/* تنقل الأسابيع */}
      <div className="week-nav-row">
        <button
          className="week-nav-btn"
          onClick={() =>
            setStartOfWeek((prev) => {
              const d = new Date(prev);
              d.setDate(prev.getDate() - 7);
              return d;
            })
          }
        >
          {"← שבוע קודם"}
        </button>
        <span style={{ fontWeight: "bold", fontSize: 18, margin: "0 12px" }}>
          {weekDates[0].toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })}{" - "}
          {weekDates[6].toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })}
        </span>
        <button
          className="week-nav-btn"
          onClick={() =>
            setStartOfWeek((prev) => {
              const d = new Date(prev);
              d.setDate(prev.getDate() + 7);
              return d;
            })
          }
        >
          {"שבוע הבא →"}
        </button>
      </div>

      {/* جدول الأسبوع */}
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
            const dayKey = toYmd(d); // ✅
            const dayEvents = events.filter((ev) => ev.session_date === dayKey);

            return (
              <div key={i} className="day-column">
                {dayEvents.length === 0 ? (
                  <div className="empty-day">אין אימון</div>
                ) : (
                  dayEvents.map((ev, j) => (
                    <div
                      key={j}
                      className="session-card"
                      onClick={() => {
                        setSelectedEvent(ev);
                        setIsModalOpen(true);
                      }}
                    >
                      <div>
                        <b>
                          {formatTime(ev.start_time)} - {formatTime(ev.end_time)}
                        </b>
                      </div>
                      <div>{ev.session_type}</div>
                      {/* ✅ العدد الحقيقي من الباك־إند */}
                      <div>💪 {ev.participants_count ?? ev.trainee_count ?? 0} משתתפות</div>
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
        actions={[{ label: "סגור", onClick: () => {} }]}
      />

      <Shop />
    </div>
  );
}
