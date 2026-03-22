import React from "react";

export default function StatusChip({ status }) {
  const s = status?.toLowerCase().replace(/ /g, "_");
  return (
    <span className={`chip chip-${s}`}>
      <span className="chip-dot" style={{ background: "currentColor" }} />
      {status?.replace(/_/g, " ")}
    </span>
  );
}
