"use client";

import * as React from "react";
import PhoneInputPrimitive from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import type { E164Number } from "libphonenumber-js";

// Extracted outside render, so it's a stable reference — prevents remount on every keystroke
const CustomInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function CustomInput({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      dir="ltr"
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...rest}
    />
  );
});

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, placeholder, disabled, ...props }, ref) => {
    return (
      <PhoneInputPrimitive
        international
        defaultCountry="SA"
        value={(value as E164Number) || ""}
        onChange={(val) => onChange(val || "")}
        placeholder={placeholder || "+966 5X XXX XXXX"}
        disabled={disabled}
        inputComponent={CustomInput}
        className={cn("flex items-center gap-2", className)}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
