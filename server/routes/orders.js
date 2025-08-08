const express = require('express');
const router = express.Router();
const db = require('../db');

// ======================= הוספת הזמנה חדשה =======================
router.post('/', async (req, res) => {
  const { userId, cart, total } = req.body;
  if (!userId || !cart || !Array.isArray(cart) || cart.length === 0)
    return res.status(400).json({ error: "נתוני הזמנה חסרים" });

  try {
    // הוספת רשומה לטבלת orders (עכשיו: Pending)
    const [result] = await db.query(
      "INSERT INTO orders (UserID, OrderDate, Status, TotalPrice) VALUES (?, NOW(), 'Pending', ?)",
      [userId, total]
    );
    const orderId = result.insertId;
    // הוספת כל המוצרים לטבלה המשנית
    for (let prod of cart) {
      await db.query(
        "INSERT INTO order_products (OrderID, ProductCode, Quantity) VALUES (?, ?, ?)",
        [orderId, prod.ProductCode, prod.qty]
      );
      // הורדת המלאי
      await db.query(
        "UPDATE products SET Stock = Stock - ? WHERE ProductCode=?",
        [prod.qty, prod.ProductCode]
      );
    }
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: "שגיאת מסד נתונים", details: err });
  }
});

// ======================= קבלת כל ההזמנות למנהלת עם פרטי המשתמש =======================
router.get('/admin', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.OrderID, o.OrderDate, o.Status, o.TotalPrice, u.Name, u.Phone, u.Email
       FROM orders o
       JOIN users u ON o.UserID = u.UserID
       ORDER BY o.OrderDate DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "שגיאה בקבלת ההזמנות", details: err });
  }
});

// ======================= קבלת כל המוצרים בהזמנה מסויימת =======================
router.get('/:orderId/products', async (req, res) => {
  const { orderId } = req.params;
  try {
    const [products] = await db.query(
      `SELECT op.ProductCode, op.Quantity, p.Name, p.ImageURL, p.Price
       FROM order_products op
       JOIN products p ON op.ProductCode = p.ProductCode
       WHERE op.OrderID = ?`,
      [orderId]
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "שגיאה בקבלת מוצרים להזמנה", details: err });
  }
});

// ======================= עדכון סטטוס הזמנה (Pending/Accepted/Completed/Cancelled) =======================
router.put('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Pending', 'Accepted', 'Completed', 'Cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'סטטוס לא חוקי' });
  }

  try {
    await db.query('UPDATE orders SET Status=? WHERE OrderID=?', [status, orderId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "שגיאה בעדכון סטטוס ההזמנה", details: err });
  }
});

// ======================= קבלת כל ההזמנות של משתמש מסויים =======================
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE UserID=? ORDER BY OrderDate DESC`,
      [userId]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "שגיאה בקבלת הזמנות למשתמש", details: err });
  }
});

// ======================= ביטול הזמנה על ידי משתמש (אם עדיין Pending) =======================
router.put('/:orderId/cancel', async (req, res) => {
  const { orderId } = req.params;
  try {
    // בדוק אם הסטטוס עדיין Pending
    const [orders] = await db.query("SELECT Status FROM orders WHERE OrderID=?", [orderId]);
    if (orders.length === 0) return res.status(404).json({ error: "ההזמנה לא נמצאה" });
    if (orders[0].Status !== "Pending") return res.status(400).json({ error: "לא ניתן לבטל הזמנה לאחר הטיפול" });

    // עדכן סטטוס ל-Cancelled
    await db.query("UPDATE orders SET Status='Cancelled' WHERE OrderID=?", [orderId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "שגיאה בביטול ההזמנה", details: err });
  }
});

module.exports = router;
