import React, { useState } from "react";
import "../styles/Auth.css";

export default function VerifyCodeModal({ email, onVerified, onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    const cleanCode = (code || "").trim();

    if (cleanCode.length !== 6 || isNaN(cleanCode)) {
      setError("יש להזין קוד תקין בן 6 ספרות");
      return;
    }

    try {
      const res = await fetch("http://localhost:8801/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "שגיאה באימות הקוד");
        return;
      }

      setSuccess(true); // نعرض نجاح بسيط (اختياري)
      setTimeout(() => {
        onVerified(); // نفتح نافذة إعادة تعيين كلمة المرور
      }, 500); // مهلة صغيرة قبل الانتقال
    } catch (err) {
      setError("שגיאת רשת: נסה שוב מאוחר יותר");
    }
  };

  return (
    <div className="auth-popup">
      <h2>אימות קוד</h2>
      <input
        type="text"
        placeholder="הזן את הקוד שהתקבל במייל"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerify}>אמת קוד</button>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">✔️ הקוד אומת בהצלחה!</p>}

      <button className="close-btn" onClick={onClose}>✖ סגור</button>
    </div>
  );
}
