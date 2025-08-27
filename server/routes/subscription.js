const express = require('express');
const router = express.Router();
const db = require("../db");

router.get("/active/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.json({ active: false, daysLeft: 0, sub: null, receiptUrl: null });
    }

    const sub = rows[0];
    const end = new Date(sub.EndDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const active = end >= today;
    const daysLeft = active ? (diff > 0 ? diff : 0) : 0;

    const receiptUrl = `${req.protocol}://${req.get('host')}/receipts/subscription/${sub.SubscriptionID}.pdf`;

    res.json({ active, sub, daysLeft, receiptUrl });
  } catch (err) {
    console.error("subscription /active error:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

router.post("/add", async (req, res) => {
  let { userId, type, startDate, endDate, baseAmount, membershipType, cardHolder } = req.body;

  if (!userId || !type || !startDate || !endDate || baseAmount == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!membershipType) membershipType = 'Group'; // تعديل الافتراضي
  if (!cardHolder) cardHolder = 'PayPalSandbox';

  try {
    const [settings] = await db.query(
      "SELECT Value as vat FROM settings WHERE `Key`='vat_percent' LIMIT 1"
    );
    const vat = settings[0]?.vat ? Number(settings[0].vat) : 0;

    const numericBase = Number(baseAmount) || 0;
    const vatAmount = +(numericBase * vat / 100).toFixed(2);
    const totalAmount = +(numericBase + vatAmount).toFixed(2);

    const [ins] = await db.query(
      "INSERT INTO subscription (UserID, Type, StartDate, EndDate, TotalAmount, MembershipType, CardHolder) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, type, startDate, endDate, totalAmount, membershipType, cardHolder]
    );

    const subscriptionId = ins?.insertId;
    const receiptUrl = subscriptionId ? `${req.protocol}://${req.get('host')}/receipts/subscription/${subscriptionId}.pdf` : null;

    res.json({
      success: true,
      subscriptionId,
      receiptUrl,
      baseAmount: +numericBase.toFixed(2),
      vatPercent: vat,
      vatAmount,
      totalAmount
    });
  } catch (err) {
    console.error("DB ERROR in /subscription/add:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
