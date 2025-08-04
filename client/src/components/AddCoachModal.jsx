import React, { useState } from "react";
import "../styles/AddCoachModal.css";

export default function AddCoachModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    tz_id: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    image: null,
  });
  const [errors, setErrors] = useState({});

  
  const validatePhone = (value) => {
    if (value && !/^\d{9,10}$/.test(value)) {
      return "מספר הטלפון חייב להכיל 9 או 10 ספרות בלבד";
    }
    return "";
  };

   const validatePassword = (value) => {
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/.test(value)) {
      return "הסיסמה חייבת להיות בין 3 ל-8 תווים, עם לפחות ספרה אחת ואות אחת!";
    }
    return "";
  };

   function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]: files ? files[0] : value,
    }));

     if (name === "phone") {
      setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    }
    if (name === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
    if (name === "confirm") {
      setErrors((prev) => ({
        ...prev,
        confirm: form.password !== value ? "הסיסמאות לא תואמות!" : "",
      }));
    }
  }

   async function handleSubmit(e) {
    e.preventDefault();

    const phoneError = validatePhone(form.phone);
    const passwordError = validatePassword(form.password);
    let confirmError = "";
    if (form.password !== form.confirm) confirmError = "הסיסמאות לא תואמות!";

    if (phoneError || passwordError || confirmError) {
      setErrors({ phone: phoneError, password: passwordError, confirm: confirmError });
      return;
    }

     if (!form.name || !form.tz_id || !form.email || !form.password) {
      setErrors((prev) => ({
        ...prev,
        general: "יש למלא את כל השדות החובה",
      }));
      return;
    }

    const data = new FormData();
    data.append("full_name", form.name);
    data.append("tz_id", form.tz_id);
    data.append("email", form.email);
    data.append("phone", form.phone);
    data.append("password", form.password);
    data.append("role", "Coach");
    if (form.image) data.append("image", form.image);

    try {
      const res = await fetch("http://localhost:8801/users/add-coach", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        onAdd();
        onClose();
      } else {
        setErrors((prev) => ({
          ...prev,
          general: result.error || "שגיאה בהוספה",
        }));
      }
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        general: "שגיאת שרת",
      }));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="addcoach-overlay" onClick={onClose}>
      <div className="addcoach-modal" onClick={(e) => e.stopPropagation()}>
        <button className="addcoach-close" onClick={onClose}>✖️</button>
        <h2 className="addcoach-title">הוספת מאמנת חדשה</h2>
        {errors.general && <div className="addcoach-error">{errors.general}</div>}
        <form className="addcoach-form" onSubmit={handleSubmit} autoComplete="off">
          <label>שם מלא</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>ת.ז.</label>
          <input
            name="tz_id"
            value={form.tz_id}
            onChange={handleChange}
            required
          />

          <label>אימייל</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>טלפון</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <span className="addcoach-error">{errors.phone}</span>}

          <label>סיסמה</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="addcoach-error">{errors.password}</span>}

          <label>אישור סיסמה</label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            required
          />
          {errors.confirm && <span className="addcoach-error">{errors.confirm}</span>}

          <label>תמונה (לא חובה)</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />

          <button type="submit" className="addcoach-btn">הוספה</button>
        </form>
      </div>
    </div>
  );
}
