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
  const { userId, type, startDate, endDate, baseAmount, membershipType, cardHolder } = req.body;
  if (!userId || !type || !startDate || !endDate || !baseAmount || !membershipType || !cardHolder)
    return res.status(400).json({ error: "Missing required fields" });

  try {
     const [settings] = await db.query("SELECT Value as vat FROM settings WHERE `Key`='vat_percent' LIMIT 1");
    const vat = settings[0]?.vat ? Number(settings[0].vat) : 0;

     const vatAmount = (baseAmount * vat) / 100;
    const totalAmount = Number(baseAmount) + vatAmount;

    await db.query(
      "INSERT INTO subscription (UserID, Type, StartDate, EndDate, TotalAmount, MembershipType, CardHolder) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, type, startDate, endDate, totalAmount, membershipType, cardHolder]
    );

    res.json({
      success: true,
      baseAmount: Number(baseAmount),
      vatPercent: vat,
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    });
  } catch (err) {
    console.error("DB ERROR in /subscription/add:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

// GET /subscription/active/:userId  
router.get("/active/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1`,
      [userId]
    );
    if (!rows.length) return res.json({ active: false, daysLeft: 0 });

    const end = new Date(rows[0].EndDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24)); // عدد الأيام المتبقية

    if (end >= today) {
      res.json({
        active: true,
        sub: rows[0],
        daysLeft: diff > 0 ? diff : 0 // إذا انتهى اليوم = 0
      });
    } else {
      res.json({
        active: false,
        sub: rows[0],
        daysLeft: 0
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
