import React from "react";
import { cn } from "@/lib/utils";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("bg-white rounded-lg border border-[#c4a484]/35 shadow-card p-4 sm:p-5 text-[#3d2b1f]", className)} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("mb-3 flex flex-col space-y-1", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn("text-sm sm:text-base font-semibold tracking-tight text-[#3d2b1f]", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn("text-xs text-[#6f4e37]/80 leading-relaxed", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("pt-0", className)} {...props}>
    {children}
  </div>
);
