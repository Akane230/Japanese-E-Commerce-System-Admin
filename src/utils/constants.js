export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "Dashboard" },
  { key: "orders", label: "Orders", icon: "Orders" },
  // {
  //   key: "payments",
  //   label: "Payments",
  //   icon: "Payments",
  //   badgeKey: "pendingPayments",
  // },
  { key: "products", label: "Products", icon: "Products" },
  { key: "categories", label: "Categories", icon: "Categories" },
  {
    key: "inventory",
    label: "Inventory",
    icon: "Inventory",
    badgeKey: "lowStock",
    badgeColor: "gold",
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: "Reviews",
    badgeKey: "pendingReviews",
  },
];

export const PAGE_TITLES = {
  dashboard: "Dashboard",
  orders: "Orders",
  payments: "Payment Queue",
  products: "Products",
  categories: "Categories",
  inventory: "Inventory",
  reviews: "Review Moderation",
};

export const ORDER_STATUSES = [
  "pending",
  "payment_pending",
  "paid",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];
