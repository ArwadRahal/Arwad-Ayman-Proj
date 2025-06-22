// src/components/AddTrainingModal.jsx
import React, { useState, useEffect } from "react";
import "../styles/AddTrainingModal.css";

export default function AddTrainingModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    coach: "",
    type: "",
    date: "",
    startHour: "",
    endHour: ""
  });
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    // איפוס הטופס
    setForm({ coach: "", type: "", date: "", startHour: "", endHour: "" });

    fetch("http://localhost:8801/users?role=coach")
      .then(res => res.json())
      .then(data => {
        setCoaches(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("שגיאה בקבלת רשימת מאמנות:", err);
        setCoaches([]);
      });
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { coach, type, date, startHour, endHour } = form;

    // ולידציה
    if (!coach || !type || !date || !startHour) {
      console.error("אנא מלא/י את כל השדות הנדרשים");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8801/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainer_id: coach,
          session_type: type,
          session_date: date,
          start_time: startHour,
          end_time: endHour || null
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("שגיאה ביצירת אימון: " + errorText);
      }

      onAdd();
      onClose();
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>הוספת אימון חדש</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            שם מאמנת:
            <select
              name="coach"
              value={form.coach}
              onChange={handleChange}
              required
            >
              <option value="">בחר מאמנת</option>
              {coaches.map(c => (
                <option
                  key={c.UserID || c.id}
                  value={c.UserID || c.id}
                >
                  {c.Name
                    || c.name
                    || `${c.first_name || ""} ${c.last_name || ""}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            סוג אימון:
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="פילאטיס, כוח וכו׳"
              required
            />
          </label>

          <label>
            תאריך:
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            שעת התחלה:
            <input
              name="startHour"
              type="time"
              value={form.startHour}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            שעת סיום (אופציונלי):
            <input
              name="endHour"
              type="time"
              value={form.endHour}
              onChange={handleChange}
            />
          </label>

          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "שולח..." : "שמור"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
