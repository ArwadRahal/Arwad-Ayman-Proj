// src/pages/UsersStatusPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import UserProfilePopup from "../components/UserProfilePopup";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/StatusPage.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";

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

export default function UsersStatusPage() {
  const [trainees, setTrainees] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");

  // فلاتر مبسّطة
  // statusFilter: all | Active | ExpiringSoon | ExpiredOrNotPaid
  const [statusFilter, setStatusFilter] = useState("all");
  // typeFilter: all | Monthly | Yearly
  const [typeFilter, setTypeFilter] = useState("all");
  // sortBy: status | endDate | name
  const [sortBy, setSortBy] = useState("status");

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/trainee-status`)
      .then((res) => setTrainees(res.data))
      .catch((err) => console.error("שגיאה בקבלת נתוני מנוי:", err));

    axios
      .get(`${API}/coach-status`)
      .then((res) => setCoaches(res.data))
      .catch((err) => console.error("שגיאה בקבלת נתוני מאמנות:", err));
  }, []);

  const fetchFullUser = async (userId) => {
    try {
      const res = await axios.get(`${API}/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      alert("שגיאה בטעינת נתוני פרופיל");
    }
  };

  function getDaysLeft(endDate) {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  }

  const renderAvatar = (user) => {
    if (user.ImageURL) {
      return <img src={`${API}/uploads/${user.ImageURL}`} alt={user.Name} />;
    }
    return (
      <img
        src={defaultAvatar}
        alt="avatar"
        style={{ width: 36, height: 36, borderRadius: "50%" }}
      />
    );
  };

  // عدّادات الكروت
  const activeCount = trainees.filter((t) => t.status === "Active").length;
  const soonCount = trainees.filter((t) => t.status === "ExpiringSoon").length;
  const redCount = trainees.filter(
    (t) => t.status === "Expired" || t.status === "NotPaid"
  ).length;

  // فلترة + ترتيب
  const filtered = useMemo(() => {
    let list = trainees.slice();

    // بحث
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.Name && t.Name.toLowerCase().includes(q)) ||
          (t.Email && t.Email.toLowerCase().includes(q))
      );
    }

    // حالة (من الكروت)
    if (statusFilter !== "all") {
      if (statusFilter === "ExpiredOrNotPaid") {
        list = list.filter(
          (t) => t.status === "Expired" || t.status === "NotPaid"
        );
      } else {
        list = list.filter((t) => t.status === statusFilter);
      }
    }

    // نوع (حودشي/שנתי)
    if (typeFilter !== "all") {
      list = list.filter(
        (t) =>
          (t.SubscriptionType || "").toLowerCase() ===
          typeFilter.toLowerCase()
      );
    }

    // ترتيب
    if (sortBy === "status") {
      const order = { Active: 1, ExpiringSoon: 2, Expired: 3, NotPaid: 4 };
      list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    } else if (sortBy === "endDate") {
      list.sort(
        (a, b) =>
          (a.EndDate ? new Date(a.EndDate) : 0) -
          (b.EndDate ? new Date(b.EndDate) : 0)
      );
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
    }

    return list;
  }, [trainees, search, statusFilter, typeFilter, sortBy]);

  const coachBarData = coaches.map((coach) => ({
    name: coach.Name,
    trainees: coach.UniqueTraineesCount ?? 0,
    color: (coach.UniqueTraineesCount ?? 0) > 5 ? "#2ecc71" : "#e2764a",
  }));

  return (

    
    <div className="status-dashboard">
       <h2 style={{ marginTop: 45 }}>המאמנות</h2>

      <div
        style={{
          width: "100%",
          maxWidth: 560,
          height: 260,
          margin: "0 auto 26px auto",
          background: "#fff",
          borderRadius: 13,
          boxShadow: "0 1px 8px 0 rgba(128,138,178,0.08)",
          padding: 10,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: "#6b47b6",
            fontSize: 18,
            marginBottom: 2,
          }}
        >
          המאמנות – מדד פופולריות (חודש נוכחי)
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#7d6cae",
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          מספר מתאמנות שונות לכל מאמנת
        </div>

        <ResponsiveContainer width="100%" height={180}>
          {coachBarData.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              אין נתונים לחודש הנוכחי
            </div>
          ) : (
            <BarChart
              data={coachBarData}
              layout="vertical"
              margin={{ left: 24, right: 24, top: 4, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }}>
                <Label value="מספר מתאמנות" position="insideBottom" offset={-2} />
              </XAxis>
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value}`, "מתאמנות שונות"]}
                labelFormatter={(label) => `מאמנת: ${label}`}
              />
              <Bar dataKey="trainees" radius={[10, 10, 10, 10]} barSize={18}>
                {coachBarData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
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
                    className="name-link"
                    title="לצפייה בפרופיל"
                  >
                    {c.Name}
                  </span>
                </td>
                <td>{c.Email}</td>
                <td style={{ textAlign: "center" }}>
                  {c.HoursWorkedThisMonth ?? "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {c.SessionsCount ?? "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        (c.UniqueTraineesCount ?? 0) >= 6
                          ? "#14b181"
                          : "#e2764a",
                    }}
                  >
                    {c.UniqueTraineesCount ?? 0}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>סטטוס מנוי – מתאמנות</h2>

      <div className="filters-bar">
        <div className="pills-wrap">
          <div
            className="pills"
            role="tablist"
            aria-label="Filter by subscription type"
          >
            <button
              className={`pill ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              כל הסוגים
            </button>
            <button
              className={`pill ${typeFilter === "Monthly" ? "active" : ""}`}
              onClick={() => setTypeFilter("Monthly")}
            >
              חודשי
            </button>
            <button
              className={`pill ${typeFilter === "Yearly" ? "active" : ""}`}
              onClick={() => setTypeFilter("Yearly")}
            >
              שנתי
            </button>
          </div>
        </div>

        <div className="filters-right">
          <input
            type="text"
            className="search-input"
            placeholder="חיפוש לפי שם/אימייל"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="status">סדר לפי סטטוס</option>
            <option value="endDate">סדר לפי סיום</option>
            <option value="name">סדר א-ב</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <button
          className={`stat-box paid ${
            statusFilter === "Active" ? "active" : ""
          }`}
          onClick={() =>
            setStatusFilter(statusFilter === "Active" ? "all" : "Active")
          }
          title="הצג/בטל סינון: בתוקף"
        >
          <h3>בתוקף</h3>
          <p>{activeCount}</p>
        </button>

        <button
          className={`stat-box expiring ${
            statusFilter === "ExpiringSoon" ? "active" : ""
          }`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "ExpiringSoon" ? "all" : "ExpiringSoon"
            )
          }
          title="הצג/בטל סינון: פג תוקף בקרוב"
        >
          <h3>פג תוקף בקרוב</h3>
          <p>{soonCount}</p>
        </button>

        <button
          className={`stat-box unpaid ${
            statusFilter === "ExpiredOrNotPaid" ? "active" : ""
          }`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "ExpiredOrNotPaid"
                ? "all"
                : "ExpiredOrNotPaid"
            )
          }
          title="הצג/בטל סינון: לא שולמה/פג תוקף"
        >
          <h3>לא שולמה/פג תוקף</h3>
          <p>{redCount}</p>
        </button>
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
                      className="name-link"
                      title="לצפייה בפרופיל"
                    >
                      {t.Name}
                    </span>
                  </td>
                  <td>{t.Email}</td>
                  <td style={{ textAlign: "center" }}>{t.Phone || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    {t.SubscriptionType || "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {t.StartDate
                      ? new Date(t.StartDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {t.EndDate
                      ? new Date(t.EndDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <span
                      style={{
                        background: statusColors[t.status],
                        color: "#fff",
                        padding: "5px 14px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        display: "inline-block",
                      }}
                    >
                      {statusLabels[t.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {t.status === "ExpiringSoon" && daysLeft > 0 ? (
                      <span style={{ color: "#ffa500", fontWeight: 600 }}>
                        {daysLeft} ימים לסיום
                      </span>
                    ) : t.status === "Active" && daysLeft > 0 ? (
                      <span style={{ color: "#2ecc71", fontWeight: 600 }}>
                        {daysLeft} ימים
                      </span>
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

     
      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
