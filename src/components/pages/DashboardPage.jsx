import React from "react";
import useToastStore from "../../stores/toastStore";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import StatusChip from "../common/StatusChip";
import { fmt, fmtDate, fmtDatetime } from "../../utils/helpers";

// hooks
import { useOrders } from "../../hooks/useOrders";
import { usePayments } from "../../hooks/usePayments";
import { useLowStock } from "../../hooks/useInventory";
import { useAdminReviews } from "../../hooks/useReviews";

export default function DashboardPage() {
  const { data: ordersData, isLoading: loadingOrders } = useOrders({ page: 1 });
  const { data: paymentsData, isLoading: loadingPayments } = usePayments({
    page: 1,
  });
  const { data: lowStockData, isLoading: loadingLowStock } = useLowStock(1);
  const { data: pendingReviewsData, isLoading: loadingReviews } =
    useAdminReviews("pending", 1);

  const loading =
    loadingOrders || loadingPayments || loadingLowStock || loadingReviews;

  const stats = {
    totalOrders: ordersData?.count || 0,
    pendingPayments: paymentsData?.count || 0,
    lowStock: lowStockData?.count || 0,
    pendingReviews: pendingReviewsData?.count || 0,
  };

  const recent = (ordersData?.results || []).slice(0, 5);
  const pending = (paymentsData?.results || []).slice(0, 5);

  if (loading) return <Loading />;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card s-sakura">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats?.totalOrders ?? "—"}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card s-gold">
          <div className="stat-label">Pending Payments</div>
          <div className="stat-value">{stats?.pendingPayments ?? "—"}</div>
          <div className="stat-sub">Awaiting confirmation</div>
        </div>
        <div className="stat-card s-green">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{stats?.lowStock ?? "—"}</div>
          <div className="stat-sub">Need restocking</div>
        </div>
        <div className="stat-card s-blue">
          <div className="stat-label">Pending Reviews</div>
          <div className="stat-value">{stats?.pendingReviews ?? "—"}</div>
          <div className="stat-sub">Awaiting moderation</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
          </div>
          {recent.length === 0 ? (
            <Empty icon="📦" title="No orders yet" />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>{o.order_number}</td>
                    <td>{fmt(o.grand_total, o.currency)}</td>
                    <td>
                      <StatusChip status={o.status} />
                    </td>
                    <td style={{ color: "var(--ink-muted)", fontSize: 12 }}>
                      {fmtDate(o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending Payments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending Payments</div>
          </div>
          {pending.length === 0 ? (
            <Empty icon="✅" title="All payments confirmed" />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.order_number}</td>
                    <td>{fmt(p.grand_total, p.currency)}</td>
                    <td style={{ fontSize: 12 }}>{p.payment_method}</td>
                    <td style={{ color: "var(--ink-muted)", fontSize: 12 }}>
                      {fmtDatetime(p.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
