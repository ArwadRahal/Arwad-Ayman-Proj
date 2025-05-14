import React, { useState, useEffect } from "react";
import "../styles/AddTrainingModal.css";

export default function AddTrainingModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    coach: "",
    type: "",
    hour: "",
    date: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ coach: "", type: "", hour: "", date: "" });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { coach, type, hour, date } = form;
    if (!coach || !hour || !date) {
      return alert("אנא מלא/י את כל השדות הנדרשים");
    }

    setLoading(true);
    try {
      const res = await fetch("/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainer_id: coach, 
          session_date: date,
          start_time: hour,
          session_type: type
        })
      });
      if (!res.ok) throw new Error("שגיאה ביצירת אימון");
      onAdd();    // parent should re-fetch the list
      onClose();
    } catch (err) {
      alert(err.message);
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
            <input
              name="coach"
              value={form.coach}
              onChange={handleChange}
              placeholder="מזהה מאמנת"
              required
            />
          </label>
          <label>
            סוג אימון:
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="פילאטיס, כוח וכו׳"
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
            שעה:
            <input
              name="hour"
              type="time"
              value={form.hour}
              onChange={handleChange}
              required
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
