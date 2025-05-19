const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const router = express.Router();

const JWT_SECRET = "mySuperSecretKey123";
router.post("/signup", async (req, res) => {
  const { full_name, tz_id, email, password, phone } = req.body;

  if (!full_name || !tz_id || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (UserID, Name, Phone, Email, Password, Role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tz_id, full_name, phone || null, email, hashedPassword, "Trainee"]
    );
    return res.json({ success: true, userId: tz_id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email or UserID already registered" });
    }
    return res.status(500).json({ error: err.message });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("ksdd");
  try {
    const [rows] = await pool.execute(
      `SELECT UserID AS id, Name AS name, Email AS email, Role, Password AS password_Text
       FROM users WHERE Email = ?`,
      [email]
    );
    console.log("hh");
    if (!rows.length) {
      return res.status(401).json({ error: "No such user" });
    }

    const user = rows[0];
    console.log(rows[0]);

  console.log("pass from input", password);
console.log("pass from data", user.password_hash);

const match = await bcrypt.compare(password, user.password_text);

    if (!match) {
      return res.status(401).json({ error: "Wrong password" });
    }
    console.log("dfddagg");

    delete user.password_text;

    const token = jwt.sign({ id: user.id, role: user.Role }, JWT_SECRET);

    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





module.exports = router;
