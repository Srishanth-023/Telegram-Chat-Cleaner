import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "danger" | "warning";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-surface border-border text-text shadow-sm",
    muted: "bg-surface-muted border-border text-text",
    danger: "bg-danger-soft border-red-200 text-danger",
    warning: "bg-warning-bg border-amber-200 text-warning",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "rounded-card border p-6 transition-all duration-150",
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
