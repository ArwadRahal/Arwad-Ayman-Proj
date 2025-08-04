// src/components/EventModal.jsx
import React from 'react';
import '../styles/EventModal.css';

function formatTime(time) {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

export default function EventModal({ 
  isOpen, 
  event, 
  onClose, 
  actions, 
  children, 
  participants = [],
  canUnregister = true,
  onUnregister,
  showParticipants = false,
  eventType,          
  eventTypeColor,     
}) {
  if (!isOpen || !event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✖️</button>
        <h3>פרטי אימון</h3>
        <p>תאריך: {new Date(event.session_date).toLocaleDateString("he-IL")}</p>
        <p>
          <strong>שעה:</strong> {formatTime(event.start_time)} - {formatTime(event.end_time)}
        </p>
        <p><strong>מאמנת:</strong> {event.coach_name}</p>
        <p>
          <strong>סוג אימון:</strong>
          <span
            style={{
              background: eventTypeColor,
              color: "#fff",
              padding: "3px 10px",
              borderRadius: "10px",
              marginRight: 8,
              fontWeight: "bold"
            }}
          >
            {event.session_type}
          </span>
        </p>

        {showParticipants && (participants && participants.length > 0) && (
          <div style={{ marginTop: 12 }}>
            <b>משתתפות:</b>
            <ul style={{ margin: 0, paddingInlineStart: 15 }}>
              {participants.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="event-modal-actions">
          {actions && actions.map((a, i) => (
            <button key={i} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>

        {onUnregister &&
          <button 
            onClick={onUnregister}
            disabled={!canUnregister}
            style={{
              marginTop: 12,
              background: canUnregister ? "#fff4f4" : "#eee",
              color: "#b10020",
              border: "1px solid #b10020",
              opacity: canUnregister ? 1 : 0.5,
              cursor: canUnregister ? "pointer" : "not-allowed"
            }}
          >
            ביטול הרשמה
          </button>
        }

        {children}
      </div>
    </div>
  );
}
