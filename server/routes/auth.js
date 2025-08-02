// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = "mySuperSecretKey123";
const loginAttempts = {};
const verificationCodes = {};

// רושם משתמש חדש ומאחסן סיסמה מוצפנת
router.post("/signup", async (req, res) => {
  const { full_name, tz_id, email, password, phone } = req.body;

  if (!full_name || !tz_id || !email || !password) {
    return res.status(400).json({ error: "יש למלא את כל השדות" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (UserID, Name, Phone, Email, Password, Role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tz_id, full_name, phone || null, email, hashedPassword, "Trainee"]
    );

    res.json({ success: true, userId: tz_id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "הדוא״ל או תעודת הזהות כבר רשומים במערכת" });
    }
    res.status(500).json({ error: "שגיאה בשרת: " + err.message });
  }
});

// מאמת פרטי התחברות ומגביל ל-3 ניסיונות כושלים
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "יש למלא את כל השדות" });

  const attempts = loginAttempts[email] || { count: 0, lastAttempt: Date.now() };

  if (attempts.count >= 3) {
    return res.status(403).json({
      error: "נחסמת זמנית לאחר 3 ניסיונות כושלים. אנא אפס סיסמה."
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT UserID AS id, Name AS name, Email AS email, Role, Password AS password_Text, ImageURL, SocialLinks
       FROM users WHERE Email = ?`,
      [email]
    );

    if (!rows.length) {
      loginAttempts[email] = { count: attempts.count + 1, lastAttempt: Date.now() };
      return res.status(401).json({ error: "משתמש לא נמצא" });
    }

    const userData = rows[0];
    const match = await bcrypt.compare(password, userData.password_Text);

    if (!match) {
      loginAttempts[email] = { count: attempts.count + 1, lastAttempt: Date.now() };
      return res.status(401).json({ error: "סיסמה שגויה" });
    }

    // איפוס ספירת ניסיונות לאחר הצלחה
    loginAttempts[email] = { count: 0, lastAttempt: Date.now() };

     const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.Role,
      imageURL: userData.ImageURL || null,
       socialLinks: (userData.Role === "Admin" || userData.Role === "Coach") ? userData.SocialLinks : null
    };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת פנימית" });
  }
});

// משנה סיסמה של משתמש קיים
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword)
    return res.status(400).json({ error: "יש למלא את כל השדות" });

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE Email = ?`,
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      `UPDATE users SET Password = ? WHERE Email = ?`,
      [hashedPassword, email]
    );

    loginAttempts[email] = { count: 0, lastAttempt: Date.now() };

    res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת: " + err.message });
  }
});

// שולח קוד אימות בדוא"ל להתאפסות סיסמה
router.post("/send-code", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ error: "יש להזין כתובת דוא״ל" });

  try {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE Email = ?`, [email]);
    if (!rows.length) {
      return res.status(404).json({ error: "המשתמש לא נמצא במערכת" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = { code, createdAt: Date.now() };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "arwad.rahal1@gmail.com",
        pass: "oqal ssqj krgp bkgk"
      }
    });

    const mailOptions = {
      from: '"מערכת אימונים" <arwad.rahal1@gmail.com>',
      to: email,
      subject: "קוד אימות לאיפוס סיסמה",
      text: `שלום, הקוד שלך לאיפוס הסיסמה הוא: ${code}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "הקוד נשלח למייל" });
  } catch (err) {
    console.error("שגיאה בשליחת מייל:", err);
    res.status(500).json({ error: "שגיאה בשליחת המייל: " + err.message });
  }
});

// מאמת את קוד האימות ותקינותו בתוך 10 דקות
router.post("/verify-code", (req, res) => {
  const { email, code } = req.body;

  const cleanEmail = (email || "").trim();
  const cleanCode = (code || "").trim();

  if (!cleanEmail || !cleanCode) {
    return res.status(400).json({ error: "יש להזין דוא״ל וקוד אימות" });
  }

  const record = verificationCodes[cleanEmail];

  if (!record) {
    return res.status(400).json({ error: "לא נשלח קוד אימות למייל זה" });
  }

  const { code: storedCode, createdAt } = record;
  const now = Date.now();
  const expirationTime = 10 * 60 * 1000;

  if (now - createdAt > expirationTime) {
    delete verificationCodes[cleanEmail];
    return res.status(410).json({ error: "פג תוקף הקוד, נסה לשלוח קוד חדש" });
  }

  if (cleanCode !== storedCode) {
    return res.status(401).json({ error: "קוד לא נכון" });
  }

  delete verificationCodes[cleanEmail];
  res.json({ success: true, message: "הקוד אומת בהצלחה" });
});
// שינוי הסיסמה מהפרופיל (עם אימות הסיסמה הישנה)
router.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword)
    return res.status(400).json({ error: "יש למלא את כל השדות" });

  try {
    // אחזור משתמש
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE UserID = ?`, [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }
    const user = rows[0];

    // בדיקת סיסמה ישנה
    const match = await bcrypt.compare(oldPassword, user.Password);
    if (!match) {
      return res.status(401).json({ error: "הסיסמה הנוכחית שגויה" });
    }

   //קוד חדש ואחסון שלו
    const hashedNew = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      `UPDATE users SET Password = ? WHERE UserID = ?`,
      [hashedNew, userId]
    );

    res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת: " + err.message });
  }
});

module.exports = router;
