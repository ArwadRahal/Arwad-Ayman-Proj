import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
const res = await fetch("http://localhost:8801/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert("שגיאה בהתחברות: " + (data.error || res.statusText));
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
       if (data.user.role === "Admin") {
        navigate("/ManagerOverview");
      } else if (data.user.role === "Trainee") {
        navigate("/dashboard");
      } else if (data.user.role === "Coach") {
        navigate("/coach");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("שגיאת רשת: נסה שוב מאוחר יותר");
    }
  };

  return (
    <div className="auth-container">
      <h1>התחברות</h1>
      <form onSubmit={handleLogin}>
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
        <button type="submit">התחברי</button>
      </form>
      <p className="auth-footer">
        אין לך חשבון?{" "}
        <span className="signup-link" onClick={() => navigate("/signup")}>
          הרשמי כאן
        </span>
      </p>
    </div>
  );
}
