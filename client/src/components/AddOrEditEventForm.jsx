import React, { useState } from "react";

export default function AddOrEditEventForm({
  event,
  onClose,
  onSave,
  coaches,
  typesList,
  isEdit = false
}) {
  const [formData, setFormData] = useState({
    trainer_id: event?.coach_id || "",
    exercise_type_id: event?.exercise_type_id || "",
    session_date: event?.session_date || "",
    start_time: event?.start_time || "",
    end_time: event?.end_time || "",
    allowed_membership: event?.allowed_membership || event?.type || "Group",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !formData.trainer_id ||
      !formData.exercise_type_id ||
      !formData.session_date ||
      !formData.start_time ||
      !formData.allowed_membership
    ) {
      setErrorMsg("יש למלא את כל השדות הדרושים");
      return;
    }
    setErrorMsg("");
    onSave(formData);
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✖️
        </button>
        <h2>{isEdit ? "עריכת אימון" : "הוספת אימון חדש"}</h2>

        <label>שם מאמנת:</label>
        <select
          name="trainer_id"
          value={formData.trainer_id}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            בחרי מאמנת
          </option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>סוג אימון:</label>
        <select
          name="exercise_type_id"
          value={formData.exercise_type_id}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            בחרי סוג אימון
          </option>
          {typesList.map((t) => (
            <option key={t.ExerciseTypeID} value={t.ExerciseTypeID}>
              {t.TypeName}
            </option>
          ))}
        </select>

        <label>תאריך:</label>
        <input
          type="date"
          name="session_date"
          value={formData.session_date}
          onChange={handleChange}
          required
        />

        <label>שעת התחלה:</label>
        <input
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
          required
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

        {errorMsg && (
          <div style={{ color: "#b10020", margin: "8px 0" }}>{errorMsg}</div>
        )}

        <button onClick={handleSubmit}>
          {isEdit ? "שמור שינויים" : "הוספת אימון"}
        </button>
      </div>
    </div>
  );
}
