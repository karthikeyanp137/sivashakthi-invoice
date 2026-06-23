/**
 * Utility functions for invoice calculations.
 * All monetary values are handled as Numbers with rounding
 * to 2 decimal places where appropriate.
 */

/**
 * Safely rounds a number to 2 decimal places.
 */
function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Computes totals from an array of product lines.
 * Each product should have qtyInPcs and ratePerPcs.
 */
function computeProductAmounts(products) {
  const computed = products.map((p) => {
    const qtyInPcs = Number(p.qtyInPcs || 0);
    const ratePerPcs = Number(p.ratePerPcs || 0);
    const amount = roundToTwo(qtyInPcs * ratePerPcs);
    return {
      ...p,
      qtyInPcs,
      ratePerPcs,
      amount
    };
  });

  const taxableValue = roundToTwo(
    computed.reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  const cgst = roundToTwo(taxableValue * 0.025); // 2.5%
  const sgst = roundToTwo(taxableValue * 0.025); // 2.5%

  const grandTotalRaw = taxableValue + cgst + sgst;
  const grandTotal = Math.round(grandTotalRaw); // Rounded off to nearest rupee

  return {
    products: computed,
    taxableValue,
    cgst,
    sgst,
    grandTotal
  };
}

module.exports = {
  roundToTwo,
  computeProductAmounts
};

