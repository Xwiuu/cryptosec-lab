"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T extends object> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

export function DataTable<T extends object>({
  columns,
  data,
  className,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
}) {
  return (
    <div className={cn("max-w-full overflow-x-auto rounded-lg", className)}>
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-primary)]">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cn("px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider", col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-primary)]">
          {data.map((item, i) => (
            <tr
              key={i}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-[var(--color-bg-card-hover)] focus-visible:bg-[var(--color-bg-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)] focus-visible:ring-inset"
              )}
              onClick={() => onRowClick?.(item)}
              onKeyDown={(event) => {
                if (!onRowClick) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(item);
                }
              }}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-sm text-[var(--color-text-secondary)]", col.className)}>
                  {col.render ? col.render(item) : (item[col.key as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
