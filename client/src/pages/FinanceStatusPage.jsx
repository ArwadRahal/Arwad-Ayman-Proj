// src/pages/FinanceStatusPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/StatusPage.css";

const API = "http://localhost:8801";

const renderAvatar = (user) => {
  if (user.ImageURL) {
    return <img src={`${API}/uploads/${user.ImageURL}`} alt={user.Name} />;
  } else {
    return (
      <img src={defaultAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
    );
  }
};

function FinanceSummary({ finance, loadingFinance }) {
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

export default function FinanceStatusPage() {
  const [finance, setFinance] = useState(null);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    setLoadingFinance(true);
    axios.get(`${API}/finance-status`)
      .then(res => setFinance(res.data))
      .catch(() => setFinance(null))
      .finally(() => setLoadingFinance(false));
  }, []);

  return (
    <div className="status-dashboard">
      <FinanceSummary finance={finance} loadingFinance={loadingFinance} />
    </div>
  );
}
