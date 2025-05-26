const express = require('express');
const router = express.Router();
const pool = require('../db');

// קבלת כל המוצרים
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בקבלת המוצרים' });
  }
});

// הוספת מוצר חדש
router.post('/', async (req, res) => {
  const { ProductCode, Name, Type, Description, Price, ImageURL, Stock } = req.body;
  if (!ProductCode || !Name || !Type || !Description || !Price || !ImageURL || !Stock) {
    return res.status(400).json({ error: 'כל השדות נדרשים' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (ProductCode, Name, Type, Description, Price, ImageURL, Stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ProductCode, Name, Type, Description, Price, ImageURL, Stock]
    );
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהוספת המוצר' });
  }
});

// מחיקת מוצר לפי ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת המוצר' });
  }
});

module.exports = router;
