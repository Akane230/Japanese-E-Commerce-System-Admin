import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Spinner from "../common/Spinner";
import { Ic } from "../common/Icons";

export default function RefundModal({ order, onClose, onRefund }) {
  const addToast = useToastStore((state) => state.addToast);
  const [reason, setReason] = useState("");
  const [fullRefund, setFullRefund] = useState(true);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason) {
      addToast("Refund reason required.", "error");
      return;
    }
    setLoading(true);
    try {
      // payment object contains order_id which the API expects
      await onRefund(
        order.order_id || order.id,
        reason,
        fullRefund,
        fullRefund ? null : parseFloat(amount),
      );
      onClose();
    } catch (e) {
      addToast(e.message || "Failed to process refund", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">Refund Order</div>
            <div className="modal-sub">Order {order.order_number}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="label">Reason for Refund</label>
            <textarea
              className="input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flexDirection: "row", gap: 10 }}>
            <input
              type="checkbox"
              id="fullRefund"
              checked={fullRefund}
              onChange={(e) => setFullRefund(e.target.checked)}
            />
            <label htmlFor="fullRefund" className="label" style={{ margin: 0 }}>
              Full refund
            </label>
          </div>
          {!fullRefund && (
            <div className="form-group">
              <label className="label">Amount to refund</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="topbar-btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="topbar-btn btn-primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? <Spinner /> : <Ic.Check />} Refund
          </button>
        </div>
      </div>
    </div>
  );
}
