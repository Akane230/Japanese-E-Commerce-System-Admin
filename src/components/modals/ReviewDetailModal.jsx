import React, { useState } from "react";
import { Ic } from "../common/Icons";
import Stars from "../common/Stars";
import StatusChip from "../common/StatusChip";
import { fmtDate } from "../../utils/helpers";

export default function ReviewDetailModal({ review: r, onClose, onModerate }) {
  const [note, setNote] = useState("");

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">Review Detail</div>
            <div className="modal-sub">
              Rating: {r.rating}/5 · {fmtDate(r.created_at)}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid" style={{ marginBottom: 16 }}>
            <div className="detail-block">
              <div className="detail-label">Review Info</div>
              <div className="detail-row">
                <span>Product</span>
                <span className="detail-val">
                  {r.product_name || r.product_id}
                </span>
              </div>
              <div className="detail-row">
                <span>Rating</span>
                <Stars rating={r.rating} />
              </div>
              <div className="detail-row">
                <span>Verified Purchase</span>
                <span className="detail-val">
                  {r.is_verified_purchase ? "Yes ✓" : "No"}
                </span>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <StatusChip status={r.moderation_status} />
              </div>
              <div className="detail-row">
                <span>Helpful Votes</span>
                <span className="detail-val">
                  {r.helpful_votes?.length || 0}
                </span>
              </div>
            </div>
            <div className="detail-block">
              <div className="detail-label">Review Content</div>
              {r.title && (
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                  {r.title}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  lineHeight: 1.7,
                }}
              >
                {r.body || (
                  <span style={{ color: "var(--ink-muted)" }}>
                    No body text.
                  </span>
                )}
              </div>
            </div>
          </div>

          {r.moderation_status === "pending" && (
            <div className="detail-block">
              <div className="detail-label" style={{ marginBottom: 10 }}>
                Moderation Note (optional)
              </div>
              <textarea
                className="input"
                rows={2}
                placeholder="Internal note for this moderation decision…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="topbar-btn btn-outline" onClick={onClose}>
            Close
          </button>
          {r.moderation_status === "pending" && (
            <>
              <button
                className="topbar-btn btn-danger"
                onClick={() => onModerate("reject", note)}
              >
                Reject
              </button>
              <button
                className="topbar-btn btn-success"
                onClick={() => onModerate("approve", note)}
              >
                <Ic.Check size={14} /> Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
