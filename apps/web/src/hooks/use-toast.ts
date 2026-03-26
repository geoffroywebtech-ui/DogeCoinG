"use client";

import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let externalToasts: Toast[] = [];
let externalSetToasts: ((toasts: Toast[]) => void) | null = null;

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast = { id, title, description, variant };
  externalToasts = [...externalToasts, newToast];
  externalSetToasts?.(externalToasts);

  // Auto-dismiss after 4s
  setTimeout(() => {
    externalToasts = externalToasts.filter((t) => t.id !== id);
    externalSetToasts?.(externalToasts);
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Register setter
  externalSetToasts = setToasts;

  const dismiss = useCallback((id: string) => {
    externalToasts = externalToasts.filter((t) => t.id !== id);
    setToasts([...externalToasts]);
  }, []);

  return { toasts, dismiss };
}
