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
  const [finance, setFinance] = useState(null);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    axios.get(`${API}/trainee-status`)
      .then(res => setTrainees(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מנוי:", err));
    axios.get(`${API}/coach-status`)
      .then(res => setCoaches(res.data))
      .catch(err => console.error("שגיאה בקבלת נתוני מאמנות:", err));
    setLoadingFinance(true);
    axios.get(`${API}/finance-status`)
      .then(res => setFinance(res.data))
      .catch(() => setFinance(null))
      .finally(() => setLoadingFinance(false));
  }, []);

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

  const renderAvatar = (user) => {
    if (user.ImageURL) {
      return <img src={`${API}/uploads/${user.ImageURL}`} alt={user.Name} />;
    } else {
      return (
        <img src={defaultAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      );
    }
  };

  function FinanceSummary() {
    if (loadingFinance) return <div className="finance-summary">טוען נתונים פיננסיים...</div>;
    if (!finance) return <div className="finance-summary" style={{ color: "#c00" }}>שגיאה בטעינת מידע פיננסי</div>;
    return (
      <div className="finance-summary">
        <h2>לוח פיננסי</h2>
        <div className="finance-cards-row">
          <div className="finance-card total">
            <div>💰 <b>סה"כ הכנסות:</b></div>
            <div className="finance-val">{finance.totalIncome.toLocaleString()} ₪</div>
          </div>
          <div className="finance-card sub">
            <div>📅 הכנסות מנויים</div>
            <div className="finance-val">{finance.subscriptionsIncome.toLocaleString()} ₪</div>
          </div>
          <div className="finance-card orders">
            <div>🛒 הכנסות מהזמנות</div>
            <div className="finance-val">{finance.ordersIncome.toLocaleString()} ₪</div>
          </div>
          <div className="finance-card salary">
            <div>👩‍🏫 עלות משכורות מאמנות</div>
            <div className="finance-val">{finance.coachesSalaries.toLocaleString()} ₪</div>
          </div>
          <div className={"finance-card profit" + (finance.adminProfit < 0 ? " negative" : " positive")}>
            <div>📈 רווח/הפסד</div>
            <div className="finance-val" style={{ fontWeight: "bold" }}>
              {finance.adminProfit.toLocaleString()} ₪
              <span style={{ color: finance.adminProfit < 0 ? "#e74c3c" : "#2ecc71", marginRight: 6 }}>
                {finance.adminProfit < 0 ? "🔻" : "🟢"}
              </span>
            </div>
          </div>
        </div>
        <div className="coach-salaries-table-wrap">
          <h4>פירוט שכר מאמנות</h4>
          <table className="coach-salaries-table">
            <thead>
              <tr>
                <th>מאמנת</th>
                <th>סה"כ שעות</th>
                <th>סה"כ שכר</th>
                <th>שעות אישי</th>
                <th>שעות זוגי</th>
                <th>שעות קבוצתי</th>
              </tr>
            </thead>
            <tbody>
              {finance.coaches && finance.coaches.length === 0 && (
                <tr><td colSpan={6}>אין מאמנות</td></tr>
              )}
              {finance.coaches && finance.coaches.map(coach => (
                <tr key={coach.UserID}>
                  <td>
                    <div className="user-avatar small">{renderAvatar(coach)}</div>
                    {coach.Name}
                  </td>
                  <td>{coach.TotalHours || 0}</td>
                  <td>{coach.TotalSalary ? coach.TotalSalary.toLocaleString() : 0} ₪</td>
                  <td>
                    {coach.details["אישי"] ? (
                      <>
                        {coach.details["אישי"].Hours || 0} ש' <br />
                        <span style={{ fontSize: 13 }}>({coach.details["אישי"].Salary || 0}₪)</span>
                      </>
                    ) : "—"}
                  </td>
                  <td>
                    {coach.details["זוגי"] ? (
                      <>
                        {coach.details["זוגי"].Hours || 0} ש' <br />
                        <span style={{ fontSize: 13 }}>({coach.details["זוגי"].Salary || 0}₪)</span>
                      </>
                    ) : "—"}
                  </td>
                  <td>
                    {coach.details["קבוצתי"] ? (
                      <>
                        {coach.details["קבוצתי"].Hours || 0} ש' <br />
                        <span style={{ fontSize: 13 }}>({coach.details["קבוצתי"].Salary || 0}₪)</span>
                      </>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="status-dashboard">
      <FinanceSummary />

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

      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
