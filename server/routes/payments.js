// routes/payments.js

const express = require("express");
const router = express.Router();
const db = require("../db"); 

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
