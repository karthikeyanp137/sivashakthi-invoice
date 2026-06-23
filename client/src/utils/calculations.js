// Frontend-side calculation helpers, kept in sync with backend logic.

export function roundToTwo(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

/**
 * Compute qty per product from dcDetails, then amounts & totals.
 * This mirrors the backend logic, but we still rely on backend
 * values as the source of truth when the invoice is saved.
 */
export function computeInvoiceTotals(products) {
  const productsWithTotals = products.map((p) => {
    const dcDetails = (p.dcDetails || []).map((d) => ({
      ...d,
      pcs: Number(d.pcs || 0)
    }));

    const qtyInPcs = dcDetails.reduce((sum, d) => sum + (d.pcs || 0), 0);
    const ratePerPcs = Number(p.ratePerPcs || 0);
    const amount = roundToTwo(qtyInPcs * ratePerPcs);

    return {
      ...p,
      dcDetails,
      qtyInPcs,
      ratePerPcs,
      amount
    };
  });

  const taxableValue = roundToTwo(
    productsWithTotals.reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  const cgst = roundToTwo(taxableValue * 0.025);
  const sgst = roundToTwo(taxableValue * 0.025);

  const grandTotalRaw = taxableValue + cgst + sgst;
  const grandTotal = Math.round(grandTotalRaw);

  return {
    productsWithTotals,
    taxableValue,
    cgst,
    sgst,
    grandTotal
  };
}

