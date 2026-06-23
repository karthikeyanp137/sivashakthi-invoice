const path = require("path");

const Invoice = require("../models/Invoice");
const { computeProductAmounts } = require("../utils/calculations");
const { numberToIndianCurrencyWords } = require("../utils/numberToWords");
const { generateInvoicePdf } = require("../utils/pdfGenerator");

/**
 * POST /api/create-invoice
 * Body:
 * {
 *   invoiceNumber: string,
 *   date: string | Date,
 *   billingAddress: string,
 *   deliveryAddress: string,
 *   products: [
 *     {
 *       description: string,
 *       hsnCode: string,
 *       dcDetails: [{ dcNumber: string, pcs: number }],
 *       ratePerPcs: number
 *     }
 *   ]
 * }
 */
async function createInvoice(req, res) {
  try {
    const {
      invoiceNumber,
      date,
      billingAddress,
      deliveryAddress,
      products = []
    } = req.body;

    if (!invoiceNumber) {
      return res.status(400).json({ error: "invoiceNumber is required" });
    }

    const dateValue = date ? new Date(date) : new Date();

    // Calculate qtyInPcs from dcDetails and compute amounts
    const productsWithQty = (products || []).map((p) => {
      const dcDetails = (p.dcDetails || []).map((d) => ({
        dcNumber: d.dcNumber,
        pcs: Number(d.pcs || 0)
      }));

      const qtyInPcs = dcDetails.reduce(
        (sum, d) => sum + (d.pcs || 0),
        0
      );

      return {
        description: p.description,
        hsnCode: p.hsnCode,
        dcDetails,
        qtyInPcs,
        ratePerPcs: Number(p.ratePerPcs || 0)
      };
    });

    const {
      products: computedProducts,
      taxableValue,
      cgst,
      sgst,
      grandTotal
    } = computeProductAmounts(productsWithQty);

    const amountInWords = numberToIndianCurrencyWords(grandTotal);

    const invoice = new Invoice({
      invoiceNumber,
      date: dateValue,
      billingAddress,
      deliveryAddress,
      products: computedProducts,
      taxableValue,
      cgst,
      sgst,
      grandTotal,
      amountInWords
    });

    // First save invoice to get _id
    await invoice.save();

    // Generate PDF and update invoice with file path
    const outputDir =
      process.env.PDF_OUTPUT_DIR ||
      path.join(__dirname, "..", "..", "invoices");

    const { fileName, filePath } = await generateInvoicePdf(
      invoice.toObject(),
      outputDir
    );

    invoice.pdfFileName = fileName;
    invoice.pdfFilePath = filePath;
    await invoice.save();

    // Expose a URL that frontend can use to preview/download PDF
    const pdfUrl = `/invoices/${fileName}`;

    return res.status(201).json({
      invoice,
      pdfUrl
    });
  } catch (err) {
    console.error("Error creating invoice:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: "An invoice with this number already exists. Please use a unique invoice number."
      });
    }
    return res.status(500).json({
      error: "Failed to create invoice",
      details: err.message
    });
  }
}

/**
 * GET /api/invoice/:id
 */
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const pdfUrl = invoice.pdfFileName
      ? `/invoices/${invoice.pdfFileName}`
      : null;

    return res.json({ invoice, pdfUrl });
  } catch (err) {
    console.error("Error fetching invoice:", err);
    return res.status(500).json({
      error: "Failed to fetch invoice",
      details: err.message
    });
  }
}

module.exports = {
  createInvoice,
  getInvoiceById
};

