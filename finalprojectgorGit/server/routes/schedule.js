const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET /schedule
router.get("/", async (req, res) => {
const query = `
  SELECT 
    ExerciseID AS id,
    Type AS session_type,
    Date AS session_date,
    TIME(StartTime) AS start_time,
    TIME(EndTime) AS end_time,
    CoachID AS coach_id
  FROM exercises
`;



  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

// ✅ POST /schedule
router.post("/", async (req, res) => {
  const { trainer_id, session_type, session_date, start_time } = req.body;

  if (!trainer_id || !session_date || !start_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const endTime = calcEndTime(start_time);

  const query = `
    INSERT INTO exercises (Type, Date, StartTime, EndTime, CoachID)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [session_type || "", session_date, start_time, endTime, trainer_id];

  try {
    const [result] = await db.query(query, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("❌ Error inserting:", err);
    res.status(500).json({ error: "Failed to insert exercise", fullError: err });
  }
});

function calcEndTime(startTime) {
  const [hour, minute] = startTime.split(":").map(Number);
  const endHour = (hour + 1) % 24;
  return `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

module.exports = router;