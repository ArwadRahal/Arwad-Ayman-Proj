import React from "react";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/AdminUserPreviewModal.css";

export default function AdminUserPreviewModal({ open, onClose, data }) {
  if (!open) return null;

  const avatarSrc =
    data?.imageURL ? `http://localhost:8801/uploads/${data.imageURL}` : defaultAvatar;

  return (
    <div className="aup-overlay" onClick={onClose}>
      <div className="aup-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="aup-close" onClick={onClose} aria-label="סגירה">×</button>

        <div className="aup-head">
          <img
            src={avatarSrc}
            onError={(e) => { e.currentTarget.src = defaultAvatar; }}
            alt={data?.name || "user"}
            className="aup-avatar"
          />
          <div className="aup-title">{data?.name || "(ללא שם)"}</div>
          <div className="aup-role">מתאמנת</div>
        </div>

        <div className="aup-grid">
          <div className="aup-row">
            <span className="aup-label">אימייל</span>
            <span className="aup-val">{data?.email || "—"}</span>
          </div>
          <div className="aup-row">
            <span className="aup-label">טלפון</span>
            <span className="aup-val">{data?.phone || "—"}</span>
          </div>
          <div className="aup-row">
          <span className="aup-label">סוג מנוי</span>
          <span className="aup-val">
            {{
              "Single": "מנוי יחיד",
              "Group": "מנוי קבוצתי",
              "Couple" : "מנוי זוגי" 
            }[data?.membership] || data?.membership || "—"}
          </span>
        </div>

          <div className="aup-row">
            <span className="aup-label">בתוקף עד</span>
            <span className="aup-val">{data?.membership_end || "—"}</span>
          </div>
        </div>
        <div className="aup-note">תצוגה לקריאה בלבד • </div>
      </div>
    </div>
  );
}
