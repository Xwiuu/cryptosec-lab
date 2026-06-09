"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  description?: string;
  className?: string;
  iconColor?: string;
}

export function AdminMetricCard({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  description,
  className,
  iconColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
}: AdminMetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/5 bg-[#111118] p-5 shadow-sm transition-all hover:border-white/10 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg border", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded",
              isPositive
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-rose-400 bg-rose-500/10"
            )}
          >
            {change}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-slate-400 line-clamp-1">
          {description}
        </p>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
