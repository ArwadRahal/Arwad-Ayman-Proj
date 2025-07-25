// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [tzId, setTzId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validatePhone = (value) => {
    if (!/^\d{9,10}$/.test(value)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ולידציה מקומית
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    if (phoneError || passwordError) {
      setErrors({ phone: phoneError, password: passwordError });
      return;
    }
    if (password !== confirm) {
      setErrors({ confirm: "הסיסמאות לא תואמות!" });
      return;
    }

    // ניסיון שליחה לשרת
    try {
      const res = await fetch("http://localhost:8801/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          tz_id: tzId,
          phone,
          email,
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // שם השגיאה יופיע בקונסול
        console.error("שגיאה בהרשמה:", data.error || res.statusText);
        return;
      }

      // הרשמה הצליחה
      console.log("נרשמת בהצלחה! איידי שלך:", data.userId);
      navigate("/login");
    } catch (err) {
      // שגיאת רשת
      console.error("שגיאת רשת בזמן הרשמה:", err);
    }
  };

  const handlePhoneChange = (e) => {
    const v = e.target.value;
    setPhone(v);
    setErrors((prev) => ({ ...prev, phone: validatePhone(v) }));
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value;
    setPassword(v);
    setErrors((prev) => ({ ...prev, password: validatePassword(v) }));
  };

  const handleConfirmChange = (e) => {
    const v = e.target.value;
    setConfirm(v);
    setErrors((prev) => ({
      ...prev,
      confirm: password !== v ? "הסיסמאות לא תואמות!" : "",
    }));
  };

  return (
    <div className="auth-container">
      <h1>הרשמה</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="תעודת זהות"
          value={tzId}
          onChange={(e) => setTzId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="מספר טלפון"
          value={phone}
          onChange={handlePhoneChange}
          required
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
        <input
          type="email"
          placeholder="דוא״ל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
        <input
          type="password"
          placeholder="אישור סיסמה"
          value={confirm}
          onChange={handleConfirmChange}
          required
        />
        {errors.confirm && <span className="error-message">{errors.confirm}</span>}
        <button type="submit">הרשמה</button>
      </form>
      <p className="auth-footer">
        כבר רשומה?{" "}
        <span className="signup-link" onClick={() => navigate("/login")}>
          להתחברות
        </span>
      </p>
    </div>
  );
}
