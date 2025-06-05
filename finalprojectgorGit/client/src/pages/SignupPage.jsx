import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [tzId, setTzId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return alert("הסיסמאות לא תואמות!");
    }
    try {
    const res = await fetch("http://localhost:8801/auth/signup", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          tz_id: tzId,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert("שגיאה בהרשמה: " + (data.error || res.statusText));
      }
      alert("נרשמת בהצלחה! איידי שלך: " + data.userId);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("שגיאת רשת: נסה שוב מאוחר יותר");
    }
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
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="אישור סיסמה"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
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
