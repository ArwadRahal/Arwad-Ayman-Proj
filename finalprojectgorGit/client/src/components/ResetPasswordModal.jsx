import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function ResetPasswordModal({ email }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      return setError("נא למלא את כל השדות");
    }

    if (newPassword !== confirmPassword) {
      return setError("הסיסמאות אינן תואמות");
    }

    if (newPassword.length < 6) {
      return setError("הסיסמה חייבת להכיל לפחות 6 תווים");
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8801/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה באיפוס הסיסמה");
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError("שגיאת רשת");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-popup">
      <h2>איפוס סיסמה</h2>

      <input
        type="password"
        placeholder="סיסמה חדשה"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="אשר סיסמה חדשה"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleResetPassword} disabled={isLoading}>
        {isLoading ? "מאפסת..." : "אפס סיסמה"}
      </button>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">✔️ הסיסמה אופסה בהצלחה! תועברי להתחברות...</p>}

      <button className="close-btn" onClick={() => navigate("/")}>
        ✖ חזרה להתחברות
      </button>
    </div>
  );
}
