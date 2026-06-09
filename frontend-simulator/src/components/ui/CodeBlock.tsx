"use client";

import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

export function CodeBlock({ code, language, highlightLines, className }: { code: string; language?: string; highlightLines?: number[]; className?: string }) {
  return (
    <div className={cn("relative bg-black/40 border border-[var(--color-border-primary)] rounded-xl overflow-hidden", className)}>
      {language && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-primary)] bg-black/20">
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{language}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs font-mono leading-relaxed text-[var(--color-text-secondary)]">
          {code.split("\n").map((line, i) => (
            <div key={i} className={cn("px-2 -mx-2", highlightLines?.includes(i + 1) && "bg-[var(--color-accent-red-bg)] border-l-2 border-[var(--color-accent-red)]")}>
              <span className="inline-block w-8 text-[var(--color-text-muted)] mr-4 text-right select-none">{i + 1}</span>
              {line || " "}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
