const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// إعداد التخزين للصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// جلب كل المستخدمين (يمكن فلترة حسب الدور)
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// جلب مستخدم حسب id
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

// تحديث بيانات مستخدم (مع/بدون صورة)
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, phone, description, socialLinks } = req.body;
  let fields = [], params = [];

  if (name) { fields.push("Name=?"); params.push(name); }
  if (phone) { fields.push("Phone=?"); params.push(phone); }
  if (description) { fields.push("Description=?"); params.push(description); }
  if (socialLinks !== undefined) { fields.push("SocialLinks=?"); params.push(socialLinks); }
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

// حذف صورة البروفايل للمستخدم
router.put("/:id/remove-image", async (req, res) => {
  const { id } = req.params;
  // جلب اسم الصورة الحالية
  const [[user]] = await db.execute(`SELECT ImageURL FROM users WHERE UserID=?`, [id]);
  if (user && user.ImageURL) {
    const imgPath = path.join(__dirname, "..", "uploads", user.ImageURL);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); // حذف الصورة فعلياً من القرص
    await db.execute(`UPDATE users SET ImageURL=NULL WHERE UserID=?`, [id]);
    return res.json({ success: true });
  }
  res.json({ success: true });
});

module.exports = router;
