const express = require("express");
const router = express.Router();
const db = require("../db");

// קבל את שיעור המס
router.get("/vat", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT Value FROM settings WHERE `Key`='vat_percent'");
    if (rows.length === 0) return res.status(404).json({ error: "לא מוגדרת מע״מ" });
    res.json({ vat: Number(rows[0].Value) });
  } catch (err) {
    res.status(500).json({ error: "שגיאה במסד הנתונים", details: err });
  }
});

// עדכון שיעור המס
router.put("/vat", async (req, res) => {
  const { vat } = req.body;
  if (!vat || isNaN(Number(vat))) return res.status(400).json({ error: "ערך לא תקין" });
  try {
    await db.query("UPDATE settings SET Value=? WHERE `Key`='vat_percent'", [vat]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "שגיאה בעדכון מע״מ", details: err });
  }
});

module.exports = router;
