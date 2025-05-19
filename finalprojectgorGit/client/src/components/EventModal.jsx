import React from 'react';
import '../styles/EventModal.css';

export default function EventModal({ isOpen, event, onClose, actions }) {
  if (!isOpen || !event) return null;
  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={e => e.stopPropagation()}>
        <h3>פרטי אימון</h3>
        <p><strong>תאריך:</strong> {event.date.split('T')[0]}</p>
        <p><strong>שעה:</strong> {event.hour}</p>
        <p><strong>מאמנת:</strong> {event.coach}</p>
        <p><strong>סוג:</strong> {event.type || 'לא צויין'}</p>
        <div className="event-modal-actions">
          {actions.map((a, i) => (
            <button key={i} onClick={() => { a.onClick(); onClose(); }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
