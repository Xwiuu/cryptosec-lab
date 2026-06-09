"use client";

import dynamic from "next/dynamic";
import { CodeBlock } from "./CodeBlock";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--color-border-primary)] bg-black/40 p-4 text-xs text-[var(--color-text-muted)]">
      Loading code viewer...
    </div>
  ),
});

export function ContractCodeViewer({
  code,
  language = "solidity",
  highlightLines,
}: {
  code: string;
  language?: string;
  highlightLines?: number[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border-primary)] bg-black/40">
      <div className="border-b border-[var(--color-border-primary)] bg-black/20 px-4 py-2">
        <span className="font-mono text-xs text-[var(--color-text-muted)]">Solidity</span>
      </div>
      <div className="hidden min-h-[420px] md:block">
        <MonacoEditor
          height="420px"
          language={language}
          theme="vs-dark"
          value={code}
          options={{
            automaticLayout: true,
            contextmenu: false,
            domReadOnly: true,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            lineNumbersMinChars: 3,
            minimap: { enabled: false },
            readOnly: true,
            renderLineHighlight: "line",
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>
      <CodeBlock code={code} language="Solidity" highlightLines={highlightLines} className="md:hidden border-0 rounded-none" />
    </div>
  );
}
