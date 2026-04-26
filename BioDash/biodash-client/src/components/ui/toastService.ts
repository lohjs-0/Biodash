import type { ToastType } from "./Toast";

export let addToastFn: ((message: string, type: ToastType) => void) | null =
  null;

export function setAddToastFn(
  fn: ((message: string, type: ToastType) => void) | null,
) {
  addToastFn = fn;
}

export function toast(message: string, type: ToastType = "success") {
  addToastFn?.(message, type);
}
