const express = require("express");
const router = express.Router();
const db = require("../db");

const MAX_PARTICIPANTS = 10;
const CANCEL_LIMIT_HOURS = 4;  

async function checkTrainerBusy(trainer_id, session_date, start_time, end_time, exerciseId = null) {
  let query = `
    SELECT * FROM exercises
    WHERE CoachID = ? AND Date = ?`;
  let params = [trainer_id, session_date];
  if (exerciseId) {
    query += " AND ExerciseID != ?";
    params.push(exerciseId);
  }
  const [exs] = await db.query(query, params);
  if (!exs.length) return false;

  const getMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const newStartMin = getMinutes(start_time);
  const newEndMin = end_time ? getMinutes(end_time) : newStartMin + 60;
  for (let ex of exs) {
    const exStartMin = getMinutes(ex.StartTime);
    const exEndMin = ex.EndTime ? getMinutes(ex.EndTime) : exStartMin + 60;
    if ((newStartMin < exEndMin && newEndMin > exStartMin)) return true;
    if (Math.abs(newStartMin - exEndMin) < 60 || Math.abs(exStartMin - newEndMin) < 60) {
      return true;
    }
  }
  return false;
}

 router.get("/", async (req, res) => {
  const query = `
    SELECT 
      e.ExerciseID AS id,
      e.Type AS session_type,
      DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name,
      e.AllowedMembership AS allowed_membership        
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

 router.get("/coach/:coachId", async (req, res) => {
  const coachId = req.params.coachId;
  const query = `
    SELECT 
      e.ExerciseID AS id,
      e.Type AS session_type,
      DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name,
      e.AllowedMembership AS allowed_membership       
    FROM exercises e
    JOIN users u ON e.CoachID = u.UserID
    WHERE e.CoachID = ?
    ORDER BY e.Date, e.StartTime
  `;
  try {
    const [results] = await db.query(query, [coachId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.post("/", async (req, res) => {
  const {
    trainer_id,
    session_type,
    session_date,
    start_time,
    end_time,
    allowed_membership      
  } = req.body;

  if (!trainer_id || !session_type || !session_date || !start_time || !allowed_membership) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (await checkTrainerBusy(trainer_id, session_date, start_time, end_time)) {
    return res.status(400).json({ error: "המאמנת לא פנויה בשעה הזו או אין לה מנוחה של שעה בין אימונים." });
  }
  try {
    await db.query(
      `INSERT INTO exercises (Type, Date, StartTime, EndTime, CoachID, AllowedMembership)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        session_type,
        session_date,
        start_time,
        end_time || null,
        trainer_id,
        allowed_membership
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding exercise:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.get("/with-status/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  try {
    const [subs] = await db.query(
      "SELECT MembershipType FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1",
      [traineeId]
    );
    if (!subs.length) {
      return res.json([]);
    }
    const membershipType = subs[0].MembershipType;

    const query = `
      SELECT 
        e.ExerciseID AS id,
        e.Type AS session_type,
        DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
        TIME(e.StartTime) AS start_time,
        TIME(e.EndTime) AS end_time,
        e.CoachID AS coach_id,
        u.Name AS coach_name,
        e.AllowedMembership AS allowed_membership,          
        CASE 
          WHEN ep.TraineeID IS NOT NULL THEN 1 ELSE 0
        END AS is_registered,
        (SELECT COUNT(*) FROM exerciseparticipants ep2 WHERE ep2.ExerciseID = e.ExerciseID) AS participants_count
      FROM exercises e
      JOIN users u ON e.CoachID = u.UserID
      LEFT JOIN exerciseparticipants ep 
        ON e.ExerciseID = ep.ExerciseID AND ep.TraineeID = ?
      WHERE u.Role = 'Coach'
        AND (e.AllowedMembership = ?)
        AND (
          e.Date > CURDATE()
          OR (e.Date = CURDATE() AND TIME(e.StartTime) > CURTIME())
          OR (e.Date < CURDATE() AND ep.TraineeID IS NOT NULL)
        )
      ORDER BY e.Date, e.StartTime
    `;
    const [results] = await db.query(query, [traineeId, membershipType]);
    res.json(results);

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.get("/trainee/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const query = `
    SELECT 
      e.ExerciseID AS id,
      e.Type AS session_type,
      DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name,
      e.AllowedMembership AS allowed_membership
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

router.post("/register", async (req, res) => {
  const { exerciseId, traineeId } = req.body;
  if (!exerciseId || !traineeId) return res.status(400).json({ error: "Missing fields" });

  const [cnt] = await db.query(
    "SELECT COUNT(*) as cnt FROM exerciseparticipants WHERE ExerciseID = ?", [exerciseId]
  );
  if (cnt[0].cnt >= MAX_PARTICIPANTS) {
    return res.status(400).json({ error: "ההרשמה לאימון הזה נסגרה, כל המקומות נתפסו." });
  }

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

router.delete("/unregister/:exerciseId/:traineeId", async (req, res) => {
  const { exerciseId, traineeId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT Date, StartTime FROM exercises WHERE ExerciseID = ?", [exerciseId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "לא נמצא אימון" });
    }
    const exerciseDateTime = new Date(`${rows[0].Date}T${rows[0].StartTime}`);
    const now = new Date();
    const hoursDiff = (exerciseDateTime - now) / 1000 / 60 / 60;
    if (hoursDiff < CANCEL_LIMIT_HOURS) {
      return res.status(400).json({ error: `לא ניתן לבטל פחות מ-${CANCEL_LIMIT_HOURS} שעות לפני האימון.` });
    }
    await db.query(
      "DELETE FROM exerciseparticipants WHERE ExerciseID=? AND TraineeID=?",
      [exerciseId, traineeId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

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

router.put("/:exerciseId", async (req, res) => {
  const { exerciseId } = req.params;
  const {
    trainer_id,
    session_type,
    session_date,
    start_time,
    end_time,
    allowed_membership     
  } = req.body;

  if (!trainer_id || !session_type || !session_date || !start_time || !allowed_membership) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (await checkTrainerBusy(trainer_id, session_date, start_time, end_time, exerciseId)) {
    return res.status(400).json({ error: "המאמנת לא פנויה בשעה הזו או אין לה מנוחה של שעה בין אימונים." });
  }
  try {
    await db.query(
      `UPDATE exercises 
       SET Type = ?, Date = ?, StartTime = ?, EndTime = ?, CoachID = ?, AllowedMembership = ?
       WHERE ExerciseID = ?`,
      [
        session_type,
        session_date,
        start_time,
        end_time || null,
        trainer_id,
        allowed_membership,    
        exerciseId
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating exercise:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

module.exports = router;
