const express = require("express");
const router = express.Router();
const db = require("../db");

 router.get("/new-users", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         UserID    AS id,
         Name      AS name,
         Email     AS email,
         Role      AS role,
         CreatedAt AS created_at,
         AdminSeen AS admin_seen,
         ImageURL  AS imageURL
       FROM users
       WHERE Role = 'Trainee' AND AdminSeen = 0
       ORDER BY CreatedAt DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /admin/new-users error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
 router.post("/mark-seen", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await db.query("UPDATE users SET AdminSeen = 1 WHERE UserID = ?", [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /admin/mark-seen error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
 router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [uRows] = await db.query(
      `SELECT 
         UserID   AS id,
         Name     AS name,
         Email    AS email,
         Phone    AS phone,
         ImageURL AS imageURL,
         Role     AS role,
         DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i:%s') AS created_at
       FROM users
       WHERE UserID = ?`,
      [id]
    );
    if (!uRows.length) return res.status(404).json({ error: "user not found" });
    const [subRows] = await db.query(
      `SELECT MembershipType AS membership_type,
              DATE_FORMAT(EndDate, '%Y-%m-%d') AS end_date
       FROM subscription
       WHERE UserID = ?
       ORDER BY EndDate DESC
       LIMIT 1`,
      [id]
    );
    const user = uRows[0];
    const sub  = subRows[0] || null;
    res.json({
      ...user,
      membership: sub ? sub.membership_type : null,
      membership_end: sub ? sub.end_date : null,
    });
  } catch (err) {
    console.error("GET /admin/user/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/manager-public", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         UserID    AS id,
         Name      AS name,
         Email     AS email,
         Phone     AS phone,
         ImageURL  AS imageURL,
         SocialLinks
       FROM users
       WHERE Role = 'Admin'
       ORDER BY CreatedAt DESC
       LIMIT 1`
    );
    if (!rows.length) return res.json(null);
    const row = rows[0];
    let social = null;
    if (row.SocialLinks) {
      try {
        social = typeof row.SocialLinks === "string"
          ? JSON.parse(row.SocialLinks)
          : row.SocialLinks;
      } catch {
        if (typeof row.SocialLinks === "string" && row.SocialLinks.includes("instagram")) {
          social = { instagram: row.SocialLinks };
        }
      }
    }
    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      imageURL: row.imageURL,
      social,
    });
  } catch (err) {
    console.error("GET /admin/manager-public error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
module.exports = router;
