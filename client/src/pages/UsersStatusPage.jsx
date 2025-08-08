// src/pages/UsersStatusPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserProfilePopup from "../components/UserProfilePopup";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/StatusPage.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API = "http://localhost:8801";

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
const subscriptionTypes = ["כל הסוגים", "חודשי", "שנתי"];

export default function UsersStatusPage() {
  const [trainees, setTrainees] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("כל הסוגים");
  const [sortBy, setSortBy] = useState("status");

  useEffect(() => {
    axios.get(`${API}/trainee-status`)
      .then(res => setTrainees(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מנוי:", err));
    axios.get(`${API}/coach-status`)
      .then(res => setCoaches(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מאמנות:", err));
  }, []);

  const fetchFullUser = async (userId) => {
    try {
      const res = await axios.get(`${API}/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      alert("שגיאה בטעינת נתוני פרופיל");
    }
  };

  let filtered = trainees.filter(t =>
    (t.Name?.toLowerCase().includes(search.toLowerCase()) ||
      (t.Email && t.Email.toLowerCase().includes(search.toLowerCase())))
    &&
    (filterStatus === "all" ? true : t.status === filterStatus)
    &&
    (filterType === "כל הסוגים" ? true : t.SubscriptionType === filterType)
  );

  if (sortBy === "status") {
    const order = { Active: 1, ExpiringSoon: 2, Expired: 3, NotPaid: 4 };
    filtered = filtered.sort((a, b) => order[a.status] - order[b.status]);
  }
  if (sortBy === "endDate") {
    filtered = filtered.sort((a, b) =>
      (a.EndDate ? new Date(a.EndDate) : 0) - (b.EndDate ? new Date(b.EndDate) : 0)
    );
  }
  if (sortBy === "name") {
    filtered = filtered.sort((a, b) => a.Name.localeCompare(b.Name));
  }

  function getDaysLeft(endDate) {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  const renderAvatar = (user) => {
    if (user.ImageURL) {
      return <img src={`${API}/uploads/${user.ImageURL}`} alt={user.Name} />;
    } else {
      return (
        <img src={defaultAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      );
    }
  };

  const coachBarData = coaches.map(coach => ({
    name: coach.Name,
    trainees: coach.UniqueTraineesCount ?? 0,
    color: coach.UniqueTraineesCount > 5 ? "#2ecc71" : "#e2764a"
  }));

  return (
    <div className="status-dashboard">
      <h2>סטטוס מנוי – מתאמנות</h2>

      <div className="status-filters" style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="חיפוש לפי שם/אימייל"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">כל הסטטוסים</option>
          <option value="Active">בתוקף</option>
          <option value="ExpiringSoon">פג תוקף בקרוב</option>
          <option value="Expired">פג תוקף</option>
          <option value="NotPaid">לא שולמה</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          {subscriptionTypes.map(type => (
            <option key={type} value={type}>{type === "כל הסוגים" ? "כל סוגי המנוי" : type}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="status">סדר לפי סטטוס</option>
          <option value="endDate">סדר לפי סיום</option>
          <option value="name">סדר א-ב</option>
        </select>
      </div>

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
            <th>תוקף/ימים לסיום</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8}>אין נתונים להצגה</td>
            </tr>
          ) : (
            filtered.map((t) => {
              const daysLeft = getDaysLeft(t.EndDate);
              return (
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
                  <td>
                    {t.status === "ExpiringSoon" && daysLeft > 0 ? (
                      <span style={{ color: "#ffa500", fontWeight: 600 }}>{daysLeft} ימים לסיום</span>
                    ) : t.status === "Active" && daysLeft > 0 ? (
                      <span style={{ color: "#2ecc71", fontWeight: 600 }}>{daysLeft} ימים</span>
                    ) : t.status === "Expired" ? (
                      "פג תוקף"
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>


      <h2 style={{ marginTop: 45 }}>המאמנות</h2>

      <div style={{ width: '100%', maxWidth: 560, height: 230, margin: '0 auto 26px auto', background: '#fff', borderRadius: 13, boxShadow: '0 1px 8px 0 rgba(128,138,178,0.08)', padding: 10 }}>
        <div style={{ textAlign: 'center', fontWeight: 600, color: '#7356b3', fontSize: 16, marginBottom: 8 }}>מדד פופולריות - מספר מתאמנות שונות לכל מאמנת</div>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={coachBarData} layout="vertical" margin={{ left: 24, right: 24 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Bar dataKey="trainees" radius={11}>
              {coachBarData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="trainee-table coach-table">
        <thead>
          <tr>
            <th>שם מאמנת</th>
            <th>אימייל</th>
            <th>שעות עבודה החודש</th>
            <th>מס' אימונים</th>
            <th>כמות מתאמנות שונות (חודש)</th>
          </tr>
        </thead>
        <tbody>
          {coaches.length === 0 ? (
            <tr>
              <td colSpan={5}>אין מאמנות להצגה</td>
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
                <td>
                  <span style={{
                    fontWeight: 600,
                    color: c.UniqueTraineesCount > 5 ? "#14b181" : "#e2764a"
                  }}>
                    {c.UniqueTraineesCount ?? 0}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
