import { create } from "zustand";

const useToastStore = create((set) => ({
  toasts: [],

  addToast: (msg, type = "success") => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, msg, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3200);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),
}));

export default useToastStore;
