// routes/finance-status.js
const express = require('express');
const router = express.Router();
const db = require("../db");

const PRICES = {
  "אישי": 60,   
  "זוגי": 40,    
  "קבוצתי": 30,  
};

function translateType(type) {
  switch (type) {
    case "Single": return "אישי";
    case "Couple": return "זוגי";
    case "Group":  return "קבוצתי";
    default:       return "אישי";
  }
}
function toDateOnly(d) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}
function parseYMD(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function clampDate(dt, min, max) {
  return new Date(Math.min(Math.max(dt.getTime(), min.getTime()), max.getTime()));
}
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function isBetweenInclusive(d, a, b) {
  const t = d.getTime(), ta = a.getTime(), tb = b.getTime();
  return t >= ta && t <= tb;
}

function countYearlyInstalmentsInRange(subscriptionStart, subscriptionEnd, rangeStart, rangeEnd, today) {
  const hardEnd = new Date(Math.min(subscriptionEnd.getTime(), today.getTime(), rangeEnd.getTime()));
  if (hardEnd < subscriptionStart) return 0;
  let count = 0;
  let tick = new Date(subscriptionStart);
  if (tick > hardEnd) return 0;
  while (tick < rangeStart && tick <= hardEnd) {
    tick = addMonths(tick, 1);
  }
  while (tick <= hardEnd) {
    if (isBetweenInclusive(tick, rangeStart, rangeEnd)) {
      count++;
    }
    tick = addMonths(tick, 1);
  }
  return count;
}
async function getSubscriptionsIncome(start, end) {
  const startYMD = toDateOnly(start);
  const endYMD   = toDateOnly(end);
  const today    = toDateOnly(new Date());
  const [subs] = await db.query(
    `SELECT SubscriptionID, UserID, Type, StartDate, EndDate, TotalAmount
     FROM subscription
     WHERE EndDate >= ? AND StartDate <= ?`,
    [startYMD, endYMD]
  );
  let total = 0;
  for (const s of subs) {
    const sStart = toDateOnly(new Date(s.StartDate));
    const sEnd   = toDateOnly(new Date(s.EndDate));
    const amount = Number(s.TotalAmount) || 0;
    const kind   = String(s.Type || "").trim();

    if (kind === "Monthly") {
      if (isBetweenInclusive(sStart, startYMD, endYMD)) {
        total += amount;
      }
    } else if (kind === "Yearly") {
      const part = amount / 12;
      const months = countYearlyInstalmentsInRange(sStart, sEnd, startYMD, endYMD, today);
      total += part * months;
    } else {
      if (isBetweenInclusive(sStart, startYMD, endYMD)) {
        total += amount;
      }
    }
  }
  return Number(total.toFixed(2));
}

async function getOrdersIncome(start, end) {
  const [rows] = await db.query(
    `SELECT IFNULL(SUM(TotalPrice),0) AS total
     FROM orders
     WHERE Status IN ('Accepted','Completed')
       AND OrderDate BETWEEN ? AND ?`,
    [toDateOnly(start), toDateOnly(end)]
  );
  return Number(rows[0]?.total || 0);
}
async function getCoachesSalaries(start, end) {
  const [rows] = await db.query(
    `
    SELECT 
      e.CoachID,
      u.Name,
      u.Email,
      u.ImageURL,
      e.AllowedMembership AS Type,
      COUNT(*) AS Sessions,
      COALESCE(SUM(TIMESTAMPDIFF(MINUTE, e.StartTime, e.EndTime))/60,0) AS Hours
    FROM exercises e
    INNER JOIN users u ON u.UserID = e.CoachID
    WHERE u.Role = 'Coach'
      AND e.Date BETWEEN ? AND ?
      AND (
        (e.Date < CURDATE()) OR
        (e.Date = CURDATE() AND e.EndTime < CURTIME())
      )
    GROUP BY e.CoachID, e.AllowedMembership
    ORDER BY u.Name
    `,
    [toDateOnly(start), toDateOnly(end)]
  );
  const coachesMap = {};
  for (const row of rows) {
    if (!coachesMap[row.CoachID]) {
      coachesMap[row.CoachID] = {
        UserID: row.CoachID,
        Name: row.Name,
        Email: row.Email,
        ImageURL: row.ImageURL,
        details: {},
        TotalSalary: 0,
        TotalHours: 0,
      };
    }
    const hebType = translateType(row.Type);
    const hours   = Number(row.Hours) || 0;
    const price   = PRICES[hebType] || 0;
    const salary  = hours * price;
    coachesMap[row.CoachID].details[hebType] = {
      Type: hebType,
      Hours: hours,
      Price: price,
      Salary: salary,
      Sessions: Number(row.Sessions || 0),
    };
    coachesMap[row.CoachID].TotalSalary += salary;
    coachesMap[row.CoachID].TotalHours  += hours;
  }
  const coaches = Object.values(coachesMap);
  const [allCoaches] = await db.query(
    `SELECT UserID, Name, Email, ImageURL FROM users WHERE Role='Coach'`
  );
  for (const c of allCoaches) {
    if (!coachesMap[c.UserID]) {
      coaches.push({
        UserID: c.UserID,
        Name: c.Name,
        Email: c.Email,
        ImageURL: c.ImageURL,
        details: {},
        TotalSalary: 0,
        TotalHours: 0,
      });
    }
  }
  const totalSalaries = coaches.reduce((sum, c) => sum + (c.TotalSalary || 0), 0);
  return { coaches, total: Number(totalSalaries.toFixed(2)) };
}
router.get("/", async (req, res) => {
  try {
    const today = new Date();
    const defStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const defEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const start = req.query.start ? parseYMD(req.query.start) : defStart;
    const end   = req.query.end   ? parseYMD(req.query.end)   : defEnd;
    const subscriptionsIncome = await getSubscriptionsIncome(start, end);
    const ordersIncome = await getOrdersIncome(start, end);
    const { coaches, total: coachesSalaries } = await getCoachesSalaries(start, end);
    const totalIncome = Number((subscriptionsIncome + ordersIncome).toFixed(2));
    const adminProfit = Number((totalIncome - coachesSalaries).toFixed(2));
    res.json({
      range: {
        start: toDateOnly(start),
        end: toDateOnly(end),
      },
      totalIncome,
      subscriptionsIncome: Number(subscriptionsIncome.toFixed(2)),
      ordersIncome: Number(ordersIncome.toFixed(2)),
      coachesSalaries: Number(coachesSalaries.toFixed(2)),
      adminProfit,
      coaches,
    });
  } catch (err) {
    console.error("Error fetching finance status:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
