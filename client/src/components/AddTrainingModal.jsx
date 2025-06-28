import React, { useState, useEffect } from "react";
import "../styles/AddTrainingModal.css";

// دالة لإرجاع أول 10 حروف فقط (yyyy-mm-dd)
function extractDate(val) {
  if (!val) return "";
  return val.slice(0, 10);
}

export default function AddTrainingModal({ isOpen, onClose, onAdd, initialData }) {
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

    // هنا فقط استخدم النص القادم كما هو
    if (initialData) {
      setForm({
        coach: initialData.coach_id || initialData.coach || "",
        type: initialData.session_type || initialData.type || "",
        date: extractDate(initialData.session_date || initialData.date || ""),
        startHour: (initialData.start_time || initialData.startHour || "").slice(0, 5),
        endHour: (initialData.end_time || initialData.endHour || "").slice(0, 5)
      });
    } else {
      setForm({ coach: "", type: "", date: "", startHour: "", endHour: "" });
    }

    fetch("http://localhost:8801/users?role=coach")
      .then(res => res.json())
      .then(data => setCoaches(Array.isArray(data) ? data : []))
      .catch(() => setCoaches([]));
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { coach, type, date, startHour, endHour } = form;

    if (!coach || !type || !date || !startHour) {
      alert("אנא מלא/י את כל השדות הנדרשים");
      return;
    }

    setLoading(true);
    try {
      let url = "http://localhost:8801/schedule";
      let method = "POST";
      if (initialData && initialData.id) {
        url += "/" + initialData.id;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
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
        throw new Error("שגיאה בשמירת אימון: " + errorText);
      }

      onAdd();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{initialData ? "עריכת אימון" : "הוספת אימון חדש"}</h2>
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
              {loading
                ? "שולח..."
                : initialData
                ? "שמור שינויים"
                : "שמור"}
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
