import useUIStore from "../stores/uiStore";

export function useModal(modalName) {
  const modal = useUIStore((state) => state.modals[modalName]);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    isOpen: modal?.isOpen || false,
    data: modal?.data || null,
    open: (data) => openModal(modalName, data),
    close: () => closeModal(modalName),
  };
}
