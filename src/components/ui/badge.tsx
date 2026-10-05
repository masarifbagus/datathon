import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "gold" | "silver" | "bronze";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700",
    secondary: "bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50",
    warning: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700",
    destructive: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50",
    outline: "border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 bg-transparent",
    gold: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold border border-neutral-900 dark:border-white",
    silver: "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100 font-bold border border-neutral-300 dark:border-neutral-600",
    bronze: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold border border-neutral-300 dark:border-neutral-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
