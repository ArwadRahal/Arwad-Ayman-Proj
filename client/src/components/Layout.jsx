// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

export default function Layout() {
  const stored = localStorage.getItem('currentUser');
  const rawRole = stored ? JSON.parse(stored).role.toLowerCase() : '';
  const role = rawRole === 'admin' ? 'manager' : rawRole;

  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
