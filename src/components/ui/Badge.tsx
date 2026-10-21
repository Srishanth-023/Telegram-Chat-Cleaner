import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "secondary", children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary-soft text-primary font-semibold",
    secondary: "bg-surface-muted text-text-muted border border-border",
    success: "bg-emerald-50 text-success border border-emerald-200",
    warning: "bg-amber-50 text-warning border border-amber-200",
    danger: "bg-danger-soft text-danger border border-red-200",
    outline: "border border-border text-text bg-transparent",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium select-none tracking-tight",
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
