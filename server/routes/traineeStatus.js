// routes/traineeStatus.js
const express = require('express');
const router = express.Router();
const db = require("../db");

// מחזיר לכל מתאמנת את פרטי המנוי, הסטטוס והתמונה
router.get("/", async (req, res) => {
  const query = `
    SELECT 
      u.UserID,
      u.Name,
      u.Email,
      u.Phone,
      u.ImageURL,           
      s.Type AS SubscriptionType,
      s.StartDate,
      s.EndDate
    FROM users u
    LEFT JOIN (
      SELECT s1.*
      FROM subscription s1
      INNER JOIN (
        SELECT UserID, MAX(EndDate) AS MaxEndDate
        FROM subscription
        GROUP BY UserID
      ) s2 ON s1.UserID = s2.UserID AND s1.EndDate = s2.MaxEndDate
    ) s ON u.UserID = s.UserID
    WHERE u.Role = 'Trainee'
    ORDER BY u.Name
  `;

  try {
    const [results] = await db.query(query);

    const today = new Date();
    const formatted = results.map(user => {
      let status = "NotPaid";
      if (user.EndDate) {
        const end = new Date(user.EndDate);
        if (end >= today) {
          const diff = (end - today) / (1000 * 3600 * 24);
          status = diff < 7 ? "ExpiringSoon" : "Active";
        } else {
          status = "Expired";
        }
      }
      return { ...user, status };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching trainee status:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
