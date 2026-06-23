## Siva Sakthi Hosiery – Invoice Web Application

This project is a full-stack invoice generator for **Siva Sakthi Hosiery**, with:

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **PDF Generation**: Puppeteer (HTML → A4 PDF)

The invoice layout is designed to resemble a GST-style garment invoice with fixed company details, dynamic product/DC rows, auto-calculated GST, and amount-in-words in Indian format.

---

### Folder structure

```text
sivashakthi-invoice/
  client/   # React frontend (Vite)
  server/   # Node/Express backend + MongoDB + Puppeteer
```

---

### 1. Backend – setup & run

From your workspace root:

```bash
cd sivashakthi-invoice/server
```

1. **Create `.env`**

   Copy the example file:

   ```bash
   copy .env.example .env   # Windows PowerShell / CMD
   ```

   Or create `server/.env` manually with:

   ```bash
   MONGODB_URI=mongodb://127.0.0.1:27017/sivashakthi_invoice
   PORT=5000
   PDF_OUTPUT_DIR=./invoices
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Make sure MongoDB is running**

   - Local MongoDB Community Edition (default port `27017`) is fine.

4. **Start the backend server**

   Development (auto-reload):

   ```bash
   npm run dev
   ```

   Or normal:

   ```bash
   npm start
   ```

   The server will listen on `http://localhost:5000` and will:

   - Expose APIs under `/api/...`
   - Serve generated PDFs under `/invoices/...`

---

### 2. Frontend – setup & run

In a **new terminal** (keep backend running), from the project root:

```bash
cd sivashakthi-invoice/client
```

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the React dev server**

   ```bash
   npm run dev
   ```

   Vite will show a URL such as:

   - `http://localhost:3000/`

   Open it in your browser.

   The Vite dev server is configured to **proxy**:

   - `/api` → `http://localhost:5000`
   - `/invoices` → `http://localhost:5000`

   so the React app can call the backend and load PDFs without CORS issues.

---

### 3. Using the app

1. Open `http://localhost:3000` in your browser.
2. Fill:
   - **Invoice Number** (manual).
   - **Date** (defaults to today but editable).
   - Billing/Delivery address (pre-filled; you can fine-tune text).
3. In the **Products** table:
   - Choose product name from dropdown (Amul Colour 1/2) or click `+` to add a new name.
   - Choose HSN (default `998822`) or click `+` to add a new code.
   - Add multiple **DC rows** with **DC No** and **PCS**; app will sum PCS → `Qty in Pcs`.
   - Enter **Rate / Pcs**; amount auto-calculates.
   - Use **+ Add Product** to insert more product rows.
4. At the bottom you will see:
   - **Taxable Value**.
   - **CGST @ 2.5%**, **SGST @ 2.5%**.
   - **Grand Total** (rounded to nearest rupee).
   - **Total Amount in Words** (Indian format: Lakhs, Thousands, Hundreds).
5. Click **“Save Invoice & Generate PDF”**:
   - Frontend sends data to `POST /api/create-invoice`.
   - Backend stores invoice in MongoDB, generates an A4 PDF using Puppeteer.
   - The generated PDF is served from `/invoices/...` and a **PDF preview** appears on the right side.

You can print or download the PDF directly from the preview frame.

---

### 4. APIs exposed (for reference)

- **POST** `/api/create-invoice`
  - Body: invoice data (invoiceNumber, date, billingAddress, deliveryAddress, products with DC & PCS, rate).
  - Response: `{ invoice, pdfUrl }` with calculated `taxableValue`, `cgst`, `sgst`, `grandTotal`, `amountInWords`.

- **GET** `/api/invoice/:id`
  - Returns stored invoice and `pdfUrl` for a previously created invoice.

---

### 5. Customisation notes

- To make the PDF layout match your **exact existing invoice PDF**, adjust:
  - `server/src/utils/invoiceTemplate.js` → HTML structure and CSS (borders, spacing, fonts).
- To change static company details (name, address, GSTIN):
  - Update constants in `invoiceTemplate.js` and default addresses in `client/src/App.jsx`.

