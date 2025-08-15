// src/pages/ManagerOverview.jsx
import React, { useState, useEffect, useRef } from "react";
import EventModal from "../components/EventModal";
import AddTrainingModal from "../components/AddTrainingModal";
import AddCoachModal from "../components/AddCoachModal";
import defaultAvatar from "../assets/default-avatar.svg";
import BellIcon from "../assets/BellIcon.jsx";
import "../styles/ManagerOverview.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [startOfWeek, setStartOfWeek] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const [sessions, setSessions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editEventData, setEditEventData] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();

  // VAT modal states
  const [vatModalOpen, setVatModalOpen] = useState(false);
  const [vatInput, setVatInput] = useState("");
  const [savingVat, setSavingVat] = useState(false);
  const [vatError, setVatError] = useState("");
  const [currentVat, setCurrentVat] = useState(null);

  const days = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const managerName = currentUser?.name || "מנהלת";
  const managerImg =
    currentUser?.imageURL && currentUser.imageURL !== ""
      ? `http://localhost:8801/uploads/${currentUser.imageURL}`
      : defaultAvatar;

  // Exercise types
  useEffect(() => {
    fetch("http://localhost:8801/schedule/types")
      .then(res => res.json())
      .then(data => setExerciseTypes(Array.isArray(data) ? data : []))
      .catch(() => setExerciseTypes([]));
  }, []);

  // Auth
  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      setIsAuthorized(false);
      navigate("/login");
    } else {
      setIsAuthorized(true);
    }
    // eslint-disable-next-line
  }, [navigate]);

  // Sessions for current week
  useEffect(() => {
    if (weekDates.length === 0) return;

    fetch("http://localhost:8801/schedule")
      .then((response) => {
        if (!response.ok) {
          console.error("בעיה בקבלת המידע מהשרת:", response.statusText);
          return Promise.reject();
        }
        return response.json();
      })
      .then((data) => {
        const start = weekDates[0].toISOString().slice(0, 10);
        const end = weekDates[6].toISOString().slice(0, 10);
        const filtered = data.filter(
          (s) => s.session_date >= start && s.session_date <= end
        );
        setSessions(filtered);
      })
      .catch((error) => {
        console.error("❌ שגיאה בהבאת הנתונים:", error);
      });
  }, [weekDates, refreshFlag]);

  // Low stock notifications
  useEffect(() => {
    fetch("http://localhost:8801/products/low-stock")
      .then((res) => res.json())
      .then((data) => setLowStockProducts(Array.isArray(data) ? data : []))
      .catch(() => setLowStockProducts([]));
  }, [refreshFlag]);

  // Click outside notifications popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  // Fetch current VAT on load
  useEffect(() => {
    fetch("http://localhost:8801/settings/vat")
      .then(res => res.json())
      .then(data => {
        if (typeof data.vat === "number") {
          setCurrentVat(data.vat);
          setVatInput(String(data.vat));
        }
      })
      .catch(() => {});
  }, []);

  const handleNotifClick = () => {
    setNotifOpen((prev) => !prev);
  };

  function handleNotifProductClick(productCode) {
    setNotifOpen(false);
    setTimeout(() => {
      navigate(`/product-management?focus=${productCode}`);
    }, 100);
  }

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
        setRefreshFlag((f) => !f);
      } else {
        alert("שגיאה במחיקת האימון");
      }
    } catch (err) {
      alert("שגיאה בשרת");
      console.error(err);
    }
  };

  const handleEdit = () => {
    setEditEventData(selectedEvent);
    setAddModalOpen(true);
    setEventModalOpen(false);
  };

  const openAddModal = () => {
    setEditEventData(null);
    setAddModalOpen(true);
  };

  function openEventModal(session) {
    setSelectedEvent(session);
    setEventModalOpen(true);
    setParticipants([]);
    setModalLoading(true);

    fetch(`http://localhost:8801/schedule/participants/${session.id || session.ExerciseID}`)
      .then(res => res.json())
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setModalLoading(false));
  }

  function getTypeNameById(id) {
    const found = exerciseTypes.find(t => t.ExerciseTypeID === (id * 1));
    return found ? found.TypeName : "";
  }

  async function handleSaveVat() {
    setVatError("");
    const n = Number(vatInput);
    if (isNaN(n) || n < 0 || n > 100) {
      setVatError("אנא הזיני ערך חוקי בין 0 ל-100");
      return;
    }
    try {
      setSavingVat(true);
      const res = await axios.put("http://localhost:8801/settings/vat", { vat: n });
      if (res.data?.success) {
        setCurrentVat(n);
        setVatModalOpen(false);
      } else {
        setVatError("נכשלה שמירת המע״מ");
      }
    } catch (e) {
      setVatError("שגיאה בשמירה");
    } finally {
      setSavingVat(false);
    }
  }

  if (isAuthorized === null) return null;
  if (isAuthorized === false) return null;

  return (
    <div className="manager-overview">
      <div className="main-area">

        {/* Notifications bell */}
        <div className="notif-bell-container">
          <button
            className="notif-bell-btn"
            onClick={handleNotifClick}
            aria-label="התראות מלאי"
          >
            <BellIcon size={32} color="#845ec2" />
            {lowStockProducts.length > 0 && <span className="notif-dot" />}
          </button>

          {notifOpen && (
            <div className="notif-popover" ref={notifRef}>
              <div className="notif-popover-header">
                <span>התראות מלאי</span>
                <button className="notif-close-btn" onClick={() => setNotifOpen(false)}>×</button>
              </div>
              {lowStockProducts.length === 0 ? (
                <div className="notif-empty">אין התראות כרגע 🎉</div>
              ) : (
                <ul className="notif-list-v2">
                  {lowStockProducts.map(p => (
                    <li
                      key={p.ProductCode}
                      className="notif-item-v2"
                      onClick={() => handleNotifProductClick(p.ProductCode)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="notif-row-main">
                        <span className="notif-warning-icon">⚠️</span>
                        <span className="notif-prod-name">{p.Name}</span>
                      </div>
                      <div className="notif-row-secondary">
                        <span className="notif-prod-stock">
                          <b>{p.Stock}</b> יחידות בלבד
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="notif-footer">
                <small>יש לחדש מלאי בהקדם</small>
              </div>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="manager-header-row">
          <img
            src={managerImg}
            alt="manager"
            className="manager-avatar-small"
            onError={e => { e.target.src = defaultAvatar; }}
          />
          <div>
            <div className="manager-header-mini">
              <span className="hello-text">שלום {managerName}!</span>
              <span className="welcome-mini">ברוכה הבאה לממשק הניהול של האימונים!</span>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="week-top-row">
          <h1 className="week-title">שעות עבודה לשבוע זה</h1>
          <div className="add-btns-row">
            <button className="add-btn big" onClick={() => setShowAddCoach(true)}>
              ➕ הוספת מאמנת
            </button>
            <button className="add-btn big" onClick={openAddModal}>
              ➕ הוספת אימון
            </button>
            <button
              className="add-btn big"
              onClick={() => setVatModalOpen(true)}
              style={{ background: "#845ec2", color: "#fff" }}
              title={`מע״מ נוכחי: ${currentVat ?? "—"}%`}
            >
              ⚙️ עדכון מע״מ
            </button>
          </div>
        </div>

        {/* Week navigation */}
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
          <button
            className="week-nav-btn"
            onClick={() => setStartOfWeek(prev => {
              const d = new Date(prev);
              d.setDate(prev.getDate() - 7);
              return d;
            })}
          >{"← שבוע קודם"}</button>
          <span style={{fontWeight:'bold', fontSize:18, margin:'0 12px'}}>
            {weekDates[0].toLocaleDateString("he-IL", { day:"2-digit", month:"2-digit" })}
            {" - "}
            {weekDates[6].toLocaleDateString("he-IL", { day:"2-digit", month:"2-digit" })}
          </span>
          <button
            className="week-nav-btn"
            onClick={() => setStartOfWeek(prev => {
              const d = new Date(prev);
              d.setDate(prev.getDate() + 7);
              return d;
            })}
          >{"שבוע הבא →"}</button>
        </div>

        {/* Calendar */}
        <section className="calendar-weekly">
          <div className="week-header">
            {weekDates.map((d, i) => (
              <div key={i} className="weekday">
                <div className="day-name">
                  {days[i]}
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
                        <div>
                          🏷️ {getTypeNameById(s.exercise_type_id || s.ExerciseTypeID) || s.session_type || ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modals */}
      <AddCoachModal
        isOpen={showAddCoach}
        onClose={() => setShowAddCoach(false)}
        onAdd={() => setRefreshFlag(f => !f)}
      />

      <AddTrainingModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={() => {
          setAddModalOpen(false);
          setRefreshFlag((prev) => !prev);
        }}
        initialData={editEventData}
        exerciseTypes={exerciseTypes}
      />

      <EventModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => setEventModalOpen(false)}
        actions={[
          { label: "✏️ עריכה", onClick: handleEdit },
          { label: "🗑️ מחיקה", onClick: handleDelete }
        ]}
        participants={participants}
        showParticipants={true}
        exerciseTypes={exerciseTypes}
      >
        {modalLoading && <div style={{ color: "#555", marginTop: 8 }}>טוען...</div>}
      </EventModal>

{/* VAT Modal – clean compact */}
{vatModalOpen && (
  <div className="vat-overlay" onClick={() => setVatModalOpen(false)}>
    <div className="vat-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <button className="vat-close" onClick={() => setVatModalOpen(false)} aria-label="סגירה">×</button>

      <div className="vat-head">
        <h3 className="vat-title">עדכון מע״מ</h3>
        <div className="vat-sub">מע״מ נוכחי: <b>{currentVat ?? "—"}%</b></div>
      </div>

      <div className="vat-field">
        <label className="vat-label">ערך חדש</label>
        <div className="vat-input-group">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={vatInput}
            onChange={(e) => setVatInput(e.target.value)}
            placeholder="לדוגמה: 17"
            className="vat-input"
            dir="ltr"
          />
          <span className="vat-suffix">%</span>
        </div>
        {!!vatError && <div className="vat-error">{vatError}</div>}
        <div className="vat-hint">טווח מותר: 0–100. שינוי זה ישפיע על החנות והחשבונית בקופה.</div>
      </div>

      <div className="vat-actions">
        <button className="btn ghost" onClick={() => setVatModalOpen(false)}>ביטול</button>
        <button className="btn primary" onClick={handleSaveVat} disabled={savingVat}>
          {savingVat ? "שומר..." : "שמירה"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
