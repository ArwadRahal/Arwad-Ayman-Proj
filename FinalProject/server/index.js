// server/index.js
const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const auth    = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", auth);

// (later: mount other routes here, e.g. schedule, products)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
