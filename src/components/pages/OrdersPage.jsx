import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import Pagination from "../common/Pagination";
import StatusChip from "../common/StatusChip";
import OrderDetailModal from "../modals/OrderDetailModal";
import ShipModal from "../modals/ShipModal";
import { Ic } from "../common/Icons";
import { fmt, fmtDate } from "../../utils/helpers";
import { ORDER_STATUSES } from "../../utils/constants";

// react-query hooks
import {
  useOrders,
  useUpdateOrderStatus,
  useShipOrder,
} from "../../hooks/useOrders";

export default function OrdersPage() {
  const addToast = useToastStore((state) => state.addToast);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [shipModalId, setShipModalId] = useState(null);

  const {
    data: orderData,
    isLoading: loading,
  } = useOrders({ page, status: statusFilter, search });

  const orders = orderData?.results || [];
  const count = orderData?.count || 0;

  const updateStatusMutation = useUpdateOrderStatus();
  const shipOrderMutation = useShipOrder();

  const updateStatus = async (orderId, newStatus, note = "") => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, newStatus, note });
      addToast("Status updated", "success");
      setSelectedId(null);
    } catch (error) {
      addToast(error.message || "Failed to update status", "error");
    }
  };

  const handleShip = async (orderId, carrier, trackingNumber) => {
    try {
      await shipOrderMutation.mutateAsync({ orderId, carrier, trackingNumber });
      addToast(`Order shipped with ${carrier} - ${trackingNumber}`, "success");
      setShipModalId(null);
    } catch (error) {
      addToast(error.message || "Failed to ship order", "error");
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="filters" style={{ flex: 1 }}>
            <div className="search-wrap">
              <Ic.Search size={14} />
              <input
                className="input input-search"
                placeholder="Order number or user ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setPage(1)}
              />
            </div>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <Empty icon="📦" title="No orders found" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Order #</th>
                <th>User</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td
                    style={{
                      fontWeight: 600,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {o.order_number}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {o.user_id?.slice(-8)}
                  </td>
                  <td>
                    {o.items?.length} item{o.items?.length !== 1 ? "s" : ""}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {fmt(o.grand_total, o.currency)}
                  </td>
                  <td>
                    <StatusChip status={o.payment?.status} />
                  </td>
                  <td>
                    <StatusChip status={o.status} />
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {fmtDate(o.created_at)}
                  </td>
                  <td>
                    <div className="tbl-actions">
                      <button
                        className="topbar-btn btn-outline btn-sm btn-icon"
                        onClick={() => setSelectedId(o.id)}
                        title="View"
                      >
                        <Ic.Eye />
                      </button>
                      {o.status === "paid" && (
                        <button
                          className="topbar-btn btn-outline btn-sm"
                          onClick={() => setShipModalId(o.id)}
                        >
                          <Ic.Truck /> Ship
                        </button>
                      )}
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
        <OrderDetailModal
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusUpdate={updateStatus}
        />
      )}
      {shipModalId && (
        <ShipModal
          orderId={shipModalId}
          onClose={() => setShipModalId(null)}
          onShipped={() => {
            setShipModalId(null);
          }}
          onShip={handleShip}
        />
      )}
    </>
  );
}
