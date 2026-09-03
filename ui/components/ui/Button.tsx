import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6f4e37] focus:ring-offset-2 focus:ring-offset-[#f8f5f0] disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    primary:
      "bg-[#6f4e37] hover:bg-[#3d2b1f] text-[#f8f5f0] shadow-sm active:translate-y-px",
    secondary:
      "bg-[#ebe5d8] hover:bg-[#dfd5c3] text-[#3d2b1f] border border-[#c4a484]/70 active:translate-y-px",
    outline:
      "border border-[#c4a484] bg-transparent hover:bg-[#ebe5d8]/70 text-[#3d2b1f] active:translate-y-px",
    danger:
      "bg-[#822424] hover:bg-[#681919] text-[#f8f5f0] shadow-sm active:translate-y-px",
    ghost:
      "text-[#6f4e37] hover:bg-[#ebe5d8]/60 hover:text-[#3d2b1f]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs h-8 gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm h-9 gap-2",
    lg: "px-5 py-2.5 text-sm h-11 gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
