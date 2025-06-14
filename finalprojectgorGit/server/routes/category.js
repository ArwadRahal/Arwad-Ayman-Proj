const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT CategoryID, CategoryName, ImageURL FROM category');
    res.json(rows);
  } catch (err) {
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
    res.json({ CategoryID: result.insertId, CategoryName, ImageURL });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בהוספת הקטגוריה' });
  }
});


router.delete('/:id', async (req, res) => {
  const categoryId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT ImageURL FROM category WHERE CategoryID = ?', [categoryId]);
    if (rows[0]?.ImageURL) {
      const imagePath = `uploads/${rows[0].ImageURL}`;
      fs.unlink(imagePath, () => {});
    }
    await pool.query('DELETE FROM category WHERE CategoryID = ?', [categoryId]);
    res.json({ success: true });
  } catch (err) {
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

  let updateSql = 'UPDATE category SET CategoryName=?';
  let params = [CategoryName];
  if (ImageURL) {
    updateSql += ', ImageURL=?';
    params.push(ImageURL);

    const [oldRows] = await pool.query('SELECT ImageURL FROM category WHERE CategoryID = ?', [categoryId]);
    if (oldRows[0]?.ImageURL) {
      const oldImagePath = `uploads/${oldRows[0].ImageURL}`;
      fs.unlink(oldImagePath, () => {});
    }
  }
  updateSql += ' WHERE CategoryID=?';
  params.push(categoryId);

  try {
    await pool.query(updateSql, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
  }
});

module.exports = router;
