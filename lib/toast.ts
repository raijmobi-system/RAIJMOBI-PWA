export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Listener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
let listeners: Listener[] = [];
let nextId = 0;

const DEFAULT_DURATION = 4000;

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function show(message: string, variant: ToastVariant, duration = DEFAULT_DURATION) {
  const id = ++nextId;
  toasts = [...toasts, { id, message, variant }];
  emit();

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }

  return id;
}

function subscribe(listener: Listener) {
  listeners = [...listeners, listener];
  listener(toasts);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export const toast = {
  success: (message: string, duration?: number) => show(message, "success", duration),
  error: (message: string, duration?: number) => show(message, "error", duration),
  info: (message: string, duration?: number) => show(message, "info", duration),
  dismiss,
  subscribe,
};