// routes/payments.js

const express = require("express");
const router = express.Router();
const db = require("../db");

 router.post("/", async (req, res) => {
  const { userId, amount, paymentFor, referenceId, status } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: "Missing fields" });
  try {
    await db.query(
      `INSERT INTO payments (UserID, Amount, PaymentFor, ReferenceID, Status, PaymentDate) VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, amount, paymentFor || "Order", referenceId || null, status || "Completed"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Payment DB Error:", err);
    res.status(500).json({ error: "DB error", details: err });
  }
});

 router.get("/", async (req, res) => {
  const query = `
    SELECT 
      p.PaymentID,
      u.Name AS UserName,
      u.Email,
      p.PaymentDate,
      p.Amount,
      p.TransactionID,
      p.PaymentFor,
      p.Status
    FROM payments p
    JOIN users u ON p.UserID = u.UserID
    ORDER BY p.PaymentDate DESC
  `;
  try {
    const [results] = await db.query(query);  
    res.json(results);
  } catch (err) {
    console.error("Error fetching payments:", err); 
    res.status(500).json({ error: "Database error", details: err });
  }
});

 router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
     const [settingsRows] = await db.query('SELECT value FROM settings WHERE `key`="vat_percent" LIMIT 1');
    const vatPercent = settingsRows[0]?.value ? Number(settingsRows[0].value) : 0;

     const [payments] = await db.query(
      `SELECT * FROM payments WHERE UserID=? ORDER BY PaymentDate DESC`,
      [userId]
    );

     const detailed = payments.map(pay => {
      const vatAmount = +(pay.Amount * vatPercent / (100 + vatPercent)).toFixed(2);
      const baseAmount = +(pay.Amount - vatAmount).toFixed(2);
      return {
        ...pay,
        baseAmount,
        vatPercent,
        vatAmount,
        totalAmount: +pay.Amount,
      };
    });
    res.json(detailed);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
