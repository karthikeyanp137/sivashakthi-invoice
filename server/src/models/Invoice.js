const mongoose = require("mongoose");

const DcDetailSchema = new mongoose.Schema(
  {
    dcNumber: { type: String, required: true },
    pcs: { type: Number, required: true }
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    hsnCode: { type: String, required: true },
    dcDetails: { type: [DcDetailSchema], default: [] },
    qtyInPcs: { type: Number, required: true },
    ratePerPcs: { type: Number, required: true },
    amount: { type: Number, required: true }
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    billingAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    products: { type: [ProductSchema], default: [] },
    taxableValue: { type: Number, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    amountInWords: { type: String, required: true },
    pdfFileName: { type: String }, // stored file name for PDF
    pdfFilePath: { type: String } // absolute or relative path on server
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);

