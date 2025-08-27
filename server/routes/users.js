const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

// הגדרת העלאת תמונות
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// קבלת רשימת משתמשים (אופציונלי לפי תפקיד)
router.get("/", async (req, res) => {
  const role = req.query.role;
  try {
    let query = `SELECT UserID as id, Name as name, Phone, Email, Role, ImageURL, Description, SocialLinks FROM users`;
    const params = [];
    if (role) {
      query += " WHERE Role = ?";
      params.push(role);
    }
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("שגיאה בקבלת משתמשים:", err);
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// קבלת משתמש לפי מזהה
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT UserID as id, Name as name, Phone, Email, Role, ImageURL, Description, SocialLinks
       FROM users WHERE UserID = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "לא נמצא משתמש" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// עדכון משתמש (SocialLinks רק ל־Admin/Coach)
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, phone, description, socialLinks, role } = req.body;
  let fields = [], params = [];

  if (name) { fields.push("Name=?"); params.push(name); }
  if (phone) { fields.push("Phone=?"); params.push(phone); }
  if (description) { fields.push("Description=?"); params.push(description); }
  // SocialLinks רק לאדמין או מאמן
  if (socialLinks !== undefined && (role === "Admin" || role === "Coach")) {
    fields.push("SocialLinks=?"); params.push(socialLinks);
  }
  if (req.file) { fields.push("ImageURL=?"); params.push(req.file.filename); }
  if (!fields.length) return res.status(400).json({ error: "אין נתונים לעדכון" });

  params.push(id);
  try {
    await db.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE UserID=?`,
      params
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// מחיקת תמונת פרופיל למשתמש
router.put("/:id/remove-image", async (req, res) => {
  const { id } = req.params;
  // קבלת שם התמונה הנוכחית
  const [[user]] = await db.execute(`SELECT ImageURL FROM users WHERE UserID=?`, [id]);
  if (user && user.ImageURL) {
    const imgPath = path.join(__dirname, "..", "uploads", user.ImageURL);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); // מוחק את הקובץ מהדיסק
    await db.execute(`UPDATE users SET ImageURL=NULL WHERE UserID=?`, [id]);
    return res.json({ success: true });
  }
  res.json({ success: true });
});

// הוספת מאמנת חדשה (למנהלת בלבד)
router.post("/add-coach", upload.single("image"), async (req, res) => {
  const { full_name, tz_id, email, phone, password } = req.body;
  if (!full_name || !tz_id || !email || !password)
    return res.status(400).json({ error: "יש למלא את כל השדות החובה" });

  try {
    // בדיקה אם המאמנת כבר קיימת
    const [exists] = await db.execute(`SELECT * FROM users WHERE Email=? OR UserID=?`, [email, tz_id]);
    if (exists.length) return res.status(409).json({ error: "המאמנת כבר קיימת" });

    const hashedPassword = await bcrypt.hash(password, 10);
    let imageFile = req.file ? req.file.filename : null;
    await db.execute(
      `INSERT INTO users (UserID, Name, Phone, Email, Password, Role, ImageURL)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tz_id, full_name, phone || null, email, hashedPassword, "Coach", imageFile]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "שגיאה בשרת: " + err.message });
  }
});

module.exports = router;
