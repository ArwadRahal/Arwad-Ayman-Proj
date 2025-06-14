const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const scheduleRouter = require("./routes/schedule");
const productsRouter = require("./routes/products");
const paymentsRouter = require("./routes/payments");
const categoryRouter = require('./routes/category');
const traineeStatusRouter = require('./routes/traineeStatus');
const coachStatusRouter = require('./routes/coachStatus');  

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/schedule", scheduleRouter);
app.use("/products", productsRouter);
app.use("/payments", paymentsRouter);
app.use('/categories', categoryRouter);
app.use('/trainee-status', traineeStatusRouter);
app.use('/coach-status', coachStatusRouter);  

const PORT = process.env.PORT || 8801;
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
