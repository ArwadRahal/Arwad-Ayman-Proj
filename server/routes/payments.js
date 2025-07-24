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

 // מחזיר את רשימת כל התשלומים עם פרטי המשתמש ומצב התשלום, ממוינים לפי תאריך יורד
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

module.exports = router;
