const express = require("express");

const {
  createInvoice,
  getInvoiceById
} = require("../controllers/invoiceController");

const router = express.Router();

// Create and generate invoice + PDF
router.post("/create-invoice", createInvoice);

// Fetch invoice by ID
router.get("/invoice/:id", getInvoiceById);

module.exports = router;

