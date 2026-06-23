import React, { useEffect, useMemo, useState } from "react";
import ProductRow from "./components/ProductRow";
import { computeInvoiceTotals } from "./utils/calculations";
import { numberToIndianCurrencyWords } from "./utils/numberToWords";

const DEFAULT_BILLING_ADDRESS = `SIVA SAKTHI HOSIERY
No. XX, Some Street
Tiruppur - 641XXX
Tamil Nadu, India.`;

const DEFAULT_DELIVERY_ADDRESS = `J.G. HOSIERY PVT LTD
5, J.G. GARDEN ROAD SOLIPALAYAM
TIRUPUR-641 652
GSTIN:33AAACJ9361N1Z3`;

const INITIAL_PRODUCT_OPTIONS = ["Amul Colour 1", "Amul Colour 2"];
const INITIAL_HSN_OPTIONS = ["998822"];

function createEmptyProduct() {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    description: "",
    hsnCode: "",
    dcDetails: [{ id: Date.now().toString(), dcNumber: "", pcs: "" }],
    qtyInPcs: 0,
    ratePerPcs: "",
    amount: 0
  };
}

export default function App() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [billingAddress, setBillingAddress] = useState(
    DEFAULT_BILLING_ADDRESS
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    DEFAULT_DELIVERY_ADDRESS
  );

  const [products, setProducts] = useState([createEmptyProduct()]);

  const [productOptions, setProductOptions] = useState(
    INITIAL_PRODUCT_OPTIONS
  );
  const [hsnOptions, setHsnOptions] = useState(INITIAL_HSN_OPTIONS);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const {
    productsWithTotals,
    taxableValue,
    cgst,
    sgst,
    grandTotal
  } = useMemo(() => computeInvoiceTotals(products), [products]);

  useEffect(() => {
    setProducts(productsWithTotals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsWithTotals.length, taxableValue, cgst, sgst, grandTotal]);

  const amountInWords = useMemo(
    () => numberToIndianCurrencyWords(grandTotal),
    [grandTotal]
  );

  const handleProductChange = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleAddProductRow = () => {
    setProducts((prev) => [...prev, createEmptyProduct()]);
  };

  const handleRemoveProductRow = (id) => {
    setProducts((prev) => (prev.length === 1 ? prev : prev.filter((p) => p.id !== id)));
  };

  const handleAddProductOption = (name) => {
    setProductOptions((prev) => [...prev, name]);
  };

  const handleAddHsnOption = (hsn) => {
    setHsnOptions((prev) => [...prev, hsn]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setPdfUrl("");

    if (!invoiceNumber.trim()) {
      setError("Please enter Invoice Number.");
      return;
    }

    const cleanProducts = productsWithTotals.filter(
      (p) => p.description && p.hsnCode
    );

    if (cleanProducts.length === 0) {
      setError("Please add at least one product with description and HSN.");
      return;
    }

    const payload = {
      invoiceNumber: invoiceNumber.trim(),
      date,
      billingAddress,
      deliveryAddress,
      products: cleanProducts.map((p) => ({
        description: p.description,
        hsnCode: p.hsnCode,
        dcDetails: (p.dcDetails || []).map((d) => ({
          dcNumber: d.dcNumber,
          pcs: Number(d.pcs || 0)
        })),
        ratePerPcs: Number(p.ratePerPcs || 0)
      }))
    };

    try {
      setSaving(true);

      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create invoice");
      }

      const data = await res.json();
      const url = data.pdfUrl ? data.pdfUrl : "";

      setSuccessMessage("Invoice saved and PDF generated successfully.");
      setPdfUrl(url);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SIVA SAKTHI HOSIERY - Tax Invoice</h1>
        <p>Generate GST-compliant invoices and PDFs.</p>
      </header>

      <main className="layout">
        <section className="form-panel">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label>Invoice Number</label>
                <input
                  type="text"
                  className="input"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Billing Address (fixed)</label>
                <textarea
                  className="input textarea"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Delivery Address (fixed)</label>
                <textarea
                  className="input textarea"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th className="center" style={{ width: "5%" }}>
                      S.No
                    </th>
                    <th className="center" style={{ width: "35%" }}>
                      Description / DC & PCS
                    </th>
                    <th className="center" style={{ width: "20%" }}>
                      HSN
                    </th>
                    <th className="center" style={{ width: "10%" }}>
                      Qty in Pcs
                    </th>
                    <th className="center" style={{ width: "15%" }}>
                      Rate / Pcs
                    </th>
                    <th className="center" style={{ width: "15%" }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <ProductRow
                      key={product.id}
                      index={idx}
                      product={product}
                      onChange={handleProductChange}
                      onRemove={() => handleRemoveProductRow(product.id)}
                      productOptions={productOptions}
                      onAddProductOption={handleAddProductOption}
                      hsnOptions={hsnOptions}
                      onAddHsnOption={handleAddHsnOption}
                    />
                  ))}
                  <tr>
                    <td colSpan={6} className="add-row-cell">
                      <button
                        type="button"
                        className="primary-ghost"
                        onClick={handleAddProductRow}
                      >
                        + Add Product
                      </button>
                    </td>
                  </tr>
                  <tr className="totals-row">
                    <td className="cell right" colSpan={5}>
                      Taxable Value
                    </td>
                    <td className="cell right">
                      {taxableValue.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="summary-panel">
              <div className="summary-left">
                <div className="summary-label">Total Amount in Words</div>
                <div className="summary-words">{amountInWords}</div>
              </div>
              <div className="summary-right">
                <div className="summary-line">
                  <span>CGST @ 2.5%</span>
                  <span>{cgst.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>SGST @ 2.5%</span>
                  <span>{sgst.toFixed(2)}</span>
                </div>
                <div className="summary-line grand">
                  <span>Grand Total</span>
                  <span>{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="actions">
              <button
                type="submit"
                className="primary"
                disabled={saving}
              >
                {saving ? "Saving & Generating PDF..." : "Save Invoice & Generate PDF"}
              </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {successMessage && (
              <div className="alert success">{successMessage}</div>
            )}
          </form>
        </section>

        <section className="preview-panel">
          <h2>PDF Preview</h2>
          {pdfUrl ? (
            <iframe
              title="Invoice PDF"
              src={pdfUrl}
              className="pdf-frame"
            />
          ) : (
            <div className="preview-placeholder">
              PDF preview will appear here after saving the invoice.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

