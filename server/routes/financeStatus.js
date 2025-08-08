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
    case "Single":
      return "אישי";
    case "Couple":
      return "זוגי";
    case "Group":
      return "קבוצתי";
    default:
      return "אישי";
  }
}

async function getSubscriptionsIncome() {
  const [rows] = await db.query(
    "SELECT IFNULL(SUM(TotalAmount),0) as total FROM subscription WHERE EndDate >= CURDATE()"
  );
  return parseFloat(rows[0].total) || 0;
}

async function getOrdersIncome() {
  const [rows] = await db.query(
    "SELECT IFNULL(SUM(TotalPrice),0) as total FROM orders WHERE Status = 'Completed'"
  );
  return parseFloat(rows[0].total) || 0;
}

async function getCoachesSalaries() {
  const exercisesQuery = `
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
      AND MONTH(e.Date) = MONTH(CURDATE())
      AND YEAR(e.Date) = YEAR(CURDATE())
      AND (
        (e.Date < CURDATE()) OR
        (e.Date = CURDATE() AND e.EndTime < CURTIME())
      )
    GROUP BY e.CoachID, e.AllowedMembership
    ORDER BY u.Name
  `;

  const [rows] = await db.query(exercisesQuery);

  const coachesMap = {};
  for (let row of rows) {
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
    const hours = Number(row.Hours) || 0;
    const price = PRICES[hebType] || 0;
    const salary = hours * price;
    coachesMap[row.CoachID].details[hebType] = {
      Type: hebType,
      Hours: hours,
      Price: price,
      Salary: salary,
      Sessions: Number(row.Sessions)
    };
    coachesMap[row.CoachID].TotalSalary += salary;
    coachesMap[row.CoachID].TotalHours += hours;
  }

  const coachesArr = Object.values(coachesMap);

  const [allCoaches] = await db.query(`
    SELECT UserID, Name, Email, ImageURL
    FROM users
    WHERE Role = 'Coach'
  `);
  for (let c of allCoaches) {
    if (!coachesMap[c.UserID]) {
      coachesArr.push({
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

  const totalSalaries = coachesArr.reduce((sum, c) => sum + c.TotalSalary, 0);
  return { coaches: coachesArr, total: totalSalaries };
}

router.get("/", async (req, res) => {
  try {
    const subscriptionsIncome = await getSubscriptionsIncome();
    const ordersIncome = await getOrdersIncome();
    const { coaches, total: coachesSalaries } = await getCoachesSalaries();

    const totalIncome = parseFloat(subscriptionsIncome) + parseFloat(ordersIncome);
    const adminProfit = totalIncome - coachesSalaries;

    res.json({
      totalIncome: Number(totalIncome.toFixed(2)),
      subscriptionsIncome: Number(subscriptionsIncome.toFixed(2)),
      ordersIncome: Number(ordersIncome.toFixed(2)),
      coachesSalaries: Number(coachesSalaries.toFixed(2)),
      adminProfit: Number(adminProfit.toFixed(2)),
      coaches
    });
  } catch (err) {
    console.error("Error fetching finance status:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
