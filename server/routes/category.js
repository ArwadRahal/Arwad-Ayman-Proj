const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/**
 * جلب كل الكاتيجوريز + عد المنتجات (غير مؤرشفة فقط)
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.CategoryID, 
        c.CategoryName, 
        c.ImageURL, 
        COUNT(p.ProductCode) AS ProductsCount
      FROM category c
      LEFT JOIN products p ON c.CategoryID = p.CategoryID AND p.IsArchived=0
      GROUP BY c.CategoryID, c.CategoryName, c.ImageURL
      ORDER BY c.CategoryID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בקבלת הקטגוריות' });
  }
});

router.post('/', upload.single('imageFile'), async (req, res) => {
  const { CategoryName } = req.body;
  const ImageURL = req.file ? req.file.filename : null;
  if (!CategoryName) {
    return res.status(400).json({ error: 'יש להזין שם קטגוריה' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO category (CategoryName, ImageURL) VALUES (?, ?)',
      [CategoryName, ImageURL]
    );
    res.json({ CategoryID: result.insertId, CategoryName, ImageURL, ProductsCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהוספת הקטגוריה' });
  }
});

router.delete('/:id', async (req, res) => {
  const categoryId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT ImageURL FROM category WHERE CategoryID = ?', [categoryId]);
    if (rows[0]?.ImageURL) {
      fs.unlink(`uploads/${rows[0].ImageURL}`, () => {});
    }
    await pool.query('DELETE FROM category WHERE CategoryID = ?', [categoryId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת הקטגוריה' });
  }
});

router.put('/:id', upload.single('imageFile'), async (req, res) => {
  const categoryId = req.params.id;
  const { CategoryName } = req.body;
  const ImageURL = req.file ? req.file.filename : null;
  if (!CategoryName) {
    return res.status(400).json({ error: 'יש להזין שם קטגוריה' });
  }

  let sql = 'UPDATE category SET CategoryName = ?';
  const params = [CategoryName];

  if (ImageURL) {
    sql += ', ImageURL = ?';
    params.push(ImageURL);
    const [oldRows] = await pool.query('SELECT ImageURL FROM category WHERE CategoryID = ?', [categoryId]);
    if (oldRows[0]?.ImageURL) {
      fs.unlink(`uploads/${oldRows[0].ImageURL}`, () => {});
    }
  }

  sql += ' WHERE CategoryID = ?';
  params.push(categoryId);

  try {
    await pool.query(sql, params);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
  }
});

module.exports = router;
