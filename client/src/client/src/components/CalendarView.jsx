// src/components/CalendarView.jsx
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import heLocale from "@fullcalendar/core/locales/he";
import EventModal from "./EventModal";
import "../styles/CalendarView.css";

const TYPE_COLORS = {
  Group: "#3fd0d4",
  Couple: "#ffb44c",
  Single: "#cb5ae6",
  default: "#693b88",
};

const TYPE_LABELS = {
  Group: "קבוצתי",
  Couple: "זוגי",
  Single: "אישי",
};

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
  const [cancelError, setCancelError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    setRole(user.role || "");
    setUserId(user.id || "");
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const user = JSON.parse(localStorage.getItem("currentUser")) || {};
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
      let data = await res.json();

      setEvents(
        Array.isArray(data)
          ? data.map((item) => {
              let type =
                item.allowed_membership ||
                item.AllowedMembership ||
                item.membershipType ||
                item.group_type ||
                item.type ||
                "Group";
              if (!["Group", "Couple", "Single"].includes(type)) type = "Group";

              const session_date = item.session_date || item.Date || "";
              const start_time = formatTime(item.start_time || item.StartTime);
              const end_time = formatTime(item.end_time || item.EndTime);

              return {
                ...item,
                id:
                  (item.id !== undefined && item.id !== null
                    ? item.id
                    : item.ExerciseID) + "",
                title:
                  (TYPE_LABELS[type] || type) +
                  (item.session_type ? ` (${item.session_type})` : ""),
                type,
                start: session_date && start_time ? `${session_date}T${start_time}` : "",
                end: session_date && end_time ? `${session_date}T${end_time}` : "",
                color: TYPE_COLORS[type] || TYPE_COLORS.default,
                start_time,
                end_time,
                coach_id: item.coach_id || item.CoachID, 
                coach_name: item.coach_name || item.Name || "",
                session_type: item.session_type || "",
                allowed_membership: type,
                session_date,
              };
            })
          : []
      );
    } catch (err) {
      console.error("שגיאה בטעינת אירועים:", err);
      setErrorMsg("שגיאה בטעינת לוח האימונים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [refreshFlag, role, userId]);

  const refreshAndClose = () => {
    setIsModalOpen(false);
    setEditEvent(null);
    setParticipants([]);
    setTimeout(() => loadEvents(), 300);
  };

  const handleEventClick = async (info) => {
    const event = events.find((e) => e.id === info.event.id);
    setSelectedEvent(event || null);
    setSuccessMsg("");
    setErrorMsg("");
    setCancelError("");
    setIsModalOpen(true);

    if ((role === "Admin" || role === "Coach") && event) {
      setModalLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8801/schedule/participants/${event.id}`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setParticipants(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorMsg("לא ניתן לטעון את רשימת המשתתפות.");
      } finally {
        setModalLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    try {
      setErrorMsg("");
      const res = await fetch("http://localhost:8801/schedule/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: selectedEvent.id,
          traineeId: userId,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setErrorMsg(data?.error || "לא ניתן להירשם לאימון.");
        return;
      }
      setSuccessMsg("נרשמת בהצלחה לאימון!");
      refreshAndClose();
    } catch (err) {
      setErrorMsg("לא ניתן להירשם לאימון.");
    }
  };

  const handleDelete = async () => {
    const should = window.confirm("את/ה בטוח/ה שברצונך למחוק את האימון?");
    if (!should) return;
    try {
      const res = await fetch(
        `http://localhost:8801/schedule/${selectedEvent.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      refreshAndClose();
    } catch (err) {
      setErrorMsg("לא ניתן למחוק את האימון.");
    }
  };

   const handleEdit = async () => {
    setEditEvent(selectedEvent);
    setIsModalOpen(false);
    try {
      const res = await fetch("http://localhost:8801/users?role=Coach");
      const data = await res.json();
      setCoaches(Array.isArray(data) ? data : []);
    } catch {
      setCoaches([]);
    }
  };

  const handleEditClose = () => {
    setEditEvent(null);
  };

   const handleEditSubmit = async (updatedData) => {
    try {
      const res = await fetch(
        `http://localhost:8801/schedule/${editEvent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...updatedData,
             trainer_id: updatedData.trainer_id,
          }),
        }
      );
      if (!res.ok) throw new Error("עדכון נכשל");
      refreshAndClose();
    } catch (err) {
      alert("שגיאה בעת עדכון האימון.");
    }
  };

  const handleUnregister = async () => {
    setCancelError("");
    try {
      const res = await fetch(
        `http://localhost:8801/schedule/unregister/${selectedEvent.id}/${userId}`,
        { method: "DELETE" }
      );
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        setCancelError(data.error || "שגיאה בביטול הרשמה");
        return;
      }
      setSuccessMsg("ביטלת בהצלחה את ההרשמה!");
      refreshAndClose();
    } catch (err) {
      setCancelError("שגיאה בביטול הרשמה");
    }
  };

  function canUnregisterFunc(event) {
    if (!event || !event.start_time || !event.session_date) return false;
    const d = new Date(`${event.session_date}T${event.start_time}`);
    const now = new Date();
    const diffHours = (d - now) / (1000 * 60 * 60);
    return diffHours >= 4;
  }

  function renderLegend() {
    return (
      <div className="calendar-legend" style={{ display: 'flex', gap: '2em', marginBottom: 10, fontSize: 18 }}>
        <span style={{display: 'flex', alignItems: 'center', gap: 5}}>
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: TYPE_COLORS.Group,
            marginInlineEnd: 6,
            border: '1.5px solid #888'
          }}></span>
          קבוצתי
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: 5}}>
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: TYPE_COLORS.Couple,
            marginInlineEnd: 6,
            border: '1.5px solid #888'
          }}></span>
          זוגי
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: 5}}>
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: TYPE_COLORS.Single,
            marginInlineEnd: 6,
            border: '1.5px solid #888'
          }}></span>
          אישי
        </span>
      </div>
    );
  }

  return (
    <div className="calendar-wrapper">
    {(role === "Admin" || role === "Coach") && renderLegend()}
      {loading ? (
        <div style={{ textAlign: "center", margin: "2em" }}>טוען...</div>
      ) : (
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
      )}

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsModalOpen(false);
          setParticipants([]);
          setCancelError("");
        }}
        participants={participants}
        actions={
          !selectedEvent
            ? []
            : role === "Admin"
            ? [
                { label: "עריכה", onClick: handleEdit },
                { label: "מחיקה", onClick: handleDelete },
              ]
            : role === "Trainee" && selectedEvent.is_registered !== 1
            ? [{ label: "להירשם", onClick: handleRegister }]
            : []
        }
        onUnregister={
          role === "Trainee" && selectedEvent?.is_registered === 1
            ? handleUnregister
            : undefined
        }
        canUnregister={selectedEvent ? canUnregisterFunc(selectedEvent) : false}
        showParticipants={role === "Admin" || role === "Coach"}
        eventType={selectedEvent?.type}
        eventTypeColor={
          selectedEvent ? TYPE_COLORS[selectedEvent.type] : undefined
        }
      >
        {cancelError && (
          <div style={{ color: "#b10020", marginTop: 8 }}>{cancelError}</div>
        )}
        {modalLoading && (
          <div style={{ color: "#555", marginTop: 8 }}>טוען...</div>
        )}
      </EventModal>

      {editEvent && (
        <EditEventForm
          event={editEvent}
          onClose={handleEditClose}
          onSave={handleEditSubmit}
          coaches={coaches}
        />
      )}
    </div>
  );
}

function renderEventContent(arg) {
  const type = arg.event.extendedProps.type || "Group";
  const color = TYPE_COLORS[type] || TYPE_COLORS.default;
  const label = TYPE_LABELS[type] || type;
  return (
    <div title={`${label} | ${arg.timeText}`}>
      <b style={{ color }}>{label}</b>
      <div style={{ fontSize: 12 }}>{arg.timeText}</div>
    </div>
  );
}

 function EditEventForm({ event, onClose, onSave, coaches }) {
  const [formData, setFormData] = useState({
    trainer_id: event.coach_id || "",   
    session_type: event.session_type || "",
    session_date: event.session_date || "",
    start_time: event.start_time || "",
    end_time: event.end_time || "",
    allowed_membership: event.allowed_membership || event.type || "Group",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✖️
        </button>
        <h2>עריכת אימון</h2>

        <label>שם מאמנת:</label>
        <select
          name="trainer_id"
          value={formData.trainer_id}
          onChange={handleChange}
          required
        >
          <option value="" disabled>בחרי מאמנת</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>סוג אימון:</label>
        <input
          name="session_type"
          value={formData.session_type}
          onChange={handleChange}
        />

        <label>תאריך:</label>
        <input
          type="date"
          name="session_date"
          value={formData.session_date}
          onChange={handleChange}
        />

        <label>שעת התחלה:</label>
        <input
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
        />

        <label>שעת סיום:</label>
        <input
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
        />

        <label>סוג מנוי מורשה:</label>
        <select
          name="allowed_membership"
          value={formData.allowed_membership}
          onChange={handleChange}
        >
          <option value="Group">קבוצתי</option>
          <option value="Couple">זוגי</option>
          <option value="Single">אישי</option>
        </select>

        <button onClick={() => onSave(formData)}>שמור שינויים</button>
      </div>
    </div>
  );
}
