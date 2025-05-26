// server/index.js
const express = require("express");
const cors    = require("cors");
const auth    = require("./routes/auth");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", auth);
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);
const scheduleRouter = require("./routes/schedule");
app.use("/schedule", scheduleRouter);


const PORT = process.env.PORT || 8801;
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost${PORT}`);
});





const productRouter =  require('./routes/products');
app.use("/Product-Management" , productRouter);

