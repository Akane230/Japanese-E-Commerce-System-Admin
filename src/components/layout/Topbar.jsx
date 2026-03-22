import React from "react";

export default function Topbar({ title }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
    </div>
  );
}
