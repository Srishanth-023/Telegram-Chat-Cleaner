import React from "react";
import { Check } from "@/components/ui/Icons";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export function Stepper({ steps, currentStepIndex, className }: StepperProps) {
  return (
    <div className={twMerge("w-full py-4 select-none", className)}>
      <div className="flex items-start justify-between relative">
        {/* Track Line from center of first step to center of last step */}
        <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-border z-0 pointer-events-none">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200",
                  isCompleted && "bg-primary border-primary text-white",
                  isCurrent && "bg-surface border-primary text-primary font-bold ring-2 ring-primary/25",
                  !isCompleted && !isCurrent && "bg-surface border-border text-text-muted"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
              </div>
              <span
                className={clsx(
                  "mt-2 text-xs font-medium tracking-tight whitespace-nowrap hidden sm:block",
                  isCurrent ? "text-primary font-semibold" : "text-text-muted"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
