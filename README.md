# Admin README

## Overview

The admin portal is a React app (via Vite) for store management: dashboard insights, order and payment review, product/category/inventory management, review moderation and operations.

## Tech Stack

- React with Vite
- Axios for backend API calls
- Zustand for state stores (`authStore`, `uiStore`, `toastStore`)
- CSS for layout (sidebar, topbar, modals)

## Key Modules

- `components/layout/AppRouter.jsx` controls auth gating (login or app shell)
- `components/layout/Shell.jsx` provides sidebar, topbar, and main content with page mapping
- `components/pages/` includes screens for Dashboard, Orders, Payments, Products, Categories, Inventory, Reviews
- `components/modals/` includes actions for order shipping, refunds, review actions, product/category forms
- `stores/authStore.js` handles login API flow and token storage

## API Services

- Auth: `api/auth/admin-login`, `logout`, `me`
- Dashboard metrics: `api/payments/admin/pending`, `api/inventory/low-stock`, `api/reviews/admin/pending`
- CRUD endpoints from the backend modules matching orders, payments, products, categories, inventory, reviews

## Setup

```bash
cd admin
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Admin session state is in Zustand and persists with token checks.
- `Shell` polls notification counts for badges when page updates.
- UI uses a sidebar and topbar plus modal dialogs for admin actions.
