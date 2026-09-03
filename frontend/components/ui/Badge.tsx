import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "outline" | "secondary";
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = "neutral", ...props }) => {
  const variants = {
    success: "bg-[#eef3ee] text-[#295030] border-[#295030]/25 font-semibold",
    warning: "bg-[#faf3e8] text-[#7d5017] border-[#7d5017]/25 font-semibold",
    danger: "bg-[#f9ecec] text-[#822424] border-[#822424]/25 font-semibold",
    info: "bg-[#ebe5d8] text-[#6f4e37] border-[#c4a484]/50 font-semibold",
    neutral: "bg-[#ebe5d8] text-[#3d2b1f] border-[#c4a484]/40",
    outline: "bg-transparent text-[#3d2b1f] border-[#c4a484]",
    secondary: "bg-[#f8f5f0] text-[#6f4e37] border-[#c4a484]/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
