import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertTriangle } from "./Icons";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, errorMessage, mono = false, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={twMerge(
              clsx(
                "w-full h-10 px-3 py-2 bg-surface border rounded-control text-sm text-text placeholder:text-text-muted transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                mono && "font-mono tracking-tight",
                errorMessage
                  ? "border-danger focus:ring-danger"
                  : "border-border hover:border-slate-300",
                disabled && "opacity-50 cursor-not-allowed bg-surface-muted",
                className
              )
            )}
            {...props}
          />
        </div>
        {errorMessage ? (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {errorMessage}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
