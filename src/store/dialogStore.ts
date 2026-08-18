import { create } from 'zustand';

export type DialogVariant = 'danger' | 'primary' | 'info';

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
};

export type AlertDialogOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: DialogVariant;
};

type ConfirmState = ConfirmDialogOptions & {
  mode: 'confirm';
  resolve: (value: boolean) => void;
};

type AlertState = AlertDialogOptions & {
  mode: 'alert';
  resolve: () => void;
};

type DialogState = {
  active: ConfirmState | AlertState | null;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
  close: () => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  active: null,

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        active: {
          mode: 'confirm',
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel ?? 'Confirm',
          cancelLabel: options.cancelLabel ?? 'Cancel',
          variant: options.variant ?? 'danger',
          resolve,
        },
      });
    }),

  alert: (options) =>
    new Promise<void>((resolve) => {
      set({
        active: {
          mode: 'alert',
          title: options.title ?? 'Notice',
          message: options.message,
          confirmLabel: options.confirmLabel ?? 'OK',
          variant: options.variant ?? 'info',
          resolve,
        },
      });
    }),

  close: () => set({ active: null }),
}));

/** Promise-based confirm — works outside React components via getState(). */
export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return useDialogStore.getState().confirm(options);
}

/** Promise-based alert dialog — prefer notifyError for transient failures. */
export function alertDialog(options: AlertDialogOptions): Promise<void> {
  return useDialogStore.getState().alert(options);
}
