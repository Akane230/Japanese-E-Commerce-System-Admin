import { create } from "zustand";

const useUIStore = create((set) => ({
  // Page state
  currentPage: "dashboard",

  // Badge counts
  badges: {
    pendingPayments: 0,
    lowStock: 0,
    pendingReviews: 0,
  },

  modals: {
    orderDetail: { isOpen: false, data: null },
    ship: { isOpen: false, data: null },
    paymentReview: { isOpen: false, data: null },
    refund: { isOpen: false, data: null },
    product: { isOpen: false, data: null },
    restock: { isOpen: false, data: null },
    reviewDetail: { isOpen: false, data: null },
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  setBadges: (badges) => set({ badges }),

  updateBadge: (key, value) =>
    set((state) => ({
      badges: { ...state.badges, [key]: value },
    })),

  openModal: (modalName, data = null) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: true, data },
      },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: false, data: null },
      },
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = { isOpen: false, data: null };
        return acc;
      }, {}),
    })),
}));

export const useCurrentPage = () => useUIStore((state) => state.currentPage);
export const useBadges = () => useUIStore((state) => state.badges);
export const useModal = (modalName) =>
  useUIStore((state) => state.modals[modalName]);

export default useUIStore;
