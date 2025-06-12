import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import heLocale from "@fullcalendar/core/locales/he";
import EventModal from "./EventModal";
import "../styles/CalendarView.css";

// دالة استخراج اليوم فقط من session_date
function getDateOnly(dateTime) {
  if (!dateTime) return "";
  // إذا هو أصلاً yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) return dateTime;
  // إذا فيه "T"
  if (dateTime.includes("T")) return dateTime.split("T")[0];
  // أي صيغة ثانية، رجّعه كما هو
  return dateTime;
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
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setRole(user?.role || "");
    setUserId(user?.id || "");
    if (user?.role === "Trainee") {
      fetch(`http://localhost:8801/schedule/with-status/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setEvents(
            data.map(item => ({
              ...item,
              id: item.id.toString(),
              title: item.session_type,
              start: `${getDateOnly(item.session_date)}T${item.start_time}`,
              end: `${getDateOnly(item.session_date)}T${item.end_time}`,
              color: item.is_registered ? "#71e66f" : "#693b88",
            }))
          );
        });
    } else {
      fetch("http://localhost:8801/schedule")
        .then(res => res.json())
        .then(data => {
          setEvents(
            data.map(item => ({
              ...item,
              id: item.id.toString(),
              title: item.session_type,
              start: `${getDateOnly(item.session_date)}T${item.start_time}`,
              end: `${getDateOnly(item.session_date)}T${item.end_time}`,
              color: "#693b88"
            }))
          );
        });
    }
  }, [refreshFlag]);

  const handleEventClick = async (info) => {
    const event = events.find(e => e.id === info.event.id);
    setSelectedEvent(event);
    setSuccessMsg("");
    setErrorMsg("");
    setIsModalOpen(true);

    if (role === "Admin" && event) {
      const res = await fetch(`http://localhost:8801/schedule/participants/${event.id}`);
      const data = await res.json();
      setParticipants(data);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:8801/schedule/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: selectedEvent.id, traineeId: userId }),
      });
      if (res.ok) {
        setSuccessMsg("נרשמת בהצלחה לאימון!");
      } else {
        setErrorMsg("שגיאה בהרשמה לאימון.");
      }
    } catch {
      setErrorMsg("שגיאת רשת בהרשמה לאימון.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("את/ה בטוח/ה שברצונך למחוק את האימון?")) return;
    try {
      const res = await fetch(`http://localhost:8801/schedule/${selectedEvent.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg("שגיאה במחיקת אימון.");
      }
    } catch {
      setErrorMsg("שגיאת רשת במחיקה.");
    }
  };

  const handleEdit = () => {
    alert("עריכת אימון - לא ממומש עדיין :)");
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
          right: ""
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        eventContent={renderEventContent}
      />
      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsModalOpen(false);
          setParticipants([]);
        }}
        actions={
          !selectedEvent ? [] :
          role === "Admin" ? [
            { label: "עריכה", onClick: handleEdit },
            { label: "מחיקה", onClick: handleDelete }
          ] : (
            selectedEvent.is_registered
              ? []
              : [{ label: "להירשם", onClick: handleRegister }]
          )
        }
      >
        {role === "Admin" && (
          <div style={{ marginTop: 12 }}>
            <b>משתתפות:</b>
            {participants.length > 0 ? (
              <ul style={{ margin: 0, paddingInlineStart: 15 }}>
                {participants.map((name, i) => <li key={i}>{name}</li>)}
              </ul>
            ) : (
              <span style={{ color: "#555" }}>אין משתתפות עדיין</span>
            )}
          </div>
        )}
        {role === "Trainee" && (
          <div style={{ marginTop: 10 }}>
            {successMsg && <span style={{ color: "green" }}>{successMsg}</span>}
            {errorMsg && <span style={{ color: "red" }}>{errorMsg}</span>}
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
