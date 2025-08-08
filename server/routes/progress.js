const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT * FROM progress WHERE TraineeID=? ORDER BY Date DESC`, [traineeId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});


router.post("/", async (req, res) => {
  const { TraineeID, Date, Weight, Height, Notes, CoachID } = req.body;
  if (!TraineeID || !Date || !Weight) {
    return res.status(400).json({ error: "חסר שדות חובה" });
  }
  try {
    await db.execute(
      `INSERT INTO progress (TraineeID, Date, Weight, Height, Notes, CoachID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [TraineeID, Date, Weight, Height || null, Notes || null, CoachID || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

module.exports = router;
