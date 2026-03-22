import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import Pagination from "../common/Pagination";
import RestockModal from "../modals/RestockModal";
import { Ic } from "../common/Icons";

// hooks
import { useInventory, useLowStock } from "../../hooks/useInventory";

export default function InventoryPage() {
  const addToast = useToastStore((state) => state.addToast);

  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [restockModal, setRestockModal] = useState(null);

  const {
    data: allData,
    isLoading: loading,
    refetch: refetchAll,
  } = useInventory(page);
  const { data: lowData, refetch: refetchLow } = useLowStock(page);

  const items = allData?.results || [];
  const lowStock = lowData?.results || [];
  const totalPages = allData?.total_pages || 1;

  const displayed = tab === "low" ? lowStock : items;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="tabs" style={{ margin: 0, border: "none", flex: 1 }}>
            <span
              className={`tab ${tab === "all" ? "active" : ""}`}
              onClick={() => setTab("all")}
            >
              All Stock
            </span>
            <span
              className={`tab ${tab === "low" ? "active" : ""}`}
              onClick={() => setTab("low")}
            >
              Low Stock{" "}
              {lowStock.length > 0 && (
                <span className="sidebar-badge">{lowStock.length}</span>
              )}
            </span>
          </div>
          <button
            className="topbar-btn btn-outline btn-sm"
            onClick={() => {
              refetchAll();
              refetchLow();
            }}
          >
            <Ic.Refresh /> Refresh
          </button>
        </div>
        {loading ? (
          <Loading />
        ) : displayed.length === 0 ? (
          <Empty icon="📦" title="No inventory data" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Sold</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((inv) => {
                if (!inv.product_name) return null;
                const total =
                  (inv.quantity_available || 0) + (inv.quantity_reserved || 0);
                const pct =
                  total > 0 ? (inv.quantity_available / total) * 100 : 0;
                const isLow =
                  inv.quantity_available <= (inv.reorder_threshold || 5);

                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500 }}>{inv.product_name}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: isLow ? "#b91c1c" : "var(--ink)",
                      }}
                    >
                      {inv.quantity_available}
                    </td>
                    <td style={{ color: "var(--ink-muted)" }}>
                      {inv.quantity_reserved}
                    </td>
                    <td style={{ color: "var(--ink-muted)" }}>
                      {inv.quantity_sold}
                    </td>
                    <td>
                      <div className="inv-bar-wrap">
                        <div className="inv-bar">
                          <div
                            className="inv-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: isLow ? "#dc2626" : "var(--green)",
                            }}
                          />
                        </div>
                        <span
                          style={{ fontSize: 11, color: "var(--ink-muted)" }}
                        >
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`chip ${isLow ? "chip-low" : "chip-ok"}`}
                      >
                        {isLow ? "Low" : "OK"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="topbar-btn btn-primary btn-sm"
                        onClick={() => setRestockModal(inv)}
                      >
                        <Ic.Package /> Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {tab === "all" && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
      {restockModal && (
        <RestockModal
          inv={restockModal} // Changed from inventory to inv
          onClose={() => setRestockModal(null)}
        />
      )}
    </>
  );
}
