"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@/components/ui/Icons";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={twMerge(
      clsx(
        "fixed inset-0 z-50 bg-black/50 transition-opacity animate-in fade-in-0 duration-200",
        className
      )
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  isDestructive?: boolean;
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, isDestructive = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={twMerge(
        clsx(
          "fixed z-50 w-full border border-border bg-surface p-5 sm:p-6 duration-200 focus:outline-none",
          isDestructive
            ? "left-[50%] top-[50%] max-w-md w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-card animate-in fade-in-0 zoom-in-95 shadow-none"
            : "left-0 right-0 bottom-0 md:left-[50%] md:top-[50%] md:bottom-auto md:max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] rounded-t-2xl md:rounded-card animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:fade-in-0 md:zoom-in-95 max-h-[85vh] overflow-y-auto pb-safe shadow-none",
          className
        )
      )}
      {...props}
    >
      {!isDestructive && (
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3 md:hidden shrink-0" aria-hidden="true" />
      )}
      {children}
      <DialogPrimitive.Close className="absolute right-3.5 top-3.5 rounded-control opacity-70 hover:opacity-100 transition-opacity p-2 text-text-muted hover:text-text focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={twMerge("text-lg font-semibold leading-none tracking-tight text-text", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={twMerge("text-sm text-text-muted mt-1 leading-normal", className)}
      {...props}
    />
  );
}
