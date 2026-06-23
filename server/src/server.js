const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Static serving for generated PDFs
const pdfDir =
  process.env.PDF_OUTPUT_DIR || path.join(__dirname, "..", "invoices");
app.use("/invoices", express.static(pdfDir));

// Routes
app.use("/api", invoiceRoutes);

// MongoDB connection
const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/sivashakthi_invoice";

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

module.exports = app;
