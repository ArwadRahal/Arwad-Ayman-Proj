// server/db.js
const mysql = require("mysql2/promise"); // טוען את מודול MySQL עם תמיכה בהבטחות

const pool = mysql.createPool({ // יוצר בריכת חיבורים למסד הנתונים
  host: "localhost",
  user: "root",
  password: "",  
  database: "gymproject",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool; // מייצא את בריכת החיבורים לשימוש בשאר האפליקציה
