//routes/category.js
const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT CategoryID, CategoryName FROM category');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת הקטגוריות' });
  }
});

 router.post('/', async (req, res) => {
  const { CategoryName } = req.body;
  if (!CategoryName) {
    return res.status(400).json({ error: 'יש להזין שם קטגוריה' });
  }
  try {
    const [result] = await pool.query('INSERT INTO category (CategoryName) VALUES (?)', [CategoryName]);
    res.json({ CategoryID: result.insertId, CategoryName });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בהוספת הקטגוריה' });
  }
});

 router.delete('/:id', async (req, res) => {
  const categoryId = req.params.id;
  try {
    await pool.query('DELETE FROM category WHERE CategoryID = ?', [categoryId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה במחיקת הקטגוריה' });
  }
});

 router.put('/:id', async (req, res) => {
  const categoryId = req.params.id;
  const { CategoryName } = req.body;
  if (!CategoryName) {
    return res.status(400).json({ error: 'יש להזין שם קטגוריה' });
  }
  try {
    await pool.query('UPDATE category SET CategoryName=? WHERE CategoryID=?', [CategoryName, categoryId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
  }
});

module.exports = router;
