import React, { useState } from "react";
import "../styles/PopupStyles.css";

export default function ChangePasswordPopup({ userId, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = async () => {
    setErr("");
    if (!oldPassword || !newPassword || !confirm) {
      setErr(" אנא מלאו את כל השדות");
      return;
    }
    if (newPassword.length < 6) {
      setErr("הסיסמה החדשה חייבת להיות באורך של לפחות 6 תווים");
      return;
    }
    if (newPassword !== confirm) {
      setErr("הסיסמה החדשה אינה תואמת.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8801/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "  שגיאה לא ידועה  ");
      setDone(true);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>שינוי סיסמה</h2>
        {done ? (
          <>
            <div style={{ color: "#299f37", fontWeight: "bold", margin: "16px 0" }}>
              הסיסמה שונתה בהצלחה!
            </div>
            <button className="close-btn" onClick={onClose}>סגור</button>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="הסיסמה הנוכחית"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="אימות סיסמה חדשה"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            {err && <div className="error-text">{err}</div>}
            <button onClick={handleChange} disabled={loading}>
              {loading ? "מעדכן..." : "שנה סיסמה"}
            </button>
            <button className="close-btn" onClick={onClose} style={{ marginTop: 8 }}>
              ביטול
            </button>
          </>
        )}
      </div>
    </div>
  );
}
