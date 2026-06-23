const path = require("path");

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatMoney(num, decimals = 2) {
  return Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function generateInvoiceHtml(invoice) {
  const {
    invoiceNumber,
    date,
    billingAddress,
    deliveryAddress,
    products,
    taxableValue,
    cgst,
    sgst,
    grandTotal,
    amountInWords
  } = invoice;

  let productRowsHtml = "";

  if (products && products.length > 0) {
    products.forEach((p) => {
      // Main product line
      productRowsHtml += `
      <tr class="data-row">
        <td>${p.description || ""}</td>
        <td class="center">${p.hsnCode || ""}</td>
        <td class="center">${p.qtyInPcs !== "" ? p.qtyInPcs : ""}</td>
        <td class="center">${p.ratePerPcs !== "" ? Number(p.ratePerPcs).toFixed(3) : ""}</td>
        <td class="right">${p.amount !== "" ? formatMoney(p.amount) : ""}</td>
      </tr>
      `;

      // DC details line
      if (p.dcDetails && p.dcDetails.length > 0) {
        const dcTotal = p.dcDetails.reduce((sum, d) => sum + Number(d.pcs || 0), 0);
        let dcHtml = `
          <div style="display: flex; margin-left: 40px; margin-top: 10px; font-weight: bold; font-size: 11px;">
            <div style="width: 80px;" class="center">DC NO</div>
            <div style="width: 80px;" class="center">PCS</div>
          </div>
        `;
        p.dcDetails.forEach((d) => {
          dcHtml += `
          <div style="display: flex; margin-left: 40px; font-size: 11px;">
            <div style="width: 80px;" class="center">${d.dcNumber}</div>
            <div style="width: 80px;" class="center">${d.pcs}</div>
          </div>
          `;
        });
        dcHtml += `
          <div style="display: flex; margin-left: 40px; font-weight: bold; font-size: 11px;">
            <div style="width: 80px;"></div>
            <div style="width: 80px;" class="center">${dcTotal}</div>
          </div>
          <div style="height: 10px;"></div>
        `;

        productRowsHtml += `
        <tr class="data-row">
          <td>${dcHtml}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        `;
      }
    });
  }

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Invoice ${invoiceNumber}</title>
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .page {
        width: 210mm;
        height: 297mm;
        padding: 10mm;
        margin: 0 auto;
        overflow: hidden;
      }
      .frame {
        width: 100%;
        height: 100%;
        border: 2px solid #000;
        display: flex;
        flex-direction: column;
      }
      
      /* Header Box */
      .header-row {
        display: grid;
        grid-template-columns: 1fr 220px;
        border-bottom: 2px solid #000;
      }
      .header-title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 0.5px;
        border-right: 2px solid #000;
      }
      .header-meta {
        display: flex;
        flex-direction: column;
      }
      .meta-line {
        display: grid;
        grid-template-columns: 100px 1fr;
        height: 50%;
      }
      .meta-line:first-child {
        border-bottom: 2px solid #000;
      }
      .meta-label {
        font-weight: bold;
        padding: 6px;
        border-right: 2px solid #000;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
      .meta-value {
        padding: 6px;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Address Box */
      .address-area {
        display: grid;
        grid-template-columns: 40% 60%;
        border-bottom: 2px solid #000;
      }
      .address-box {
        display: flex;
        flex-direction: column;
      }
      .address-box:first-child {
        border-right: 2px solid #000;
      }
      .address-header {
        text-align: center;
        font-size: 14px;
        padding: 4px;
        border-bottom: 2px solid #000;
      }
      .address-content {
        padding: 6px;
        font-size: 13px;
        line-height: 1.5;
        height: 110px;
      }
      .address-name {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      /* Items Table */
      .items-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .items-table th {
        border-bottom: 2px solid #000;
        border-right: 2px solid #000;
        padding: 5px;
        font-size: 14px;
        font-weight: bold;
      }
      .items-table th:last-child, .items-table td:last-child {
        border-right: none;
      }
      .items-table td {
        border-right: 2px solid #000;
        padding: 4px 6px;
        vertical-align: top;
        font-size: 13px;
        border-bottom: none;
      }
      
      .data-row td {
        /* No bottom border to allow continuity */
      }
      .filler-row td {
        /* This stretches the empty space */
      }

      /* Totals */
      .totals-row td {
        border-top: 2px solid #000;
        border-bottom: none;
        padding: 6px;
        font-size: 13px;
      }
      .totals-row:first-child td {
        /* Handled inline for thick top border */
      }
      
      .footer-decl {
        border-top: 2px solid #000;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      .decl-box {
        border-right: 2px solid #000;
      }
      .decl-title {
        font-weight: bold;
        padding: 4px 6px;
        font-size: 13px;
        border-bottom: 1px solid transparent;
      }
      .decl-text {
        padding: 0 6px 6px 6px;
        font-size: 13px;
        line-height: 1.4;
      }
      .sign-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 4px 6px 6px 6px;
      }
      .sign-firm {
        font-weight: bold;
        font-size: 13px;
        align-self: flex-end;
      }
      .sign-auth {
        margin-top: 50px;
        font-size: 13px;
        align-self: flex-end;
      }
      
      .center { text-align: center; }
      .right { text-align: right; }
      .left { text-align: left; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="frame">
        
        <div class="header-row">
          <div class="header-title">TAX INVOICE</div>
          <div class="header-meta">
            <div class="meta-line">
              <div class="meta-label">INVOICE NO</div>
              <div class="meta-value">${invoiceNumber}</div>
            </div>
            <div class="meta-line">
              <div class="meta-label">DATE</div>
              <div class="meta-value">${formatDate(date)}</div>
            </div>
          </div>
        </div>

        <div class="address-area">
          <div class="address-box">
            <div class="address-header">Billing Address</div>
            <div class="address-content">
              <div class="address-name">SIVA SAKTHI HOSIERY</div>
              ${billingAddress.replace("SIVA SAKTHI HOSIERY", "").trim().replace(/\\n/g, "<br/>")}
            </div>
          </div>
          <div class="address-box">
            <div class="address-header">Delivery Address</div>
            <div class="address-content">
              <div class="address-name">J.G. HOSIERY PVT LTD</div>
              ${deliveryAddress.replace("J.G. HOSIERY PVT LTD", "").trim().replace(/\\n/g, "<br/>")}
            </div>
          </div>
        </div>

        <div style="flex-grow: 1; border-bottom: 2px solid #000;">
          <table class="items-table" style="height: 100%;">
            <colgroup>
              <col style="width:40%" />
              <col style="width:12%" />
              <col style="width:14%" />
              <col style="width:16%" />
              <col style="width:18%" />
            </colgroup>
            <thead>
              <tr>
                <th class="left">Description</th>
                <th class="center">HSN Code</th>
                <th class="center">Qty in pcs</th>
                <th class="center">Rate per pcs</th>
                <th class="center">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productRowsHtml}
              <!-- Filler row to push totals down -->
              <tr class="filler-row" style="height: 100%;">
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr class="totals-row">
                <td rowspan="4" style="border-top: 2px solid #000; border-right: 2px solid #000; vertical-align: top;">
                  Total amount in words:<br/>
                  <br/>
                  <b>${amountInWords}</b>
                </td>
                <td colspan="3" class="left" style="border-top: 2px solid #000;"><b>Taxable value</b></td>
                <td class="right" style="border-top: 2px solid #000;"><b>${formatMoney(taxableValue)}</b></td>
              </tr>
              <tr class="totals-row">
                <td colspan="2" class="left" style="border-top: 1px solid #000;"><b>Add : CGST @</b></td>
                <td class="right" style="border-top: 1px solid #000;"><b>2.5%</b></td>
                <td class="right" style="border-top: 1px solid #000;"><b>${formatMoney(cgst)}</b></td>
              </tr>
              <tr class="totals-row">
                <td colspan="2" class="left" style="border-top: 1px solid #000;"><b>Add : SGST @</b></td>
                <td class="right" style="border-top: 1px solid #000;"><b>2.5%</b></td>
                <td class="right" style="border-top: 1px solid #000;"><b>${formatMoney(sgst)}</b></td>
              </tr>
              <tr class="totals-row">
                <td colspan="3" class="left" style="border-top: 2px solid #000;"><b>Grand Total (Rounded off)</b></td>
                <td class="right" style="border-top: 2px solid #000;"><b>${formatMoney(grandTotal)}</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer-decl">
          <div class="decl-box">
            <div class="decl-title">DECLARATION:</div>
            <div class="decl-text">
              I declare that this invoice shows the actual price of the<br/>
              described and all the particulars are true and correct to<br/>
              best of my knowledge
            </div>
          </div>
          <div class="sign-box">
            <div class="sign-firm">For SIVA SAKTHI HOSIERY</div>
            <div class="sign-auth"></div>
          </div>
        </div>

      </div>
    </div>
  </body>
</html>
  `;
}

module.exports = {
  generateInvoiceHtml
};
