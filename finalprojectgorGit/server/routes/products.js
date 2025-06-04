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
    console.error(err);
    res.status(500).json({ error: 'שגיאה בקבלת המוצרים' });
  }
});

// הוספת מוצר חדש
router.post('/', upload.single('imageFile'), async (req, res) => {
  const { ProductCode, Name, Type, Descripetion, Price, Stock } = req.body;
  const imageFile = req.file;

  if (!ProductCode || !Name || !Type || !Descripetion || !Price || !Stock || !imageFile) {
    return res.status(400).json({ error: 'כל השדות נדרשים כולל תמונה' });
  }

  const imageURL = `${imageFile.filename}`;

  try {
    await pool.query(
      'INSERT INTO products (ProductCode, Name, Type, Descripetion, Price, ImageURL, Stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ProductCode, Name, Type, Descripetion, Price, imageURL, Stock]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE ProductCode = ?', [ProductCode]);
    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error(err);
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

    const imageName = rows[0].ImageURL;
    const imagePath = path.join(__dirname, '..', 'uploads', imageName);

     fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('שגיאה במחיקת התמונה:', err);
         
      }
    });

     await pool.query('DELETE FROM products WHERE ProductCode = ?', [productCode]);

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקת המוצר' });
  }
});


module.exports = router;
