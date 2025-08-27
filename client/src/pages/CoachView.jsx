// src/pages/CoachView.jsx
import React, { useEffect, useMemo, useState } from "react";
import EventModal from "../components/EventModal";
import Shop from "../components/Shop";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/CoachView.css";

function toYmdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function formatHM(time) {
  if (!time) return "";
  const [h, m] = String(time).split(":");
  return `${h ?? ""}:${m ?? ""}`;
}
export default function CoachView() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const coachId = currentUser?.id;
  const coachName = currentUser?.name || "";
  const coachImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const [startOfWeek, setStartOfWeek] = useState(() => {
    const today = new Date();
    const dow = today.getDay(); 
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dow);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });
  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return d;
      }),
    [startOfWeek]
  );
  const [allCoachEvents, setAllCoachEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    if (!coachId) return;
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`http://localhost:8801/schedule/coach/${coachId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllCoachEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrorMsg("שגיאה בטעינת האימונים.");
        setAllCoachEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [coachId]);
  const eventsByDay = useMemo(() => {
    const begin = toYmdLocal(weekDates[0]);
    const end = toYmdLocal(weekDates[6]);
    const filtered = (allCoachEvents || []).filter((ev) => {
      const d = ev.session_date || ev.Date;
      return d >= begin && d <= end;
    });
    const map = new Map();
    for (const d of weekDates) map.set(toYmdLocal(d), []);
    for (const ev of filtered) {
      const key = ev.session_date || ev.Date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) =>
        String(a.start_time || a.StartTime).localeCompare(String(b.start_time || b.StartTime))
      );
      map.set(k, arr);
    }
    return map;
  }, [allCoachEvents, weekDates]);
  const openEvent = async (ev) => {
    setSelectedEvent(ev);
    setIsModalOpen(true);
    setParticipants([]);
    setModalLoading(true);
    try {
      const id = ev.id ?? ev.ExerciseID;
      const res = await fetch(`http://localhost:8801/schedule/participants/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (e) {
    } finally {
      setModalLoading(false);
    }
  };
  return (
    <div className="coach-dashboard">
      <div className="coach-header-row">
        <div className="coach-header-profile">
          <img
            src={coachImg}
            alt="Coach"
            className="coach-avatar"
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
          />
          <div className="coach-header-info">
            <h2>שלום {coachName}!</h2>
            <div className="coach-hint">ברוכה הבאה ללוח האימונים השבועי שלך 💜</div>
          </div>
        </div>
        <div className="coach-right-slot" />
      </div>
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
          ← שבוע קודם
        </button>
        <span style={{ fontWeight: "bold", fontSize: 18, margin: "0 12px" }}>
          {weekDates[0].toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })} -{" "}
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
          שבוע הבא →
        </button>
      </div>
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
        {errorMsg && (
          <div style={{ color: "#b10020", margin: "6px 0 10px", textAlign: "center" }}>{errorMsg}</div>
        )}
        <div className="week-grid">
          {weekDates.map((d, i) => {
            const key = toYmdLocal(d);
            const dayEvents = eventsByDay.get(key) || [];
            return (
              <div key={i} className="day-column">
                {loading ? (
                  <div className="empty-day">טוען…</div>
                ) : dayEvents.length === 0 ? (
                  <div className="empty-day">אין אימון</div>
                ) : (
                  dayEvents.map((ev, j) => (
                    <div key={j} className="session-card" onClick={() => openEvent(ev)}>
                      <div className="sc-time">
                        <b>
                          {formatHM(ev.start_time || ev.StartTime)} - {formatHM(ev.end_time || ev.EndTime)}
                        </b>
                      </div>
                      <div className="sc-type">{ev.session_type || ev.TypeName || ""}</div>
                      <div className="sc-part">
                        💪 {ev.participants_count ?? ev.trainee_count ?? 0} משתתפות
                      </div>
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
        participants={participants}
        showParticipants={true}
      >
        {modalLoading && <div style={{ color: "#555", marginTop: 8 }}>טוען...</div>}
      </EventModal>
      <div className="shop-wrapper">
        <Shop />
      </div>
    </div>
  );
}
