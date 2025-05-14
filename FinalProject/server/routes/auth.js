// server/routes/auth.js
const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const pool    = require("../db");
const router  = express.Router();

router.post("/signup", async (req, res) => {
  const { full_name, tz_id, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, tz_id, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, tz_id, email, hash, role]
    );
    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name AS name, email, role, isPaid, password_hash
         FROM users WHERE email = ?`,
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: "No such user" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    delete user.password_hash;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// in routes/auth.js
router.post("/signup", async (req, res) => {
  const { full_name, tz_id, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, tz_id, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, tz_id, email, hash, role]
    );
    return res.json({ success: true, userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;
