import { useEffect } from 'react';

// Accessibility helper for modal dialogs: closes the modal when the user
// presses Escape, so the dialog is fully operable from the keyboard. Pair it
// with role="dialog" / aria-modal="true" on the modal element.
const useModalClose = (onClose) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
};

export default useModalClose;
