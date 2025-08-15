// routes/schedule.js
const express = require("express");
const router = express.Router();
const db = require("../db");

const CANCEL_LIMIT_HOURS = 4;
const MONTHLY_MAX_MEETINGS = 12;

 function getMaxParticipantsByType(type) {
  if (type === "Single") return 1;
  if (type === "Couple") return 2;
  return 10;  
}

 async function checkTrainerBusy(trainer_id, session_date, start_time, end_time, exerciseId = null) {
  let query = `
    SELECT * FROM exercises
    WHERE CoachID = ? AND Date = ?`;
  const params = [trainer_id, session_date];
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

  for (const ex of exs) {
    const exStartMin = getMinutes(ex.StartTime);
    const exEndMin = ex.EndTime ? getMinutes(ex.EndTime) : exStartMin + 60;

     if (newStartMin < exEndMin && newEndMin > exStartMin) return true;

     if (Math.abs(newStartMin - exEndMin) < 60 || Math.abs(exStartMin - newEndMin) < 60) {
      return true;
    }
  }
  return false;
}

 router.get("/", async (_req, res) => {
  const sql = `
    SELECT 
      e.ExerciseID AS id,
      et.TypeName AS session_type,
      DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name,
      e.AllowedMembership AS allowed_membership,
      e.ExerciseTypeID,
      (
        SELECT COUNT(*) 
        FROM exerciseparticipants ep 
        WHERE ep.ExerciseID = e.ExerciseID
      ) AS participants_count
    FROM exercises e
    JOIN users u ON e.CoachID = u.UserID
    JOIN exercise_types et ON e.ExerciseTypeID = et.ExerciseTypeID
    WHERE u.Role = 'Coach'
    ORDER BY e.Date, e.StartTime
  `;
  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("GET /schedule error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.get("/coach/:coachId", async (req, res) => {
  const coachId = req.params.coachId;
  const sql = `
    SELECT 
      e.ExerciseID AS id,
      et.TypeName AS session_type,
      DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
      TIME(e.StartTime) AS start_time,
      TIME(e.EndTime) AS end_time,
      e.CoachID AS coach_id,
      u.Name AS coach_name,
      e.AllowedMembership AS allowed_membership,
      e.ExerciseTypeID,
      (
        SELECT COUNT(*) 
        FROM exerciseparticipants ep 
        WHERE ep.ExerciseID = e.ExerciseID
      ) AS participants_count
    FROM exercises e
    JOIN users u ON e.CoachID = u.UserID
    JOIN exercise_types et ON e.ExerciseTypeID = et.ExerciseTypeID
    WHERE e.CoachID = ?
    ORDER BY e.Date, e.StartTime
  `;
  try {
    const [rows] = await db.query(sql, [coachId]);
    res.json(rows);
  } catch (err) {
    console.error("GET /schedule/coach/:coachId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.post("/", async (req, res) => {
  const {
    trainer_id,
    exercise_type_id,
    session_date,
    start_time,
    end_time,
    allowed_membership
  } = req.body;

  if (!trainer_id || !exercise_type_id || !session_date || !start_time || !allowed_membership) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const busy = await checkTrainerBusy(trainer_id, session_date, start_time, end_time);
    if (busy) {
      return res.status(400).json({ error: "המאמנת לא פנויה בשעה הזו או אין לה מנוחה של שעה בין אימונים." });
    }

    await db.query(
      `INSERT INTO exercises (ExerciseTypeID, Date, StartTime, EndTime, CoachID, AllowedMembership)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        exercise_type_id,
        session_date,
        start_time,
        end_time || null,
        trainer_id,
        allowed_membership
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("POST /schedule error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});
router.get("/with-status/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const { start, end } = req.query;

  try {
    // آخر نوع عضوية للمتدرّبة
    const [subs] = await db.query(
      "SELECT MembershipType FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1",
      [traineeId]
    );
    if (!subs.length) return res.json([]);

    const membershipType = subs[0].MembershipType;

    // SQL ديناميكي: نضيف شرط التاريخ إذا start/end موجودين
    let sql = `
      SELECT 
        e.ExerciseID AS id,
        et.TypeName AS session_type,
        DATE_FORMAT(e.Date, '%Y-%m-%d') AS session_date,
        TIME(e.StartTime) AS start_time,
        TIME(e.EndTime) AS end_time,
        e.CoachID AS coach_id,
        u.Name AS coach_name,
        e.AllowedMembership AS allowed_membership,          
        e.ExerciseTypeID,
        CASE WHEN ep.TraineeID IS NOT NULL THEN 1 ELSE 0 END AS is_registered,
        (SELECT COUNT(*) FROM exerciseparticipants ep2 WHERE ep2.ExerciseID = e.ExerciseID) AS participants_count
      FROM exercises e
      JOIN users u           ON e.CoachID = u.UserID
      JOIN exercise_types et ON e.ExerciseTypeID = et.ExerciseTypeID
      LEFT JOIN exerciseparticipants ep
        ON ep.ExerciseID = e.ExerciseID AND ep.TraineeID = ?
      WHERE u.Role = 'Coach'
        AND e.AllowedMembership = ?
    `;

    const params = [traineeId, membershipType];

    if (start && end) {
      sql += ` AND e.Date BETWEEN ? AND ?`;
      params.push(start, end);
    }

    sql += ` ORDER BY e.Date, e.StartTime`;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /schedule/with-status/:traineeId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 
router.get("/trainee/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const { start, end } = req.query;

  if (!traineeId || !start || !end) {
    return res.status(400).json({ error: "missing traineeId/start/end" });
  }

  const sql = `
    SELECT 
      e.ExerciseID                        AS id,
      et.TypeName                         AS session_type,
      DATE_FORMAT(e.Date, '%Y-%m-%d')     AS session_date,
      TIME(e.StartTime)                   AS start_time,
      TIME(e.EndTime)                     AS end_time,
      e.CoachID                           AS coach_id,
      u.Name                              AS coach_name,
      e.AllowedMembership                 AS allowed_membership,
      e.ExerciseTypeID
    FROM exerciseparticipants ep
    JOIN exercises e       ON e.ExerciseID = ep.ExerciseID
    JOIN users u           ON e.CoachID     = u.UserID
    JOIN exercise_types et ON e.ExerciseTypeID = et.ExerciseTypeID
    WHERE ep.TraineeID = ?
      AND e.Date BETWEEN ? AND ?
    ORDER BY e.Date, e.StartTime
  `;
  try {
    const [rows] = await db.query(sql, [traineeId, start, end]);
    res.json(rows);
  } catch (err) {
    console.error("GET /schedule/trainee/:traineeId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});
 
router.get("/monthly-count/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  let { month, year } = req.query;

  const now = new Date();
  const y = Number(year) || now.getFullYear();
  const m = Number(month) || (now.getMonth() + 1);  

  const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate(); 
  const monthEnd = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;

  try {
    const [countRes] = await db.query(
      `SELECT COUNT(*) as cnt 
       FROM exerciseparticipants ep
       JOIN exercises e ON ep.ExerciseID = e.ExerciseID
       WHERE ep.TraineeID = ? 
         AND e.Date BETWEEN ? AND ?`,
      [traineeId, monthStart, monthEnd]
    );
    res.json({ count: countRes[0].cnt });
  } catch (err) {
    console.error("GET /schedule/monthly-count/:traineeId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});


router.get("/participants/:exerciseId", async (req, res) => {
  const { exerciseId } = req.params;
  const sql = `
    SELECT u.Name AS name
    FROM exerciseparticipants ep
    JOIN users u ON ep.TraineeID = u.UserID
    WHERE ep.ExerciseID = ?
  `;
  try {
    const [rows] = await db.query(sql, [exerciseId]);
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error("GET /schedule/participants/:exerciseId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});


router.post("/register", async (req, res) => {
  const { exerciseId, traineeId } = req.body;
  if (!exerciseId || !traineeId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;

    const [monthCount] = await db.query(
      `SELECT COUNT(*) as cnt 
       FROM exerciseparticipants ep
       JOIN exercises e ON ep.ExerciseID = e.ExerciseID
       WHERE ep.TraineeID = ? 
         AND e.Date BETWEEN ? AND ?`,
      [traineeId, start, end]
    );
    if (monthCount[0].cnt >= MONTHLY_MAX_MEETINGS) {
      return res.status(400).json({ error: `הגעת למספר המפגשים החודשי המותר (${MONTHLY_MAX_MEETINGS}).` });
    }


    const [rows] = await db.query(
      "SELECT AllowedMembership AS type FROM exercises WHERE ExerciseID = ?",
      [exerciseId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "האימון לא נמצא" });
    }
    const exerciseType = rows[0].type || "Group";
    const maxParticipants = getMaxParticipantsByType(exerciseType);


    const [cnt] = await db.query(
      "SELECT COUNT(*) as cnt FROM exerciseparticipants WHERE ExerciseID = ?",
      [exerciseId]
    );
    if (cnt[0].cnt >= maxParticipants) {
      return res.status(400).json({ error: "ההרשמה לאימון הזה נסגרה, כל המקומות נתפסו." });
    }


    await db.query(
      "INSERT IGNORE INTO exerciseparticipants (ExerciseID, TraineeID) VALUES (?, ?)",
      [exerciseId, traineeId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("POST /schedule/register error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.delete("/unregister/:exerciseId/:traineeId", async (req, res) => {
  const { exerciseId, traineeId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT Date, StartTime FROM exercises WHERE ExerciseID = ?",
      [exerciseId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "לא נמצא אימון" });
    }

    const exerciseDateTime = new Date(`${rows[0].Date}T${rows[0].StartTime}`);
    const now = new Date();
    const hoursDiff = (exerciseDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff < CANCEL_LIMIT_HOURS) {
      return res.status(400).json({ error: `לא ניתן לבטל פחות מ-${CANCEL_LIMIT_HOURS} שעות לפני האימון.` });
    }

    await db.query(
      "DELETE FROM exerciseparticipants WHERE ExerciseID=? AND TraineeID=?",
      [exerciseId, traineeId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /schedule/unregister/:exerciseId/:traineeId error:", err);
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
    console.error("DELETE /schedule/:exerciseId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.put("/:exerciseId", async (req, res) => {
  const { exerciseId } = req.params;
  const {
    trainer_id,
    exercise_type_id,
    session_date,
    start_time,
    end_time,
    allowed_membership
  } = req.body;

  if (!trainer_id || !exercise_type_id || !session_date || !start_time || !allowed_membership) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const busy = await checkTrainerBusy(trainer_id, session_date, start_time, end_time, exerciseId);
    if (busy) {
      return res.status(400).json({ error: "המאמנת לא פנויה בשעה הזו או אין לה מנוחה של שעה בין אימונים." });
    }

    await db.query(
      `UPDATE exercises 
       SET ExerciseTypeID = ?, Date = ?, StartTime = ?, EndTime = ?, CoachID = ?, AllowedMembership = ?
       WHERE ExerciseID = ?`,
      [
        exercise_type_id,
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
    console.error("PUT /schedule/:exerciseId error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

 router.get("/types", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM exercise_types");
    res.json(rows);
  } catch (err) {
    console.error("GET /schedule/types error:", err);
    res.status(500).json({ error: "Database error", fullError: err });
  }
});

module.exports = router;
