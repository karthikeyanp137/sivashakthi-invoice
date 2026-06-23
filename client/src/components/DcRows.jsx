import React from "react";

export default function DcRows({ dcDetails, onChange, onAddRow, onRemoveRow }) {
  return (
    <div className="dc-rows">
      {dcDetails.map((dc, index) => (
        <div className="dc-row" key={dc.id}>
          <input
            type="text"
            className="dc-input dc-number"
            placeholder="DC No"
            value={dc.dcNumber}
            onChange={(e) =>
              onChange(index, { ...dc, dcNumber: e.target.value })
            }
          />
          <input
            type="number"
            min="0"
            className="dc-input dc-pcs"
            placeholder="PCS"
            value={dc.pcs}
            onChange={(e) =>
              onChange(index, { ...dc, pcs: e.target.value })
            }
          />
          <button
            type="button"
            className="dc-remove"
            onClick={() => onRemoveRow(index)}
            disabled={dcDetails.length === 1}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="dc-add"
        onClick={onAddRow}
      >
        + Add DC
      </button>
    </div>
  );
}

