import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import Pagination from "../common/Pagination";
import PaymentReviewModal from "../modals/PaymentReviewModal";
import RefundModal from "../modals/RefundModal";
import { Ic } from "../common/Icons";
import { fmt, fmtDatetime } from "../../utils/helpers";

// hooks
import {
  usePayments,
  useConfirmPayment,
  useRejectPayment,
  useProcessRefund,
} from "../../hooks/usePayments";

export default function PaymentsPage() {
  const addToast = useToastStore((state) => state.addToast);

  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [refundModal, setRefundModal] = useState(null);

  const {
    data: paymentsData,
    isLoading: loading,
    refetch,
  } = usePayments({ page });
  const items = paymentsData?.results || [];
  const count = paymentsData?.count || 0;

  const confirmMutation = useConfirmPayment();
  const rejectMutation = useRejectPayment();
  const refundMutation = useProcessRefund();

  const confirm = async (orderId) => {
    try {
      await confirmMutation.mutateAsync(orderId);
      addToast("Payment confirmed — order is now Paid", "success");
      setSelectedId(null);
    } catch (error) {
      addToast(error.message || "Failed to confirm payment", "error");
    }
  };

  const reject = async (orderId, reason) => {
    if (!reason) {
      addToast("Rejection reason required.", "error");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ orderId, reason });
      addToast("Payment rejected — customer notified to resubmit", "success");
      setSelectedId(null);
    } catch (error) {
      addToast(error.message || "Failed to reject payment", "error");
    }
  };

  const handleRefund = async (orderId, reason, fullRefund, amount) => {
    try {
      await refundMutation.mutateAsync({ orderId, reason, fullRefund, amount });
      addToast("Refund processed", "success");
      setRefundModal(null);
    } catch (error) {
      addToast(error.message || "Failed to process refund", "error");
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Payment Confirmation Queue</div>
          <button
            className="topbar-btn btn-outline btn-sm"
            onClick={() => refetch()}
          >
            <Ic.Refresh /> Refresh
          </button>
        </div>
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <Empty
            icon="✅"
            title="Queue is clear"
            sub="All payments have been processed"
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Thumbnail</th> {/* NEW COLUMN */}
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.media?.thumbnail_url ? (
                      <img
                        src={p.media.thumbnail_url}
                        alt={p.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          objectFit: "cover",
                          border: "1px solid var(--border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          backgroundColor: "var(--bg-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        🖼️
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {p.order_number}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {fmt(p.grand_total, p.currency)}
                  </td>
                  <td>
                    <span className="chip chip-payment_pending">
                      {p.payment_method}
                    </span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {p.reference_number || "—"}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {fmtDatetime(p.submitted_at)}
                  </td>
                  <td>
                    <div className="tbl-actions">
                      <button
                        className="topbar-btn btn-outline btn-sm btn-icon"
                        onClick={() => setSelectedId(p.id)}
                        title="Review"
                      >
                        <Ic.Eye />
                      </button>
                      <button
                        className="topbar-btn btn-success btn-sm"
                        onClick={() => confirm(p.order_id)}
                      >
                        <Ic.Check size={13} /> Confirm
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} total={count} onPage={(p) => setPage(p)} />
      </div>

      {selectedId && (
        <PaymentReviewModal
          paymentId={selectedId}
          onClose={() => setSelectedId(null)}
          onConfirm={() =>
            confirm(
              paymentsData?.results?.find((p) => p.id === selectedId)?.order_id,
            )
          }
          onReject={(reason) =>
            reject(
              paymentsData?.results?.find((p) => p.id === selectedId)?.order_id,
              reason,
            )
          }
          onRefund={() => {
            setSelectedId(null);
            setRefundModal(
              paymentsData?.results?.find((p) => p.id === selectedId),
            );
          }}
        />
      )}
      {refundModal && (
        <RefundModal
          order={refundModal}
          onClose={() => setRefundModal(null)}
          onRefund={handleRefund}
        />
      )}
    </>
  );
}
