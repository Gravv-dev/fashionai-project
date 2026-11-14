"use client";

import { useCallback } from "react";
import { toast, type ToastProps, type ToastData } from "@/components/ui/toast";

export function useToast() {
  const toastFn = useCallback(
    (props: ToastProps, data?: ToastData) => toast(props, data),
    []
  );

  return { toast: toastFn };
}
