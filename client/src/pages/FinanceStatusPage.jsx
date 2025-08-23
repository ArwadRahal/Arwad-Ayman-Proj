import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.svg";
import "../styles/StatusPage.css";

const API = "http://localhost:8801";

/* Avatar helper */
const renderAvatar = (user) => {
  if (user.ImageURL) {
    return <img src={`${API}/uploads/${user.ImageURL}`} alt={user.Name} />;
  }
  return <img src={defaultAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />;
};
function deriveFinance(finance) {
  if (!finance) return null;
  const raw = finance.rawSessions || finance.coachSessions;
  if (Array.isArray(raw) && raw.length) {
    const valid = raw.filter(
      (s) => !s.Canceled && (s.Attendees ?? 0) > 0
    );
    const byCoach = new Map();
    for (const s of valid) {
      const id = s.CoachID ?? s.UserID ?? s.coachId ?? s.Name;
      const name = s.CoachName ?? s.Name ?? "";
      const key = id || name;
      if (!byCoach.has(key)) {
        byCoach.set(key, {
          UserID: id,
          Name: name,
          ImageURL: s.ImageURL,
          TotalHours: 0,
          TotalSalary: 0,
          details: {
            "אישי": { Hours: 0, Salary: 0 },
            "זוגי": { Hours: 0, Salary: 0 },
            "קבוצתי": { Hours: 0, Salary: 0 },
          },
        });
      }
      const row = byCoach.get(key);
      const hours = Number(s.Hours) || 0;
      const pay = Number(s.Pay) || 0;
      row.TotalHours += hours;
      row.TotalSalary += pay;
      const t = String(s.Type || "").trim();
      if (t === "אישי" || t === "זוגי" || t === "קבוצתי") {
        row.details[t].Hours += hours;
        row.details[t].Salary += pay;
      }
    }
    const totalIncome = Number(finance.totalIncome ?? 0);
    const subscriptionsIncome = Number(finance.subscriptionsIncome ?? 0);
    const ordersIncome = Number(finance.ordersIncome ?? 0);
    const coaches = Array.from(byCoach.values());
    const coachesSalaries = coaches.reduce((a, c) => a + (c.TotalSalary || 0), 0);
    const adminProfit = (Number(finance.adminProfit ?? 0)) || (totalIncome - coachesSalaries);
    return {
      ...finance,
      totalIncome,
      subscriptionsIncome,
      ordersIncome,
      adminProfit,
      coachesSalaries,
      coaches,
    };
  }
  return finance;
}
function FinanceSummary({ finance, loadingFinance, start, end }) {
  if (loadingFinance) return <div className="finance-summary">טוען נתונים פיננסיים...</div>;
  if (!finance) return <div className="finance-summary" style={{ color: "#c00" }}>שגיאה בטעינת מידע פיננסי</div>;
  const rangeTxt = `${new Date(start).toLocaleDateString()} — ${new Date(end).toLocaleDateString()}`;
  return (
    <div className="finance-summary">
      <h2>לוח פיננסי</h2>
      <div className="finance-range-hint">החישוב מתאריך <b>{rangeTxt}</b></div>
      <div className="finance-cards-row">
        <div className="finance-card total">
          <div>💰 <b>סה"כ הכנסות</b></div>
          <div className="finance-val">{Number(finance.totalIncome || 0).toLocaleString()} ₪</div>
        </div>
        <div className="finance-card sub">
          <div>📅 הכנסות מנויים</div>
          <div className="finance-val">{Number(finance.subscriptionsIncome || 0).toLocaleString()} ₪</div>
        </div>
        <div className="finance-card orders">
          <div>🛒 הכנסות מהזמנות</div>
          <div className="finance-val">{Number(finance.ordersIncome || 0).toLocaleString()} ₪</div>
        </div>
        <div className={"finance-card profit" + ((finance.adminProfit ?? 0) < 0 ? " negative" : " positive")}>
          <div>📈 רווח/הפסד</div>
          <div className="finance-val" style={{ fontWeight: "bold" }}>
            {Number(finance.adminProfit || 0).toLocaleString()} ₪
            <span style={{ color: (finance.adminProfit ?? 0) < 0 ? "#e74c3c" : "#2ecc71", marginRight: 6 }}>
              {(finance.adminProfit ?? 0) < 0 ? "🔻" : "🟢"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function FinanceStatusPage() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [start, setStart] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [end, setEnd] = useState(lastOfMonth.toISOString().slice(0, 10));
  const [searchCoach, setSearchCoach] = useState("");
  const [financeRaw, setFinanceRaw] = useState(null);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const finance = useMemo(() => deriveFinance(financeRaw), [financeRaw]);
  const fetchFinance = async () => {
    setLoadingFinance(true);
    try {
      const url = `${API}/finance-status?start=${start}&end=${end}`;
      const res = await axios.get(url);
      setFinanceRaw(res.data);
    } catch {
      setFinanceRaw(null);
    } finally {
      setLoadingFinance(false);
    }
  };
  useEffect(() => {
    fetchFinance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const filteredCoaches = useMemo(() => {
    if (!finance?.coaches) return [];
    const q = searchCoach.trim().toLowerCase();
    if (!q) return finance.coaches;
    return finance.coaches.filter((c) => (c.Name || "").toLowerCase().includes(q));
  }, [finance, searchCoach]);
  return (
    <div className="status-dashboard">
      <div className="finance-toolbar">
        <div className="toolbar-left">
          <label>
            מתאריך
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            עד תאריך
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={fetchFinance}>עדכני טווח</button>
        </div>
        <div className="toolbar-right">
          <input
            type="text"
            className="search-input"
            placeholder="חיפוש לפי שם מאמנת…"
            value={searchCoach}
            onChange={(e) => setSearchCoach(e.target.value)}
          />
        </div>
      </div>
      <FinanceSummary finance={finance} loadingFinance={loadingFinance} start={start} end={end} />
      <div className="coach-salaries-table-wrap">
        <h4>פירוט שכר מאמנות (ללא אימונים שבוטלו / ללא נוכחות)</h4>
        <table className="coach-salaries-table">
          <thead>
            <tr>
              <th>מאמנת</th>
              <th>סה״כ שעות</th>
              <th>סה״כ שכר</th>
              <th>שעות אישי</th>
              <th>שעות זוגי</th>
              <th>שעות קבוצתי</th>
            </tr>
          </thead>
          <tbody>
            {(!filteredCoaches || filteredCoaches.length === 0) && (
              <tr><td colSpan={6}>אין מאמנות בטווח שנבחר</td></tr>
            )}
            {filteredCoaches && filteredCoaches.map((coach) => (
              <tr key={coach.UserID || coach.Name}>
                <td>
                  <div className="user-avatar small">{renderAvatar(coach)}</div>
                  {coach.Name}
                </td>
                <td>{coach.TotalHours || 0}</td>
                <td>{coach.TotalSalary ? Number(coach.TotalSalary).toLocaleString() : 0} ₪</td>
                <td>
                  {coach.details?.["אישי"]
                    ? <>
                        {coach.details["אישי"].Hours || 0} ש׳<br />
                        <span style={{ fontSize: 13 }}>({coach.details["אישי"].Salary || 0}₪)</span>
                      </>
                    : "—"}
                </td>
                <td>
                  {coach.details?.["זוגי"]
                    ? <>
                        {coach.details["זוגי"].Hours || 0} ש׳<br />
                        <span style={{ fontSize: 13 }}>({coach.details["זוגי"].Salary || 0}₪)</span>
                      </>
                    : "—"}
                </td>
                <td>
                  {coach.details?.["קבוצתי"]
                    ? <>
                        {coach.details["קבוצתי"].Hours || 0} ש׳<br />
                        <span style={{ fontSize: 13 }}>({coach.details["קבוצתי"].Salary || 0}₪)</span>
                      </>
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
