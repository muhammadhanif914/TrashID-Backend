const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use("/api/scan", require("./routes/wasteRoutes"));
app.use("/api/report", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/tpu", require("./routes/tpuRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "API is working properly" });
});

module.exports = app;
