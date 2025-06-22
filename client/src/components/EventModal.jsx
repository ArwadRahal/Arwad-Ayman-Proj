import React from 'react';
import '../styles/EventModal.css';

export default function EventModal({ isOpen, event, onClose, actions, children }) {
  if (!isOpen || !event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✖️</button>
        <h3>פרטי אימון</h3>
        <p>תאריך: {new Date(event.session_date).toLocaleDateString("he-IL")}</p>
        <p><strong>שעה:</strong> {event.start_time} - {event.end_time}</p>
        <p><strong>מאמנת:</strong> {event.coach_name}</p>
        <p><strong>סוג אימון:</strong> {event.session_type || 'לא צויין'}</p>
        <div className="event-modal-actions">
          {actions && actions.map((a, i) => (
            <button key={i} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
