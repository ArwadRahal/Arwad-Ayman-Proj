import React, { useEffect, useState } from "react";
import axios from "axios";
import UserProfilePopup from "../components/UserProfilePopup";
import defaultAvatar from "../assets/default-avatar.svg";
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
const API = "http://localhost:8801";

export default function StatusPage() {
  const [trainees, setTrainees] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    axios.get(`${API}/trainee-status`)
      .then(res => setTrainees(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מנוי:", err));
    axios.get(`${API}/coach-status`)
      .then(res => setCoaches(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מאמנות:", err));
  }, []);

  // عند النقر على الاسم/الصورة - نجلب كل التفاصيل من جدول users
  const fetchFullUser = async (userId) => {
    try {
      const res = await axios.get(`${API}/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      alert("שגיאה בטעינת נתוני פרופיל");
    }
  };

  const filtered = trainees.filter(t =>
    t.Name?.toLowerCase().includes(search.toLowerCase()) ||
    (t.Email && t.Email.toLowerCase().includes(search.toLowerCase()))
  );

  // افاتار صورة/افتراضية
  const renderAvatar = (user) => {
    if (user.ImageURL) {
      return <img src={`${API}/uploads/${user.ImageURL}`} alt={user.Name} />;
    } else {
      return (
        <img src={defaultAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      );
    }
  };

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
          <span style={{ color: "#2ecc71" }}>🟢 בתוקף</span>
          <span style={{ color: "#ffa500" }}>🟠 תוקף בקרוב</span>
          <span style={{ color: "#e74c3c" }}>🔴 לא בתוקף</span>
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
                  <div
                    className="user-avatar"
                    onClick={() => fetchFullUser(t.UserID)}
                    title="לצפייה בפרופיל"
                  >
                    {renderAvatar(t)}
                  </div>
                  <span
                    onClick={() => fetchFullUser(t.UserID)}
                    style={{
                      cursor: "pointer",
                      color: "#845ec2",
                      marginRight: 7,
                      textDecoration: "underline",
                      verticalAlign: "middle"
                    }}
                    title="לצפייה בפרופיל"
                  >
                    {t.Name}
                  </span>
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

      <h2 style={{ marginTop: 45 }}> המאמנות</h2>
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
                  <div
                    className="user-avatar"
                    onClick={() => fetchFullUser(c.UserID)}
                    title="לצפייה בפרופיל"
                  >
                    {renderAvatar(c)}
                  </div>
                  <span
                    onClick={() => fetchFullUser(c.UserID)}
                    style={{
                      cursor: "pointer",
                      color: "#845ec2",
                      marginRight: 7,
                      textDecoration: "underline",
                      verticalAlign: "middle"
                    }}
                    title="לצפייה בפרופיל"
                  >
                    {c.Name}
                  </span>
                </td>
                <td>{c.Email}</td>
                <td>{c.HoursWorkedThisMonth ?? "-"}</td>
                <td>{c.SessionsCount ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Popup لعرض المعلومات فقط */}
      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
