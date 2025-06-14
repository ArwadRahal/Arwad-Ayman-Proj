const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

 router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת המוצרים' });
  }
});

 router.post('/', upload.single('imageFile'), async (req, res) => {
  const { Name, CategoryID, Descripetion, Price, Stock } = req.body;
  const imageFile = req.file;

  if (!Name || !CategoryID || !Descripetion || !Price || !Stock || !imageFile) {
    return res.status(400).json({ error: 'كل השדות נדרשים כולל תמונה וקטגוריה' });
  }

  const imageURL = imageFile.filename;

  try {
    await pool.query(
      'INSERT INTO products (Name, CategoryID, Descripetion, Price, ImageURL, Stock) VALUES (?, ?, ?, ?, ?, ?)',
      [Name, CategoryID, Descripetion, Price, imageURL, Stock]
    );
    const [newProduct] = await pool.query('SELECT * FROM products ORDER BY ProductCode DESC LIMIT 1');
    res.status(201).json(newProduct[0]);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בהוספת המוצר' });
  }
});


router.delete('/:id', async (req, res) => {
  const productCode = req.params.id;
  try {
    const [rows] = await pool.query('SELECT ImageURL FROM products WHERE ProductCode = ?', [productCode]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'המוצר לא נמצא' });
    }
    const imagePath = `uploads/${rows[0].ImageURL}`;
    await pool.query('DELETE FROM products WHERE ProductCode = ?', [productCode]);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.warn('לא ניתן היה למחוק את התמונה:', err.message);
      }
    });
    res.json({ success: true, message: 'המוצר נמחק בהצלחה' });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה במחיקת המוצר' });
  }
});


router.put('/:id', upload.single('imageFile'), async (req, res) => {
  const productCode = req.params.id;
  const { Name, CategoryID, Descripetion, Price, Stock } = req.body;
  let updateQuery = 'UPDATE products SET Name=?, CategoryID=?, Descripetion=?, Price=?, Stock=?';
  const params = [Name, CategoryID, Descripetion, Price, Stock];

  if (req.file) {
    updateQuery += ', ImageURL=?';
    params.push(req.file.filename);
  }
  updateQuery += ' WHERE ProductCode=?';
  params.push(productCode);

  try {
    await pool.query(updateQuery, params);
    res.json({ success: true, message: 'המוצר עודכן בהצלחה' });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בעדכון המוצר' });
  }
});

module.exports = router;
