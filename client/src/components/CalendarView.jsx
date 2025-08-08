import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import heLocale from "@fullcalendar/core/locales/he";
import EventModal from "./EventModal";
import AddOrEditEventForm from "./AddOrEditEventForm";
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


function getMaxParticipantsForType(type) {
  if (type === "Single") return 1;
  if (type === "Couple") return 2;
  return 10;
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
  const [addEvent, setAddEvent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [typesList, setTypesList] = useState([]);

  const [monthlyMeetings, setMonthlyMeetings] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8801/schedule/types")
      .then(res => res.json())
      .then(setTypesList)
      .catch(() => setTypesList([]));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    setRole(user.role || "");
    setUserId(user.id || "");
  }, []);

  useEffect(() => {
    if (!userId || role !== "Trainee") return;
    fetch(`http://localhost:8801/schedule/monthly-count/${userId}`)
      .then(res => res.json())
      .then(data => setMonthlyMeetings(data.count || 0))
      .catch(() => setMonthlyMeetings(0));
  }, [userId, isModalOpen, refreshFlag, role]);

  const loadEvents = useCallback(async () => {
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
              let exerciseTypeObj = typesList.find(
                (t) =>
                  t.ExerciseTypeID ===
                  (item.exercise_type_id ||
                    item.ExerciseTypeID ||
                    item.exerciseTypeId ||
                    item.TypeID)
              );
              let typeName =
                (exerciseTypeObj && exerciseTypeObj.TypeName) ||
                item.session_type ||
                item.Type ||
                "";

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
                  (typeName ? ` (${typeName})` : ""),
                type,
                start:
                  session_date && start_time
                    ? `${session_date}T${start_time}`
                    : "",
                end:
                  session_date && end_time
                    ? `${session_date}T${end_time}`
                    : "",
                color: TYPE_COLORS[type] || TYPE_COLORS.default,
                start_time,
                end_time,
                coach_id: item.coach_id || item.CoachID,
                coach_name: item.coach_name || item.Name || "",
                session_type: typeName,
                allowed_membership: type,
                session_date,
                exercise_type_id:
                  item.exercise_type_id ||
                  item.ExerciseTypeID ||
                  item.exerciseTypeId ||
                  item.TypeID,
                participants_count: item.participants_count || 0,
              };
            })
          : []
      );
    } catch (err) {
      setErrorMsg("שגיאה בטעינת לוח האימונים.");
    } finally {
      setLoading(false);
    }
  }, [typesList]); 
  
  useEffect(() => {
    loadEvents();
  }, [refreshFlag, role, userId, typesList.length, loadEvents]);

  const refreshAndClose = () => {
    setIsModalOpen(false);
    setEditEvent(null);
    setAddEvent(false);
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
    } else if (role === "Trainee" && event) {
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

  const handleEditClose = () => setEditEvent(null);

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
            exercise_type_id: updatedData.exercise_type_id,
          }),
        }
      );
      if (!res.ok) throw new Error("עדכון נכשל");
      refreshAndClose();
    } catch (err) {
      alert("שגיאה בעת עדכון האימון.");
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      const res = await fetch(`http://localhost:8801/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          trainer_id: data.trainer_id,
          exercise_type_id: data.exercise_type_id,
        }),
      });
      if (!res.ok) throw new Error("הוספה נכשלה");
      refreshAndClose();
    } catch (err) {
      alert("שגיאה בעת הוספת האימון.");
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
      {(role === "Admin" || role === "Coach") && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {renderLegend()}
          <div className="add-btns-row">
            <button
              className="add-btn big"
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:8801/users?role=Coach");
                  const data = await res.json();
                  setCoaches(Array.isArray(data) ? data : []);
                } catch {
                  setCoaches([]);
                }
                setAddEvent(true);
              }}
            >
              ➕ הוספת אימון
            </button>
          </div>
        </div>
      )}
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
            ? (
                participants.length >= getMaxParticipantsForType(selectedEvent.type) || monthlyMeetings >= 12
                  ? []
                  : [{ label: "להירשם", onClick: handleRegister }]
              )
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

        {role === "Trainee" && selectedEvent && selectedEvent.is_registered !== 1 &&
          participants.length >= getMaxParticipantsForType(selectedEvent.type) && (
            <div style={{ color: "#e74c3c", marginTop: 12, fontWeight: 600 }}>
              האימון מלא, לא ניתן להירשם
            </div>
          )
        }
        {role === "Trainee" && monthlyMeetings >= 12 && selectedEvent && selectedEvent.is_registered !== 1 && (
          <div style={{ color: "#e74c3c", marginTop: 12, fontWeight: 600 }}>
            הגעת למספר המפגשים החודשי המותר (12)
          </div>
        )}
        {cancelError && (
          <div style={{ color: "#b10020", marginTop: 8 }}>{cancelError}</div>
        )}
        {modalLoading && (
          <div style={{ color: "#555", marginTop: 8 }}>טוען...</div>
        )}
      </EventModal>

      {editEvent && (
        <AddOrEditEventForm
          event={editEvent}
          onClose={handleEditClose}
          onSave={handleEditSubmit}
          coaches={coaches}
          typesList={typesList}
          isEdit={true}
        />
      )}

      {addEvent && (
        <AddOrEditEventForm
          event={null}
          onClose={() => setAddEvent(false)}
          onSave={handleAddSubmit}
          coaches={coaches}
          typesList={typesList}
          isEdit={false}
        />
      )}
    </div>
  );
}

function renderEventContent(arg) {
  const type = arg.event.extendedProps.type || "Group";
  const color = TYPE_COLORS[type] || TYPE_COLORS.default;
  const label = TYPE_LABELS[type] || type;

  const startTime = arg.event.extendedProps.start_time || "";
  const endTime = arg.event.extendedProps.end_time || "";

  const coachName = arg.event.extendedProps.coach_name || "";

  const role =
    JSON.parse(localStorage.getItem("currentUser"))?.role || "Trainee";

  return (
    <div
      style={{
        textAlign: "right",
        fontFamily: "inherit",
        fontSize: 15,
        lineHeight: 1.4,
        marginBottom: 2,
        padding: "0 2px",
        minWidth: 80,
      }}
      title={`${label}${startTime && endTime ? ` | ${startTime}–${endTime}` : ""}${coachName ? " | " + coachName : ""}`}
    >

      <span
        style={{
          color,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {label}
      </span>

      {arg.event.extendedProps.session_type && (
        <span
          style={{
            color: "#444",
            fontWeight: 400,
            fontSize: 13,
            marginInlineStart: 4,
          }}
        >
          ({arg.event.extendedProps.session_type})
        </span>
      )}
      <br />

      {startTime && endTime && (
        <span style={{ color: "#333", fontSize: 13 }}>
          <span style={{ fontWeight: 500 }}>
            {startTime}–{endTime}
          </span>
          <span style={{ marginRight: 5, color: "#8a7adb" }}>שעה</span>
        </span>
      )}
      {coachName && (role === "Admin" || role === "Trainee")&& (
        <div style={{ color: "#7c6bab", fontSize: 12, marginTop: 2 }}>
          <span style={{ fontWeight: 400 }}>מאמנת: {coachName}</span>
        </div>
      )}
    </div>
  );
}
