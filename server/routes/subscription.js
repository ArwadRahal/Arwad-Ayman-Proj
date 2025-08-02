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
  const { userId, type, startDate, endDate, baseAmount } = req.body;
  if (!userId || !type || !startDate || !endDate || !baseAmount)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // קבל שיעור מס מההגדרות
    const [settings] = await db.query('SELECT vat FROM settings LIMIT 1');
    const vat = settings[0]?.vat || 0;

   // חשב את ערך המס
    const vatAmount = (baseAmount * vat) / 100;
    const totalAmount = Number(baseAmount) + vatAmount;

    // שמור מנוי במחיר סופי
    await db.query(
      "INSERT INTO subscription (UserID, Type, StartDate, EndDate, TotalAmount) VALUES (?, ?, ?, ?, ?)",
      [userId, type, startDate, endDate, totalAmount]
    );

    // החזר את כל הפרטים (אופציונלי)
    res.json({
      success: true,
      baseAmount: Number(baseAmount),
      vatPercent: vat,
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});


module.exports = router;
