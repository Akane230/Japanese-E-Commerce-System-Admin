import React, { useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import useUIStore from "../../stores/uiStore";
import useToastStore from "../../stores/toastStore";
import Sidebar from "./SideBar";
import Topbar from "./Topbar";
import DashboardPage from "../pages/DashboardPage";
import OrdersPage from "../pages/OrdersPage";
import PaymentsPage from "../pages/PaymentsPage";
import ProductsPage from "../pages/ProductsPage";
import CategoriesPage from "../pages/CategoriesPage";
import InventoryPage from "../pages/InventoryPage";
import ReviewsPage from "../pages/ReviewsPage";
import { PAGE_TITLES } from "../../utils/constants";

export default function Shell() {
  const { user, logout, call } = useAuthStore();
  const currentPage = useUIStore((state) => state.currentPage);
  const setBadges = useUIStore((state) => state.setBadges);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    Promise.all([
      call("get", "/payments/admin/pending/"),
      call("get", "/inventory/low-stock/"),
      call("get", "/reviews/admin/pending/"),
    ])
      .then(([pay, inv, rev]) => {
        setBadges({
          pendingPayments: pay?.count || 0,
          lowStock: inv?.count || 0,
          pendingReviews: rev?.count || 0,
        });
      })
      .catch((err) => {
        addToast(err.message, "error");
      });
  }, [currentPage, call, setBadges, addToast]);

  const pages = {
    dashboard: <DashboardPage />,
    orders: <OrdersPage />,
    payments: <PaymentsPage />,
    products: <ProductsPage />,
    categories: <CategoriesPage />,
    inventory: <InventoryPage />,
    reviews: <ReviewsPage />,
  };

  return (
    <div className="layout">
      <Sidebar user={user} logout={logout} />
      <main className="main">
        <Topbar title={PAGE_TITLES[currentPage]} />
        <div className="content">{pages[currentPage]}</div>
      </main>
    </div>
  );
}
