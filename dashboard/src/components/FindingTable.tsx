import { Finding } from "@/data/types";

interface Props {
  findings: Finding[];
}

const severityColors: Record<string, string> = {
  Critical: "bg-red-600",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
  Informational: "bg-blue-500",
};

export function FindingTable({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No findings match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 uppercase text-xs tracking-wider">
            <th className="text-left py-3 px-2">ID</th>
            <th className="text-left py-3 px-2">Severity</th>
            <th className="text-left py-3 px-2">Title</th>
            <th className="text-left py-3 px-2">Category</th>
            <th className="text-left py-3 px-2">File</th>
            <th className="text-right py-3 px-2">Line</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => (
            <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
              <td className="py-3 px-2 font-mono text-xs text-gray-500">{f.id}</td>
              <td className="py-3 px-2">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${severityColors[f.severity] || "bg-gray-600"}`}>
                  {f.severity}
                </span>
              </td>
              <td className="py-3 px-2 font-medium">{f.title}</td>
              <td className="py-3 px-2 text-gray-400">{f.category}</td>
              <td className="py-3 px-2 text-gray-400 font-mono text-xs">{f.file}</td>
              <td className="py-3 px-2 text-right text-gray-500 font-mono text-xs">{f.line}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
