import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/StatusPage.css";

const StatusPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios.get("http://localhost:8801/payments")
      .then((res) => {
        const data = res.data;
        setPayments(data);

        // סטטיסטיקות
        const paid = data.filter(p => p.Status === "Completed").length;
        const unpaid = data.filter(p => p.Status !== "Completed").length;
        setStats({ total: data.length, paid, unpaid });

        // גרף לפי תאריכים (אחרון 30 ימים)
        const dateMap = {};
        data.forEach(p => {
          const date = new Date(p.PaymentDate).toLocaleDateString();
          if (!dateMap[date]) dateMap[date] = 0;
          dateMap[date] += Number(p.Amount);
        });

        const labels = Object.keys(dateMap);
        const values = Object.values(dateMap);

        setChartData({
          labels,
          datasets: [
            {
              label: "סכום תשלומים יומי (₪)",
              data: values,
              backgroundColor: "#3f51b5",
            },
          ],
        });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="status-dashboard">
      <h2>סטטוס מנוי - ניהול תשלומים</h2>

      {/* סיכום מספרים */}
      <div className="stats-cards">
        <div className="stat-box total">
          <h3>סה"כ תשלומים</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-box paid">
          <h3>משתמשות ששילמו</h3>
          <p>{stats.paid}</p>
        </div>
        <div className="stat-box unpaid">
          <h3>משתמשות שלא שילמו</h3>
          <p>{stats.unpaid}</p>
        </div>
      </div>

      {/* גרף */}
      <div className="chart-section">
        <h3>גרף תשלומים (30 יום אחרונים)</h3>
        {chartData.labels && chartData.labels.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p>אין נתוני תשלום להצגה בגרף</p>
        )}
      </div>

      {/* רשימת תשלומים אחרונים */}
      <div className="payments-list">
        <h3>תשלומים אחרונים</h3>
        {payments.length > 0 ? (
          <div className="card-container">
            {payments.slice(0, 6).map((p) => (
              <div key={p.PaymentID} className={`card ${p.Status.toLowerCase()}`}>
                <div className="card-body">
                  <p><strong>שם:</strong> {p.UserName}</p>
                  <p><strong>אימייל:</strong> {p.Email}</p>
                  <p><strong>תאריך:</strong> {new Date(p.PaymentDate).toLocaleDateString()}</p>
                  <p><strong>סכום:</strong> {p.Amount} ₪</p>
                  <p><strong>סטטוס:</strong> {p.Status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-payments">אין תשלומים להצגה כרגע</p>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
