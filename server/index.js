// server/index.js
const express = require("express"); // טוען את Express
const cors = require("cors"); // טוען את CORS לאפשר קריאות בין דומיינים
const path = require("path"); // טוען מודול לטיפול בנתיבים

const app = express(); // יוצר מופע של אפליקציית Express

app.use(cors()); // מפעיל CORS לכל הבקשות
app.use(express.json()); // מאפשר קריאת JSON בגוף הבקשות
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // מגדיר תיקיית סטטית לשרת קבצים מתיקיית uploads

const authRouter = require("./routes/auth"); // מייבא ראוטר לאותנטיקציה
const usersRouter = require("./routes/users"); // מייבא ראוטר למשתמשים
const scheduleRouter = require("./routes/schedule"); // מייבא ראוטר ללוח אימונים
const productsRouter = require("./routes/products"); // מייבא ראוטר למוצרים
const paymentsRouter = require("./routes/payments"); // מייבא ראוטר לתשלומים
const categoryRouter = require('./routes/category'); // מייבא ראוטר לקטגוריות
const traineeStatusRouter = require("./routes/traineeStatus"); // מייבא ראוטר לסטטוס מתאמנות
const coachStatusRouter = require('./routes/coachStatus'); // מייבא ראוטר לסטטוס מאמנים
const progressRouter = require('./routes/progress');
const subscriptionRouter = require('./routes/subscription');
const ordersRouter = require("./routes/orders");
const settingsRouter = require("./routes/settings");


app.use("/auth", authRouter); // מקשר את ראוטר האותנטיקציה ל־/auth
app.use("/users", usersRouter); // מקשר את ראוטר המשתמשים ל־/users
app.use("/schedule", scheduleRouter); // מקשר את ראוטר לוח האימונים ל־/schedule
app.use("/products", productsRouter); // מקשר את ראוטר המוצרים ל־/products
app.use("/payments", paymentsRouter); // מקשר את ראוטר התשלומים ל־/payments
app.use("/categories", categoryRouter); // מקשר את ראוטר הקטגוריות ל־/categories
app.use("/trainee-status", traineeStatusRouter); // מקשר את ראוטר סטטוס המתאמנות ל־/trainee-status
app.use("/coach-status", coachStatusRouter); // מקשר את ראוטר סטטוס המאמנים ל־/coach-status
app.use('/progress', progressRouter);
app.use("/subscription", subscriptionRouter);
app.use("/orders", ordersRouter);
app.use("/settings", settingsRouter);


const PORT = process.env.PORT || 8801;  
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`); // מפעיל את השרת ומדפיס הודעה בהצלחה
});
