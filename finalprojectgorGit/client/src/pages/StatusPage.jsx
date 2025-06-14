import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StatusPage.css";

const statusColors = {
  Active: "#2ecc71",         
  ExpiringSoon: "#ffa500",   
  Expired: "#e74c3c",       
  NotPaid: "#e74c3c",         
};

const statusLabels = {
  Active: "בתוקף",
  ExpiringSoon: "פג תוקף בקרוב",
  Expired: "פג תוקף",
  NotPaid: "לא שולמה",
};

export default function StatusPage() {
  const [trainees, setTrainees] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8801/trainee-status")
      .then(res => setTrainees(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מנוי:", err));

    axios.get("http://localhost:8801/coach-status")
      .then(res => setCoaches(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מאמנות:", err));
  }, []);

  const filtered = trainees.filter(t =>
    t.Name?.toLowerCase().includes(search.toLowerCase()) ||
    (t.Email && t.Email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="status-dashboard">
      <h2>סטטוס מנוי – מתאמנות</h2>
      <div className="stats-cards">
        <div className="stat-box paid">
          <h3>בתוקף</h3>
          <p>{trainees.filter(t => t.status === "Active").length}</p>
        </div>
        <div className="stat-box expiring">
          <h3>פג תוקף בקרוב</h3>
          <p>{trainees.filter(t => t.status === "ExpiringSoon").length}</p>
        </div>
        <div className="stat-box unpaid">
          <h3>לא שולמה/פג תוקף</h3>
          <p>{trainees.filter(t => t.status === "Expired" || t.status === "NotPaid").length}</p>
        </div>
      </div>

      <div className="status-search">
        <input
          type="text"
          placeholder="חיפוש לפי שם/אימייל"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="legend">
          <span style={{color: "#2ecc71"}}>🟢 בתוקף</span>
          <span style={{color: "#ffa500"}}>🟠 תוקף בקרוב</span>
          <span style={{color: "#e74c3c"}}>🔴 לא בתוקף</span>
        </div>
      </div>


      <table className="trainee-table">
        <thead>
          <tr>
            <th>שם</th>
            <th>אימייל</th>
            <th>מס' טלפון</th>
            <th>סוג מנוי</th>
            <th>תאריך התחלה</th>
            <th>תאריך סיום</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7}>אין נתונים להצגה</td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.UserID}>
                <td>
                  <div className="user-avatar">
                    {t.Name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  {t.Name}
                </td>
                <td>{t.Email}</td>
                <td>{t.Phone || "-"}</td>
                <td>{t.SubscriptionType || "-"}</td>
                <td>{t.StartDate ? new Date(t.StartDate).toLocaleDateString() : "-"}</td>
                <td>{t.EndDate ? new Date(t.EndDate).toLocaleDateString() : "-"}</td>
                <td>
                  <span style={{
                    background: statusColors[t.status],
                    color: "white",
                    padding: "5px 14px",
                    borderRadius: "10px",
                    fontWeight: "bold"
                  }}>
                    {statusLabels[t.status]}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


      <h2 style={{marginTop: 45}}> המאמנות</h2>
      <table className="trainee-table coach-table">
        <thead>
          <tr>
            <th>שם מאמנת</th>
            <th>אימייל</th>
            <th>שעות עבודה החודש</th>
            <th>מס' אימונים</th>
          </tr>
        </thead>
        <tbody>
          {coaches.length === 0 ? (
            <tr>
              <td colSpan={4}>אין מאמנות להצגה</td>
            </tr>
          ) : (
            coaches.map((c) => (
              <tr key={c.UserID}>
                <td>
                  <div className="user-avatar">
                    {c.Name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  {c.Name}
                </td>
                <td>{c.Email}</td>
                <td>{c.HoursWorkedThisMonth ?? "-"}</td>
                <td>{c.SessionsCount ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
