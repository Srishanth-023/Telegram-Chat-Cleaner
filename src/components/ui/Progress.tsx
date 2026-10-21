"use client";

import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={twMerge(
      clsx(
        "relative h-2 w-full overflow-hidden rounded-full bg-surface-muted border border-border",
        className
      )
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={twMerge(
        clsx(
          "h-full w-full flex-1 bg-primary transition-all duration-300 ease-out",
          indicatorClassName
        )
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = "Progress";
