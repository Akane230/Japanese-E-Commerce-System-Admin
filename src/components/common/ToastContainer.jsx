import React from "react";
import useToastStore from "../../stores/toastStore";
import { Ic } from "./Icons";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" ? (
            <Ic.Check size={16} />
          ) : t.type === "error" ? (
            <Ic.X size={16} />
          ) : (
            <Ic.Info size={16} />
          )}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
