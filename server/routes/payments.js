const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * احضر نسبة الضريبة من جدول settings
 */
async function getVatPercent() {
  try {
    const [rows] = await db.query(
      'SELECT Value FROM settings WHERE `Key`="vat_percent" LIMIT 1'
    );
    const v = rows?.[0]?.Value ? Number(rows[0].Value) : 0;
    return isNaN(v) ? 0 : v;
  } catch {
    return 0;
  }
}

/**
 * أضف الضريبة لمبلغ أساس (قبل الضريبة)
 */
function addVat(baseAmount, vatPercent) {
  const base = Number(baseAmount) || 0;
  const vat = Number(vatPercent) || 0;
  return +(base * (1 + vat / 100)).toFixed(2);
}

/**
 * إنشاء دفعة
 * ملاحظة: إذا PaymentFor='Subscription' نعتبر amount القادم هو "أساس قبل الضريبة"
 * ونحسب النهائي داخل السيرفر (حماية من التلاعب من الواجهة).
 */
router.post("/", async (req, res) => {
  const { userId, amount, paymentFor, referenceId, status, transactionId } = req.body;
  if (!userId || amount == null) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    let finalAmount = Number(amount);
    const kind = (paymentFor || "Order");

    if (kind === "Subscription") {
      const vat = await getVatPercent();
      finalAmount = addVat(finalAmount, vat); // الأساس + الضريبة
    }

    await db.query(
      `INSERT INTO payments 
       (UserID, Amount, PaymentFor, ReferenceID, Status, PaymentDate, TransactionID) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [userId, finalAmount, kind, referenceId || null, status || "Completed", transactionId || null]
    );
    res.json({ success: true, amount: finalAmount });
  } catch (err) {
    console.error("Payment DB Error:", err);
    res.status(500).json({ error: "DB error", details: err });
  }
});

/**
 * كل الدفعات
 */
router.get("/", async (_req, res) => {
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

/**
 * دفعات مستخدم مع تفصيل (أساس/ضريبة/إجمالي)
 * نفترض أنّ المبالغ المخزّنة في الجدول شاملة الضريبة،
 * لذلك نستخرج الأساس عكسيًا حسب نسبة الضريبة الحالية.
 */
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
      const total = Number(pay.Amount) || 0;
      const baseAmount = +(total / (1 + (vatPercent / 100))).toFixed(2);
      const vatAmount = +(total - baseAmount).toFixed(2);
      return {
        ...pay,
        baseAmount,
        vatPercent,
        vatAmount,
        totalAmount: total,
      };
    });
    res.json(detailed);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

/**
 * دفعة طلب معيّن
 */
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

/**
 * آخر دفعة اشتراك + تفصيل
 */
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

    // إذا في دفعة استخدمها كمصدر إجمالي، وإلا خذ من الاشتراك
    const totalAmount = payment ? Number(payment.Amount) : Number(subscription?.TotalAmount || 0);
    const baseAmount = +(totalAmount / (1 + (vatPercent / 100))).toFixed(2);
    const vatAmount = +(totalAmount - baseAmount).toFixed(2);

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
