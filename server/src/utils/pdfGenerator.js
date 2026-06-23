const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const { generateInvoiceHtml } = require("./invoiceTemplate");

/**
 * Generate a PDF for the given invoice document.
 * Returns { fileName, filePath } for the stored PDF.
 */
async function generateInvoicePdf(invoiceDoc, outputDir) {
  const pdfDir =
    outputDir || path.join(__dirname, "..", "..", "invoices");

  // Ensure output directory exists
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const fileName = `invoice_${invoiceDoc.invoiceNumber}.pdf`;
  const filePath = path.join(pdfDir, fileName);

  const html = generateInvoiceHtml(invoiceDoc);

  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm"
    }
  });

  await browser.close();

  return { fileName, filePath };
}

module.exports = {
  generateInvoicePdf
};

