import React from "react";
import DcRows from "./DcRows";

export default function ProductRow({
  index,
  product,
  onChange,
  onRemove,
  productOptions,
  onAddProductOption,
  hsnOptions,
  onAddHsnOption
}) {
  const handleFieldChange = (field, value) => {
    onChange({ ...product, [field]: value });
  };

  const handleDcChange = (dcIndex, updatedDc) => {
    const dcDetails = product.dcDetails.map((dc, i) =>
      i === dcIndex ? updatedDc : dc
    );
    handleFieldChange("dcDetails", dcDetails);
  };

  const handleAddDcRow = () => {
    handleFieldChange("dcDetails", [
      ...product.dcDetails,
      { id: Date.now().toString(), dcNumber: "", pcs: "" }
    ]);
  };

  const handleRemoveDcRow = (dcIndex) => {
    const dcDetails = product.dcDetails.filter((_, i) => i !== dcIndex);
    handleFieldChange(
      "dcDetails",
      dcDetails.length ? dcDetails : [{ id: Date.now().toString(), dcNumber: "", pcs: "" }]
    );
  };

  const handleAddProductName = () => {
    const name = window.prompt("Enter new product name");
    if (name && !productOptions.includes(name)) {
      onAddProductOption(name);
      handleFieldChange("description", name);
    }
  };

  const handleAddHsn = () => {
    const hsn = window.prompt("Enter new HSN code");
    if (hsn && !hsnOptions.includes(hsn)) {
      onAddHsnOption(hsn);
      handleFieldChange("hsnCode", hsn);
    }
  };

  return (
    <tr>
      <td className="cell center">{index + 1}</td>
      <td className="cell left">
        <div className="product-main">
          <select
            className="input select"
            value={product.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
          >
            <option value="">Select product</option>
            {productOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="small-button"
            onClick={handleAddProductName}
          >
            +
          </button>
        </div>
        <DcRows
          dcDetails={product.dcDetails}
          onChange={handleDcChange}
          onAddRow={handleAddDcRow}
          onRemoveRow={handleRemoveDcRow}
        />
      </td>
      <td className="cell center">
        <div className="product-main">
          <select
            className="input select"
            value={product.hsnCode}
            onChange={(e) => handleFieldChange("hsnCode", e.target.value)}
          >
            <option value="">Select HSN</option>
            {hsnOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="small-button"
            onClick={handleAddHsn}
          >
            +
          </button>
        </div>
      </td>
      <td className="cell center">{product.qtyInPcs || 0}</td>
      <td className="cell right">
        <input
          type="number"
          min="0"
          step="0.01"
          className="input right"
          value={product.ratePerPcs}
          onChange={(e) =>
            handleFieldChange("ratePerPcs", e.target.value)
          }
        />
      </td>
      <td className="cell right">
        {product.amount != null ? product.amount.toFixed(2) : "0.00"}
        <button
          type="button"
          className="row-remove"
          onClick={onRemove}
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

