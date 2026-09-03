import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && <label className="text-xs font-medium text-[#3d2b1f]">{label}</label>}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-[#c4a484]/60 bg-[#f8f5f0] px-3 py-1.5 text-xs text-[#3d2b1f] placeholder:text-[#6f4e37]/50 focus:border-[#6f4e37] focus:outline-none focus:ring-1 focus:ring-[#6f4e37] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-[#822424] focus:border-[#822424] focus:ring-[#822424]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[#822424] font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
