const express = require('express');
const router = express.Router();
const db = require('../db');

// הוספת הזמנה חדשה
router.post('/', async (req, res) => {
  const { userId, cart, total } = req.body;
  if (!userId || !cart || !Array.isArray(cart) || cart.length === 0)
    return res.status(400).json({ error: "נתוני הזמנה חסרים" });

  try {
    // הוספת רשומה לטבלת orders
    const [result] = await db.query(
      "INSERT INTO orders (UserID, OrderDate, Status, TotalPrice) VALUES (?, NOW(), 'Completed', ?)",
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

module.exports = router;
