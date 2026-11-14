"use client";

import { Toaster, toast as sonnerToast } from "sonner";

type ToastProps = Parameters<typeof sonnerToast>[0];
type ToastData = Parameters<typeof sonnerToast>[1];

export { Toaster };
export function toast(message: ToastProps, data?: ToastData) {
  return sonnerToast(message, data);
}
export type { ToastProps, ToastData };
