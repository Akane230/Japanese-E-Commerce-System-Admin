import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import Pagination from "../common/Pagination";
import Stars from "../common/Stars";
import StatusChip from "../common/StatusChip";
import ReviewDetailModal from "../modals/ReviewDetailModal";
import { Ic } from "../common/Icons";
import { fmtDate } from "../../utils/helpers";

import { useAdminReviews, useModerateReview } from "../../hooks/useReviews";

export default function ReviewsPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);

  const { data, isLoading, refetch } = useAdminReviews(tab, page);
  const reviews = data?.results || [];
  const count = data?.count || 0;

  const moderateMutation = useModerateReview();

  const moderate = async (reviewId, action, note = "") => {
    try {
      await moderateMutation.mutateAsync({ reviewId, action, note });
      addToast(`Review ${action}d`, "success");
      setSelected(null);
    } catch (error) {
      addToast(error.message || "Failed to moderate review", "error");
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    setPage(1);
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="tabs" style={{ margin: 0, border: "none", flex: 1 }}>
            {["pending", "approved", "rejected"].map((t) => (
              <span
                key={t}
                className={`tab ${tab === t ? "active" : ""}`}
                onClick={() => handleTabChange(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
          </div>
          <button className="topbar-btn btn-outline btn-sm" onClick={refetch}>
            <Ic.Refresh />
          </button>
        </div>
        {isLoading ? (
          <Loading />
        ) : reviews.length === 0 ? (
          <Empty icon="⭐" title={`No ${tab} reviews`} />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Rating</th>
                <th>Title</th>
                <th>User</th>
                <th>Verified</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {r.product_name || r.product_id}
                  </td>
                  <td>
                    <Stars rating={r.rating} />
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: 200 }}>{r.title}</td>
                  <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {r.user_username || r.user_id?.slice(-8) || "Anonymous"}
                  </td>
                  <td>
                    <span className="chip chip-success">
                      {r.is_verified_purchase ? "✓" : "—"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {fmtDate(r.created_at)}
                  </td>
                  <td>
                    <div className="tbl-actions">
                      <button
                        className="topbar-btn btn-outline btn-sm btn-icon"
                        onClick={() => setSelected(r)}
                        title="Review"
                      >
                        <Ic.Eye />
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

      {selected && (
        <ReviewDetailModal
          review={selected}
          onClose={() => setSelected(null)}
          onModerate={(action, note) => moderate(selected.id, action, note)}
        />
      )}
    </>
  );
}
