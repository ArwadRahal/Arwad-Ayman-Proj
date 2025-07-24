// src/components/CalendarView.jsx
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import heLocale from "@fullcalendar/core/locales/he";
import EventModal from "./EventModal";
import "../styles/CalendarView.css";

function getDateOnly(dateTime) {
  if (!dateTime) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) return dateTime;
  if (dateTime.includes("T")) return dateTime.split("T")[0];
  return dateTime;
}

 function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5); 
}

export default function CalendarView({ refreshFlag }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    setRole(user.role || "");
    setUserId(user.id || "");

    const loadEvents = async () => {
      try {
        let url;
        if (user.role === "Trainee") {
          url = `http://localhost:8801/schedule/with-status/${user.id}`;
        } else if (user.role === "Coach") {
          url = `http://localhost:8801/schedule/coach/${user.id}`;
        } else {
          url = "http://localhost:8801/schedule";
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch events (${res.status})`);
        const data = await res.json();
        setEvents(
          data.map(item => ({
            ...item,
            id: item.id.toString(),
            title: item.session_type,
            start: `${getDateOnly(item.session_date)}T${item.start_time}`,
            end: `${getDateOnly(item.session_date)}T${item.end_time}`,
            color:
              user.role === "Trainee"
                ? item.is_registered
                  ? "#71e66f"
                  : "#693b88"
                : "#693b88",
             start_time: formatTime(item.start_time),
            end_time: formatTime(item.end_time),
          }))
        );
      } catch (err) {
        console.error("שגיאה בטעינת אירועים:", err);
        setErrorMsg("שגיאה בטעינת לוח האימונים.");
      }
    };

    loadEvents();
  }, [refreshFlag]);

  const handleEventClick = async info => {
    const event = events.find(e => e.id === info.event.id);
    setSelectedEvent(event);
    setSuccessMsg("");
    setErrorMsg("");
    setIsModalOpen(true);

    if ((role === "Admin" || role === "Coach") && event) {
      try {
        const res = await fetch(
          `http://localhost:8801/schedule/participants/${event.id}`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setParticipants(data);
      } catch (err) {
        console.error("שגיאה בטעינת משתתפות:", err);
        setErrorMsg("לא ניתן לטעון את רשימת המשתתפות.");
      }
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:8801/schedule/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: selectedEvent.id,
          traineeId: userId,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setSuccessMsg("נרשמת בהצלחה לאימון!");
    } catch (err) {
      console.error("שגיאה בהרשמה לאימון:", err);
      setErrorMsg("לא ניתן להירשם לאימון.");
    }
  };

  const handleDelete = async () => {
    const should = window.confirm("את/ה בטוח/ה שברצונך למחוק את האימון?");
    if (!should) return;
    try {
      const res = await fetch(
        `http://localhost:8801/schedule/${selectedEvent.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setIsModalOpen(false);
      setParticipants([]);
      window.location.reload();
    } catch (err) {
      console.error("שגיאה במחיקת אימון:", err);
      setErrorMsg("לא ניתן למחוק את האימון.");
    }
  };

  const handleEdit = () => {
    console.log("עריכת אימון - לא מיושם עדיין");
  };

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={heLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        eventContent={renderEventContent}
      />

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsModalOpen(false);
          setParticipants([]);
        }}
        actions={
          !selectedEvent
            ? []
            : role === "Admin"
            ? [
                { label: "עריכה", onClick: handleEdit },
                { label: "מחיקה", onClick: handleDelete },
              ]
            : selectedEvent.is_registered
            ? []
            : [{ label: "להירשם", onClick: handleRegister }]
        }
      >
        {(role === "Admin" || role === "Coach") && (
          <div style={{ marginTop: 12 }}>
            <b>משתתפות:</b>
            {participants.length > 0 ? (
              <ul style={{ margin: 0, paddingInlineStart: 15 }}>
                {participants.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            ) : (
              <span style={{ color: "#555" }}>אין משתתפות</span>
            )}
          </div>
        )}
      </EventModal>
    </div>
  );
}

function renderEventContent(arg) {
  return (
    <div title={`${arg.event.title} | ${arg.timeText}`}>
      <b>{arg.event.title}</b>
      <div style={{ fontSize: 12 }}>{arg.timeText}</div>
    </div>
  );
}
