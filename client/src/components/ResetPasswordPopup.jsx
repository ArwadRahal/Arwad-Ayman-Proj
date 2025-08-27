// components/ResetPasswordPopup.jsx
import React, { useState } from "react";
import "../styles/PopupStyles.css";

export default function ResetPasswordPopup({ onSuccess, onClose }) {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendVerificationCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8801/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה בשליחת קוד");
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8801/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "הקוד שגוי");
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8801/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה באיפוס סיסמה");
      // Reset all states
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setLoading(false);

      onSuccess(email);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>איפוס סיסמה</h2>
        {step === 1 && (
          <>
            <p>הזן את כתובת הדוא״ל שלך ונשלח אליך קוד אימות</p>
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendVerificationCode} disabled={loading}>
              שלח קוד
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <p>הזן את קוד האימות שקיבלת במייל</p>
            <input
              type="text"
              placeholder="קוד אימות"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={verifyCode} disabled={loading}>אמת</button>
          </>
        )}
        {step === 3 && (
          <>
            <p>הזן סיסמה חדשה</p>
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="אימות סיסמה"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={resetPassword} disabled={loading}>
              אפס סיסמה
            </button>
          </>
        )}
        {error && <p className="error-text">{error}</p>}

        <button
          className="close-btn"
          onClick={() => {
            setStep(1);
            setEmail("");
            setCode("");
            setNewPassword("");
            setConfirmPassword("");
            setError("");
            setLoading(false);
            onClose();
          }}
        >
          סגור
        </button>
      </div>
    </div>
  );
}
