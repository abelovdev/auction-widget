import Toastify from 'toastify-js';
export type ToastTone = 'info' | 'success' | 'error';

const MAX_TOASTS = 3;

/**
 * Triggers a top-center Toastify notification matching §3.5 spec.
 */
export const showToast = (message: string, tone: ToastTone = 'info'): void => {
  // Get all active toasts
  const activeToasts = document.querySelectorAll('.toastify');

  // Remove oldest toast if limit reached
  if (activeToasts.length >= MAX_TOASTS) {
    activeToasts[0].remove();
  }

  Toastify({
    text: message,
    duration: 6000,
    gravity: 'top',
    position: 'center',
    className: `toastify etc-toast--${tone}`,
    ariaLive: 'polite',
  }).showToast();
};
