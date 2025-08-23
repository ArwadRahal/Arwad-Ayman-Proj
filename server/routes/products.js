const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// הגדרת העלאת תמונות
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// קבלת כל המוצרים (ללא ארכיון)
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
router.post('/', upload.single('imageFile'), async (req, res) => {
  const { Name, CategoryID, Type, Descripetion, Price, Stock } = req.body;
  const imageFile = req.file;
  const stockVal = Number(Stock);

  if (!Name || !CategoryID || !Descripetion || !Price || Stock === undefined || !imageFile) {
    return res.status(400).json({ error: 'כל השדות נדרשים כולל תמונה וקטגוריה' });
  }
  if (
    isNaN(stockVal) || stockVal < 0 ||
    !Number.isInteger(stockVal)
  ) {
    return res.status(400).json({ error: 'כמות במלאי חייבת להיות מספר שלם אי שלילי בלבד' });
  }
  if (!Price || isNaN(Number(Price)) || Number(Price) <= 0) {
    return res.status(400).json({ error: 'המחיר חייב להיות מספר חיובי' });
  }

  const imageURL = imageFile.filename;
  try {
    await pool.query(
      'INSERT INTO products (Name, CategoryID, Type, Descripetion, Price, ImageURL, Stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Name, CategoryID, Type, Descripetion, Price, imageURL, stockVal]
    );
    const [newProduct] = await pool.query('SELECT * FROM products ORDER BY ProductCode DESC LIMIT 1');
    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהוספת המוצר' });
  }
});

// מחיקת מוצר (מוחק סופית)
router.delete('/:id', async (req, res) => {
  const productCode = req.params.id;
  try {
    await pool.query('DELETE FROM products WHERE ProductCode = ?', [productCode]);
    res.json({ success: true, message: 'המוצר נמחק בהצלחה' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת המוצר' });
  }
});

// עדכון מוצר
router.put('/:id', upload.single('imageFile'), async (req, res) => {
  const productCode = req.params.id;
  const { Name, CategoryID, Type, Descripetion, Price, Stock } = req.body;
  const stockVal = Number(Stock);

  if (
    isNaN(stockVal) || stockVal < 0 ||
    !Number.isInteger(stockVal)
  ) {
    return res.status(400).json({ error: 'כמות במלאי חייבת להיות מספר שלם אי שלילי בלבד' });
  }
  if (!Price || isNaN(Number(Price)) || Number(Price) <= 0) {
    return res.status(400).json({ error: 'המחיר חייב להיות מספר חיובי' });
  }

  let updateQuery = 'UPDATE products SET Name=?, CategoryID=?, Type=?, Descripetion=?, Price=?, Stock=?';
  const params = [Name, CategoryID, Type, Descripetion, Price, stockVal];
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
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון המוצר' });
  }
});

// מוצרים עם מלאי נמוך (כמות <= 5)
router.get('/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE Stock <= 5 ORDER BY Stock ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בקבלת מלאי נמוך' });
  }
});

module.exports = router;
