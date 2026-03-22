import React, { useState, useEffect } from "react";
import { Ic } from "../common/Icons";
import StatusChip from "../common/StatusChip";
import Stars from "../common/Stars";
import { fmt, fmtDatetime } from "../../utils/helpers";
import { ORDER_STATUSES } from "../../utils/constants";

import { useOrder } from "../../hooks/useOrders";
import { useConfirmPayment, useRejectPayment } from "../../hooks/usePayments";
import useToastStore from "../../stores/toastStore";

export default function OrderDetailModal({ orderId, onClose, onStatusUpdate }) {
  const addToast = useToastStore((state) => state.addToast);
  const { data: o, isLoading, error, refetch } = useOrder(orderId);
  const [activeTab, setActiveTab] = useState("order");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [note, setNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const confirmPaymentMutation = useConfirmPayment();
  const rejectPaymentMutation = useRejectPayment();

  useEffect(() => {
    if (o) {
      setOrderStatus(o.status);
      setPaymentStatus(o.payment?.status || "");
    }
  }, [o]);

  const handleSave = async () => {
    const updates = [];

    // Check if order status changed
    if (orderStatus !== o.status) {
      updates.push(onStatusUpdate(o.id, orderStatus, note));
    }

    // Check if payment status changed
    if (paymentStatus !== o.payment?.status) {
      if (paymentStatus === "paid") {
        updates.push(confirmPaymentMutation.mutateAsync(orderId));
      } else if (paymentStatus === "failed") {
        if (!rejectionReason.trim()) {
          addToast("Rejection reason is required", "error");
          return;
        }
        updates.push(
          rejectPaymentMutation.mutateAsync({
            orderId,
            reason: rejectionReason,
          }),
        );
      }
    }

    if (updates.length === 0) {
      addToast("No changes to save", "info");
      return;
    }

    try {
      await Promise.all(updates);
      addToast("Changes saved successfully", "success");
      refetch();
      onClose();
    } catch (error) {
      addToast(error.message || "Failed to save changes", "error");
    }
  };

  if (isLoading)
    return (
      <div className="modal-backdrop">
        <div className="modal">Loading…</div>
      </div>
    );
  if (error)
    return (
      <div className="modal-backdrop">
        <div className="modal">Error loading order</div>
      </div>
    );

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">Order {o.order_number}</div>
            <div className="modal-sub">Created {fmtDatetime(o.created_at)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "order" ? "active" : ""}`}
            onClick={() => setActiveTab("order")}
          >
            📋 Order Details
          </button>
          <button
            className={`tab ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            💰 Payment Details
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid" style={{ marginBottom: 16 }}>
            <div className="detail-block">
              <div className="detail-label">Shipping Address</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <strong>{o.shipping_address?.recipient_name}</strong>
                <br />
                {o.shipping_address?.street}
                {o.shipping_address?.building
                  ? `, ${o.shipping_address.building}`
                  : ""}
                <br />
                {o.shipping_address?.city}, {o.shipping_address?.postal_code}
                <br />
                {o.shipping_address?.country}
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: 16 }}>
            <div className="detail-label" style={{ marginBottom: 8 }}>
              Items
            </div>
            <table
              className="tbl"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {o.items?.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "var(--ink-muted)",
                      }}
                    >
                      {item.sku}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{fmt(item.unit_price, o.currency)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {fmt(item.subtotal, o.currency)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "right",
                      fontWeight: 500,
                      color: "var(--ink-muted)",
                    }}
                  >
                    Subtotal
                  </td>
                  <td>{fmt(o.subtotal, o.currency)}</td>
                </tr>
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "right",
                      fontWeight: 500,
                      color: "var(--ink-muted)",
                    }}
                  >
                    Shipping
                  </td>
                  <td>{fmt(o.shipping_fee, o.currency)}</td>
                </tr>
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "right", fontWeight: 700 }}
                  >
                    Grand Total
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {fmt(o.grand_total, o.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status History */}
          {o.status_history?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="detail-label" style={{ marginBottom: 10 }}>
                Status History
              </div>
              <div className="timeline">
                {[...o.status_history].reverse().map((h, i, arr) => (
                  <div key={i} className="tl-item">
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div className="tl-dot" />
                      {i < arr.length - 1 && <div className="tl-line" />}
                    </div>
                    <div className="tl-content">
                      <div className="tl-label">{h.label || h.status}</div>
                      {h.note && <div className="tl-note">{h.note}</div>}
                      <div className="tl-time">{fmtDatetime(h.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "order" && (
            <div className="form-row">
              <div className="form-group">
                <label className="label">Order Status</label>
                <select
                  className="select status-select"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Note (optional)</label>
                <input
                  className="input"
                  placeholder="Add a note for this status change..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Payment Method</label>
                  <input
                    className="input"
                    value={o.payment?.method || ""}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="label">Payment Status</label>
                  <select
                    className="select status-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              {paymentStatus === "failed" && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Rejection Reason</label>
                    <textarea
                      className="input"
                      placeholder="Reason for rejecting the payment..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
              {o.payment?.transaction_id && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Transaction ID</label>
                    <input
                      className="input"
                      value={o.payment.transaction_id}
                      readOnly
                    />
                  </div>
                </div>
              )}
              {/* Payment Proof */}
              {o.payment?.proof_url && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Payment Proof</label>
                    <div style={{ maxWidth: 300 }}>
                      <img
                        src={o.payment.proof_url}
                        alt="Payment proof"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="topbar-btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="topbar-btn btn-primary"
            onClick={handleSave}
            disabled={
              confirmPaymentMutation.isLoading ||
              rejectPaymentMutation.isLoading
            }
          >
            {confirmPaymentMutation.isLoading || rejectPaymentMutation.isLoading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
