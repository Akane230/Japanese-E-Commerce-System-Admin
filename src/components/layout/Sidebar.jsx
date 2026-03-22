import React from "react";
import { Ic } from "../common/Icons";
import { NAV } from "../../utils/constants";
import useUIStore from "../../stores/uiStore";

export default function Sidebar({ user, logout }) {
  const currentPage = useUIStore((state) => state.currentPage);
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);
  const badges = useUIStore((state) => state.badges);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="ja">さくらShop</span>
        <span className="en">Admin Console</span>
      </div>

      <div style={{ padding: "12px 0" }}>
        <div className="nav-section">Navigation</div>
        {NAV.map((item) => {
          const count = item.badgeKey ? badges[item.badgeKey] : 0;
          const IconComponent = Ic[item.icon];
          return (
            <div
              key={item.key}
              className={`nav-item ${currentPage === item.key ? "active" : ""}`}
              onClick={() => setCurrentPage(item.key)}
            >
              <IconComponent />
              {item.label}
              {count > 0 && (
                <span className={`badge ${item.badgeColor || ""}`}>
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="nav-divider" />

      <div className="sidebar-footer">
        <div className="admin-pill">
          <div className="admin-avatar">
            {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="admin-name">
              {user?.first_name || user?.email?.split("@")[0] || "Admin"}
            </div>
            <div className="admin-role">Administrator</div>
          </div>
          <button
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.4)",
              cursor: "pointer",
            }}
            onClick={logout}
            title="Sign out"
          >
            <Ic.Logout />
          </button>
        </div>
      </div>
    </aside>
  );
}
