 const express = require("express");
const router = express.Router();
const db = require("../db");

 router.get("/", async (req, res) => {
  const query = `
    SELECT 
      e.ExerciseID AS id,
      e.Type AS session_type,
      e.Date AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name
    FROM exercises e
    JOIN users u ON e.CoachID = u.UserID
    WHERE u.Role = 'Coach'
  `;
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

// جلب كل التمارين مع حالة التسجيل لكل متدرّبة
router.get("/with-status/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const query = `
    SELECT 
      e.ExerciseID AS id,
      e.Type AS session_type,
      e.Date AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name,
      CASE 
        WHEN ep.TraineeID IS NOT NULL THEN 1 ELSE 0
      END AS is_registered
    FROM exercises e
    JOIN users u ON e.CoachID = u.UserID
    LEFT JOIN exerciseparticipants ep 
      ON e.ExerciseID = ep.ExerciseID AND ep.TraineeID = ?
    WHERE u.Role = 'Coach'
  `;
  try {
    const [results] = await db.query(query, [traineeId]);
    res.json(results);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

// جلب جميع التمارين التي اشتركت فيها متدرّبة معينة (لاحظ endpoint الصحيح!)
router.get("/trainee/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const query = `
    SELECT 
      e.ExerciseID AS id,
      e.Type AS session_type,
      e.Date AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name
    FROM exercises e
    JOIN users u ON e.CoachID = u.UserID
    JOIN exerciseparticipants ep ON e.ExerciseID = ep.ExerciseID
    WHERE ep.TraineeID = ?
  `;
  try {
    const [results] = await db.query(query, [traineeId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

// جلب أسماء المتدرّبات المسجلات في تمرين معيّن
router.get("/participants/:exerciseId", async (req, res) => {
  const { exerciseId } = req.params;
  const query = `
    SELECT u.Name AS name
    FROM exerciseparticipants ep
    JOIN users u ON ep.TraineeID = u.UserID
    WHERE ep.ExerciseID = ?
  `;
  try {
    const [results] = await db.query(query, [exerciseId]);
    res.json(results.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

// تسجيل متدرّبة في تمرين معيّن
router.post("/register", async (req, res) => {
  const { exerciseId, traineeId } = req.body;
  if (!exerciseId || !traineeId) return res.status(400).json({ error: "Missing fields" });
  try {
    await db.query(
      "INSERT IGNORE INTO exerciseparticipants (ExerciseID, TraineeID) VALUES (?, ?)",
      [exerciseId, traineeId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

// حذف تمرين (مع حذف كل المشاركات المتعلقة به)
router.delete("/:exerciseId", async (req, res) => {
  const { exerciseId } = req.params;
  try {
    await db.query("DELETE FROM exerciseparticipants WHERE ExerciseID = ?", [exerciseId]);
    await db.query("DELETE FROM exercises WHERE ExerciseID = ?", [exerciseId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

module.exports = router;
