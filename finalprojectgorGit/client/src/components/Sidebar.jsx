import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  // Define the links for each role
  const linksByRole = {
    manager: [
      { label: 'לוח אימונים', to: '/manager' },
      { label: 'החנות',       to: '/product-management' },
      { label: 'סטטוס מנוי',  to: '/status' },
    ],
    coach: [
      { label: 'לוח אימונים', to: '/coach' },
      { label: 'הפרופיל שלי', to: '/coach-profile' },
    ],
    trainee: [
      { label: 'לוח אימונים', to: '/dashboard' },
      { label: 'החנות',       to: '/shop' },
    ]
  };

  const footerLinks = [
    { label: 'פרופיל אישי', to: '/profile' },
    { label: 'התנתקות',    to: '/logout' },
  ];

  const links = linksByRole[role] || [];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="toggle-btn"
        onClick={() => setIsOpen(open => !open)}
        aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
      >
        {isOpen ? '←' : '→'}
      </button>
      <div className="sidebar-content">
        <h2 className="sidebar-logo">FitTrack</h2>
        <nav className="nav-links">
          {links.map((l, i) => (
            <div
              key={i}
              className="nav-link"
              onClick={() => navigate(l.to)}
            >
              {l.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <nav className="nav-footer">
          {footerLinks.map((l, i) => (
            <div
              key={i}
              className="nav-footer-link"
              onClick={() => navigate(l.to)}
            >
              {l.label}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
