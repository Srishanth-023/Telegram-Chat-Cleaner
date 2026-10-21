"use client";

import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "@/components/ui/Icons";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, id, ...props }, ref) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex items-start gap-2.5">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={twMerge(
          clsx(
            "peer h-5 w-5 shrink-0 rounded-[4px] border border-border bg-surface transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white",
            className
          )
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <div className="grid gap-0.5 leading-none select-none">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-text cursor-pointer leading-tight"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-text-muted leading-normal">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";
