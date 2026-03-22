import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Spinner from "../common/Spinner";
import { Ic } from "../common/Icons";
import { useOrder, useShipOrder } from "../../hooks/useOrders";

export default function ShipModal({ orderId, onClose, onShipped }) {
  const addToast = useToastStore((state) => state.addToast);
  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const shipMutation = useShipOrder();

  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!carrier || !tracking) {
      addToast("Carrier and tracking number required.", "error");
      return;
    }

    setLoading(true);
    try {
      await shipMutation.mutateAsync({
        orderId: order.id,
        carrier,
        trackingNumber: tracking,
      });
      addToast(`Order ${order.order_number} marked as shipped`, "success");
      onShipped();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (orderLoading) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Ship Order</div>
            <div className="modal-sub">{order?.order_number}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="label">Carrier</label>
            <input
              className="input"
              placeholder="e.g. Japan Post EMS, DHL, FedEx"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Tracking Number</label>
            <input
              className="input"
              placeholder="e.g. EE123456789JP"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Tracking URL (optional)</label>
            <input
              className="input"
              type="url"
              placeholder="https://..."
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
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
            disabled={loading}
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <Ic.Truck /> Mark as Shipped
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
