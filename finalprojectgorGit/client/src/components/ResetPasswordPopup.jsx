// components/ResetPasswordPopup.jsx
import React, { useState } from "react";
import "../styles/PopupStyles.css"; // تأكد أنك تضيف ستايل بسيط مؤقت

export default function ResetPasswordPopup({ onSuccess, onClose }) {
  const [step, setStep] = useState(1); // 1: إدخال إيميل، 2: كود
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [serverCode, setServerCode] = useState("");
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

      setServerCode(data.code); // ← للاختبار، في الواقع ما منرجع الكود للفرونت
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const verifyCode = () => {
     if (code.trim() === serverCode.trim()) {
      onSuccess(email); // أرجع الإيميل للصفحة الأم
    } else {
      setError("הקוד שגוי, נסה שוב");
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
            <button onClick={verifyCode}>אמת</button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <button className="close-btn" onClick={onClose}>
          סגור
        </button>
      </div>
    </div>
  );
}
