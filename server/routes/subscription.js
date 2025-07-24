// routes/subscription.js
const express = require('express');
const router = express.Router();
const db = require("../db");

 // GET /subscription/active/:userId
router.get("/active/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1`,
      [userId]
    );
    if (!rows.length) return res.json({ active: false });
    const end = new Date(rows[0].EndDate);
    const today = new Date();
    if (end >= today) {
      res.json({ active: true, sub: rows[0] });
    } else {
      res.json({ active: false, sub: rows[0] });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

 // POST /subscription/add
router.post("/add", async (req, res) => {
  const { userId, type, startDate, endDate, totalAmount } = req.body;
  if (!userId || !type || !startDate || !endDate || !totalAmount)
    return res.status(400).json({ error: "Missing required fields" });
  try {
    await db.query(
      "INSERT INTO subscription (UserID, Type, StartDate, EndDate, TotalAmount) VALUES (?, ?, ?, ?, ?)",
      [userId, type, startDate, endDate, totalAmount]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
