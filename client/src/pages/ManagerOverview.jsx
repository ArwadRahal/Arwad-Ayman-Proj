import React, { useState, useEffect } from "react";
import EventModal from "../components/EventModal";
import AddTrainingModal from "../components/AddTrainingModal";
import AddCoachModal from "../components/AddCoachModal";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/ManagerOverview.css";
import { useNavigate } from "react-router-dom";

function formatTime(time) {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

export default function ManagerOverview() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editEventData, setEditEventData] = useState(null); // بيانات التعديل
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const managerName = currentUser?.name || "מנהלת";
  const managerImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      setIsAuthorized(false);
      navigate("/login");
    } else {
      setIsAuthorized(true);
    }
    // eslint-disable-next-line
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

  // حذف التمرين
  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm("האם את בטוחה שברצונך למחוק את האימון?")) return;
    try {
      const res = await fetch(
        `http://localhost:8801/schedule/${selectedEvent.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setEventModalOpen(false);
        setRefreshFlag((f) => !f); // إعادة تحميل القائمة
      } else {
        alert("שגיאה במחיקת האימון");
      }
    } catch (err) {
      alert("שגיאה בשרת");
      console.error(err);
    }
  };

  // تعديل التمرين
  const handleEdit = () => {
    setEditEventData(selectedEvent);
    setAddModalOpen(true);
    setEventModalOpen(false);
  };

  // إضافة جديد (يفتح المودال ويعيد تعيين بيانات التعديل)
  const openAddModal = () => {
    setEditEventData(null);
    setAddModalOpen(true);
  };

  // فتح تفاصيل التمرين (المودال)
  function openEventModal(session) {
    setSelectedEvent(session);
    setEventModalOpen(true);
  }

  if (isAuthorized === null) return null;
  if (isAuthorized === false) return null;

  return (
    <div className="manager-overview">
      <div className="main-area">
        {/* صورة وجملة ترحيب للمديرة */}
        <div className="manager-header">
          <img
            src={managerImg}
            alt="manager"
            className="manager-avatar"
            onError={e => { e.target.src = defaultAvatar; }}
          />
          <h2>שלום {managerName}!</h2>
          <h3 className="welcome-message">ברוכה הבאה לממשק הניהול של האימונים!</h3>
        </div>

        <header className="top-nav">
          <h1>ניהול לוח אימונים</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="add-btn" onClick={() => setShowAddCoach(true)}>
              ➕ הוספת מאמנת
            </button>
            <button className="add-btn" onClick={openAddModal}>
              ➕ הוספת אימון
            </button>
          </div>
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
                        <div>
                          🕒 {formatTime(s.start_time)}–{formatTime(s.end_time) || ""}
                        </div>
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

      {/* مودال إضافة مدربة */}
      <AddCoachModal
        isOpen={showAddCoach}
        onClose={() => setShowAddCoach(false)}
        onAdd={() => setRefreshFlag(f => !f)}
      />

      {/* مودال إضافة/تعديل تمرين */}
      <AddTrainingModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={() => {
          setAddModalOpen(false);
          setRefreshFlag((prev) => !prev);
        }}
        initialData={editEventData} // بيانات التعديل أو undefined
      />

      {/* مودال التفاصيل - مع أزرار تعديل وحذف فقط */}
      <EventModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => setEventModalOpen(false)}
        actions={[
          { label: "✏️ עריכה", onClick: handleEdit },
          { label: "🗑️ מחיקה", onClick: handleDelete }
        ]}
      />
    </div>
  );
}
