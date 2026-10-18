// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/userRoutes"); // เส้นทางที่ถูกต้องของ userRoutes
const authenticateJWT = require("./middlewares/authenticateJWT");
const doseRouter = require("./routes/doseRoute");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.use("/api", routes);
app.use("/dose", doseRouter);

app.get("/api/protected-route", authenticateJWT, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
