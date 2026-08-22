"use client";

import {
  API_LOADING_INTERVAL_MS,
  API_LOADING_MESSAGES,
} from "@/lib/api-loading-messages";
import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export type ApiLoadingToastMode = "dismiss" | "replace";

const DEFAULT_TOAST_ID = "api-loading";

type UseApiLoadingToastOptions = {
  messages?: readonly string[];
  intervalMs?: number;
  mode?: ApiLoadingToastMode;
  toastId?: string;
};

export function useApiLoadingToast(options?: UseApiLoadingToastOptions) {
  const messages = options?.messages ?? API_LOADING_MESSAGES;
  const intervalMs = options?.intervalMs ?? API_LOADING_INTERVAL_MS;
  const mode = options?.mode ?? "replace";
  const toastId = options?.toastId ?? DEFAULT_TOAST_ID;

  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearRotation();
    indexRef.current = 0;
    toast.loading(messages[0], { id: toastId });

    intervalRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % messages.length;
      toast.loading(messages[indexRef.current], { id: toastId });
    }, intervalMs);
  }, [clearRotation, intervalMs, messages, toastId]);

  const success = useCallback(
    (message: string) => {
      clearRotation();
      if (mode === "dismiss") {
        toast.dismiss(toastId);
        toast.success(message);
      } else {
        toast.success(message, { id: toastId });
      }
    },
    [clearRotation, mode, toastId]
  );

  const error = useCallback(
    (message: string) => {
      clearRotation();
      if (mode === "dismiss") {
        toast.dismiss(toastId);
        toast.error(message);
      } else {
        toast.error(message, { id: toastId });
      }
    },
    [clearRotation, mode, toastId]
  );

  const dismiss = useCallback(() => {
    clearRotation();
    toast.dismiss(toastId);
  }, [clearRotation, toastId]);

  useEffect(() => clearRotation, [clearRotation]);

  return { start, success, error, dismiss };
}
