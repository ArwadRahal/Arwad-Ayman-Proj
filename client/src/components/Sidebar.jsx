import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

   const displayRole = (role === 'Admin' ? 'manager' : role);

  const linksByRole = {
    manager: [
    { label: 'עמוד ראשי', to: '/ManagerOverview', icon: '🏠' },
    { label: 'לוח אימונים', to: '/schedule', icon: '📅' },
    { label: 'סטטוס משתמשות', to: '/users-status', icon: '👥' },
    { label: 'דו"ח פיננסי', to: '/finance-status', icon: '💵' },
    { label: 'החנות', to: '/product-management', icon: '🛍️' },
    { label: 'ניהול הזמנות', to: '/admin/orders', icon: '📦' },
  ],
    coach: [
      { label: 'דף בית', to: '/coach', icon: '🏠' },
      { label: 'לוח אימונים', to: '/schedule', icon: '📅' },
      { label: 'החנות', to: '/shop', icon: '🛒' },
      { label: 'היסטוריית תשלומים', to: '/my-payments', icon: '💳' },
    ],
    trainee: [
      { label: 'עמוד ראשי', to: '/TraineeView', icon: '🏠' },
      { label: 'לוח אימונים', to: '/schedule', icon: '📅' },
      // { label: 'החנות', to: '/shop', icon: '🛒' },
      { label: 'היסטוריית תשלומים', to: '/my-payments', icon: '💳' },

    ],
  };

  const links = linksByRole[displayRole] || [];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('motivation_quote');
    window.location.href = '/login';
  };

  const footerLinks = [
    { label: 'פרופיל אישי', to: '/profile', icon: '👤' },
    { label: 'התנתקות', action: handleLogout, icon: '🚪' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="toggle-btn"
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
      >
        {isOpen ? '←' : '→'}
      </button>

      <div className="sidebar-content">
        <h2 className="sidebar-logo">FitTrack</h2>

        <nav className="nav-links">
          {links.map((l, i) => (
            <div key={i} className="nav-link" onClick={() => navigate(l.to)}>
              <span className="nav-icon">{l.icon}</span>
              <span className="nav-label">{l.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <nav className="nav-footer">
          {footerLinks.map((l, i) => (
            <div
              key={i}
              className="nav-footer-link"
              onClick={l.action || (() => navigate(l.to))}
            >
              <span className="nav-icon">{l.icon}</span>
              <span className="nav-label">{l.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
