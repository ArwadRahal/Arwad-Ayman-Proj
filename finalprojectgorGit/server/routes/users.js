// server/routes/users.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET http://localhost:8801/users?role=coach
router.get("/", async (req, res) => {
  const role = req.query.role;

  try {
    let query = "SELECT UserID as id, Name as name FROM users";
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




module.exports = router;
