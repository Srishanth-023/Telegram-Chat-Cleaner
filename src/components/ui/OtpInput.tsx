"use client";

import React, { useRef, useEffect } from "react";
import { clsx } from "clsx";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  className?: string;
}

export function OtpInput({
  length = 5,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  hasError = false,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of digits from value, padded with empty strings
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const handleDigitChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawChar = e.target.value.replace(/\D/g, "");
    if (!rawChar) {
      // Cleared
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    // Take the last entered character if multiple
    const char = rawChar.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange(combined);

    // Auto-advance to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    onChange(pasted);

    // Focus either the box matching pasted length or last box
    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div
      className={clsx("flex items-center justify-center gap-2 sm:gap-3 py-2", className)}
      role="group"
      aria-label="5-digit Telegram verification code"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={digits[index]}
          onChange={(e) => handleDigitChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={clsx(
            "w-12 h-14 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-control border bg-surface text-text transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent select-all",
            hasError
              ? "border-danger focus:ring-danger text-danger bg-danger-soft/20"
              : "border-border hover:border-slate-400",
            disabled && "opacity-50 cursor-not-allowed bg-surface-muted"
          )}
        />
      ))}
    </div>
  );
}
