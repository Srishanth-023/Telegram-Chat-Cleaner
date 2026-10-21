"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

interface ToastContextType {
  toast: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...msg, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => !open && removeToast(t.id)}
            duration={5000}
            className={twMerge(
              clsx(
                "group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-card p-4 shadow-lg border transition-all select-none",
                "bg-surface border-border text-text",
                t.variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
                t.variant === "danger" && "border-red-200 bg-red-50 text-red-900",
                t.variant === "warning" && "border-amber-200 bg-amber-50 text-amber-900"
              )
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.variant === "success" && <CheckCircle className="h-5 w-5 text-success" />}
              {t.variant === "danger" && <AlertCircle className="h-5 w-5 text-danger" />}
              {t.variant === "warning" && <AlertCircle className="h-5 w-5 text-warning" />}
              {(!t.variant || t.variant === "default") && <Info className="h-5 w-5 text-primary" />}
            </div>

            <div className="grid gap-1 flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold leading-tight">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs opacity-90 leading-normal">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>

            <ToastPrimitive.Close className="rounded-control p-1 opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
