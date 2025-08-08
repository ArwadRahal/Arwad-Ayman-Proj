// routes/coachStatus.js
const express = require('express');
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const query = `
    SELECT 
      u.UserID,
      u.Name,
      u.Email,
      u.ImageURL,
      COALESCE(SUM(TIMESTAMPDIFF(HOUR, e.StartTime, e.EndTime)), 0) AS HoursWorkedThisMonth,
      COUNT(e.ExerciseID) AS SessionsCount,
      (
        SELECT COUNT(DISTINCT ep.TraineeID)
        FROM exercises ex
        JOIN exerciseparticipants ep ON ex.ExerciseID = ep.ExerciseID
        WHERE ex.CoachID = u.UserID
          AND MONTH(ex.Date) = MONTH(CURDATE())
          AND YEAR(ex.Date) = YEAR(CURDATE())
      ) AS UniqueTraineesCount
    FROM users u
    LEFT JOIN exercises e 
      ON e.CoachID = u.UserID 
      AND MONTH(e.Date) = MONTH(CURDATE()) 
      AND YEAR(e.Date) = YEAR(CURDATE())
    WHERE u.Role = 'Coach'
    GROUP BY u.UserID, u.Name, u.Email, u.ImageURL
    ORDER BY u.Name
  `;
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Error fetching coach status:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
