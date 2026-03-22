import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Spinner from "../common/Spinner";
import { useRestock } from "../../hooks/useInventory";
import { Ic } from "../common/Icons";

export default function RestockModal({ inv, onClose }) {
  const addToast = useToastStore((state) => state.addToast);

  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const restockMutation = useRestock();

  const productName = inv?.product_name || inv?.product_id || "Unknown Product";
  const currentStock = inv?.quantity_available ?? 0;
  const productId = inv?.product_id || inv?.id;

  const submit = async () => {
    if (!qty || parseInt(qty) < 1) {
      addToast("Enter a valid quantity.", "error");
      return;
    }

    try {
      await restockMutation.mutateAsync({
        productId,
        quantity: parseInt(qty),
        note,
      });
      addToast(`Restocked ${qty} units`, "success");
      onClose();
    } catch (e) {
      addToast(e.message || "Failed to restock", "error");
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Restock Product</div>
            <div className="modal-sub">
              {productName} · Current stock: {currentStock}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="label">Quantity to Add</label>
            <input
              className="input"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Note (optional)</label>
            <input
              className="input"
              placeholder="e.g. New shipment from supplier"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="topbar-btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="topbar-btn btn-primary"
            onClick={submit}
            disabled={restockMutation.isPending}
          >
            {restockMutation.isPending ? (
              <Spinner />
            ) : (
              <>
                <Ic.Package /> Restock
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
