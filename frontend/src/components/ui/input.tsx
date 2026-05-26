import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-[#EBEBEB] bg-white px-4 py-2 text-sm text-[#222222] shadow-sm transition-all placeholder:text-[#717171] focus-visible:border-[#222222] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#222222] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
