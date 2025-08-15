// routes/payments.js
const express = require("express");
const router = express.Router();
const db = require("../db");

/** تسجيل دفعة عامة (طلب/اشتراك) */
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

/** كل الدفعات (للاستخدام الإداري) */
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

/** دفعات مستخدم مفصلة مع تفكيك الضريبة */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [settingsRows] = await db.query('SELECT Value FROM settings WHERE `Key`="vat_percent" LIMIT 1');
    const vatPercent = settingsRows[0]?.Value ? Number(settingsRows[0].Value) : 0;

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

/** دفعة الطلب الواحدة (لواجهة المستخدم الحالية عند فتح تفاصيل الطلب) */
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM payments WHERE PaymentFor='Order' AND ReferenceID=? ORDER BY PaymentDate DESC LIMIT 1`,
      [orderId]
    );
    if (!rows.length) return res.status(404).json({ error: "Payment not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

/** آخر دفعة اشتراك + تفاصيل آخر اشتراك للمستخدم */
router.get("/subscription/latest/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [[settings]] = await db.query('SELECT Value FROM settings WHERE `Key`="vat_percent" LIMIT 1');
    const vatPercent = settings?.Value ? Number(settings.Value) : 0;

    const [payRows] = await db.query(
      `SELECT * FROM payments 
       WHERE UserID=? AND PaymentFor='Subscription' AND Status='Completed'
       ORDER BY PaymentDate DESC LIMIT 1`,
      [userId]
    );
    const payment = payRows[0] || null;

    const [subRows] = await db.query(
      `SELECT * FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1`,
      [userId]
    );
    const subscription = subRows[0] || null;

    if (!payment && !subscription) return res.json(null);

    // تفكيك الضريبة من مبلغ الدفع (في حال كان المبلغ شامل ضريبة)
    const totalAmount = payment ? Number(payment.Amount) : Number(subscription?.TotalAmount || 0);
    const vatAmount = +(totalAmount * vatPercent / (100 + vatPercent)).toFixed(2);
    const baseAmount = +(totalAmount - vatAmount).toFixed(2);

    res.json({
      payment,
      subscription,
      breakdown: {
        vatPercent,
        baseAmount,
        vatAmount,
        totalAmount
      }
    });
  } catch (err) {
    console.error("payments/subscription/latest error:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

module.exports = router;
