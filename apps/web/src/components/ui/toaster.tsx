"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg border text-sm animate-fade-in-up",
            toast.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-gray-200 text-gray-900"
          )}
        >
          <div className="flex-1">
            {toast.title && <p className="font-semibold">{toast.title}</p>}
            {toast.description && <p className="text-gray-600 mt-0.5">{toast.description}</p>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
