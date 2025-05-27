import React, { useState } from 'react';
import '../styles/NotificationsBell.css';

export default function NotificationsBell({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="notif-container">
      <button className="bell-btn" onClick={() => setOpen(!open)}>
        🔔
        {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="notif-item">
                {n.text}
              </div>
            ))
          ) : (
            <div className="notif-item">אין התראות</div>
          )}
        </div>
      )}
    </div>
  );
}
