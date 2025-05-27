import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  // Define the links for each role, with icons
  const linksByRole = {
    manager: [
      { label: 'לוח אימונים', to: '/schedule', icon: '📅' },
      { label: 'החנות', to: '/product-management', icon: '🛍️' },
      { label: 'סטטוס מנוי', to: '/status', icon: '📊' },
    ],

    coach: [
      { label: 'לוח אימונים', to: '/coach', icon: '📅' },
      { label: 'הפרופיל שלי', to: '/coach-profile', icon: '👤' },
    ],
    trainee: [
      { label: 'לוח אימונים', to: '/dashboard', icon: '📅' },
      { label: 'החנות', to: '/shop', icon: '🛒' },
    ]
  };

  const footerLinks = [
    { label: 'פרופיל אישי', to: '/profile', icon: '👤' },
    { label: 'התנתקות', to: '/logout', icon: '🚪' },
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
              onClick={() => navigate(l.to)}
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
