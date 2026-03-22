import React, { useState } from "react";
import { Ic } from "../common/Icons";
import { fmt, fmtDatetime } from "../../utils/helpers";
import { usePayment } from "../../hooks/usePayments";

export default function PaymentReviewModal({
  paymentId,
  onClose,
  onConfirm,
  onReject,
  onRefund,
}) {
  const { data: p, isLoading, error } = usePayment(paymentId);

  if (isLoading) return null;
  if (error) return null;
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">Review Payment</div>
            <div className="modal-sub">Order {p.order_number}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid" style={{ marginBottom: 16 }}>
            <div className="detail-block">
              <div className="detail-label">Payment Details</div>
              <div className="detail-row">
                <span>Amount</span>
                <span className="detail-val" style={{ fontWeight: 700 }}>
                  {fmt(p.grand_total, p.currency)}
                </span>
              </div>
              <div className="detail-row">
                <span>Method</span>
                <span className="detail-val">
                  {p.payment_label || p.payment_method}
                </span>
              </div>
              <div className="detail-row">
                <span>Reference #</span>
                <span
                  className="detail-val"
                  style={{ fontFamily: "monospace" }}
                >
                  {p.reference_number || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span>Submitted</span>
                <span className="detail-val">
                  {fmtDatetime(p.submitted_at)}
                </span>
              </div>
            </div>
            <div className="detail-block">
              <div className="detail-label">Customer Notes</div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  lineHeight: 1.6,
                }}
              >
                {p.customer_notes || (
                  <span style={{ color: "var(--ink-muted)" }}>
                    No notes provided.
                  </span>
                )}
              </div>
            </div>
          </div>

          {p.proof_url && (
            <div style={{ marginBottom: 16 }}>
              <div className="detail-label" style={{ marginBottom: 8 }}>
                Payment Proof / Screenshot
              </div>
              <a
                href={p.proof_url}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block" }}
              >
                <img
                  src={p.proof_url}
                  alt="Payment proof"
                  className="proof-img"
                  style={{ maxHeight: 280 }}
                />
              </a>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-muted)",
                  marginTop: 4,
                }}
              >
                Click to open full size
              </div>
            </div>
          )}

          {showReject && (
            <div className="form-group">
              <label className="label">
                Rejection Reason (shown to customer)
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Screenshot is unclear. Amount does not match order total."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="topbar-btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          {showReject ? (
            <>
              <button
                className="topbar-btn btn-outline"
                onClick={() => setShowReject(false)}
              >
                Back
              </button>
              <button
                className="topbar-btn btn-danger"
                onClick={() => onReject(rejectReason)}
              >
                Confirm Rejection
              </button>
            </>
          ) : (
            <>
              <button
                className="topbar-btn btn-danger"
                onClick={() => setShowReject(true)}
              >
                Reject
              </button>
              <button className="topbar-btn btn-success" onClick={onConfirm}>
                <Ic.Check size={14} /> Confirm Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
