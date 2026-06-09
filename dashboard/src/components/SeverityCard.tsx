interface Props {
  label: string;
  count: number;
  color: string;
}

const colorMap: Record<string, string> = {
  critical: "border-critical bg-critical/10",
  high: "border-high bg-high/10",
  medium: "border-medium bg-medium/10",
  low: "border-low bg-low/10",
  info: "border-info bg-info/10",
};

const textMap: Record<string, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  info: "text-info",
};

export function SeverityCard({ label, count, color }: Props) {
  return (
    <div className={`rounded-lg border ${colorMap[color] || "border-gray-700 bg-gray-800"} p-4`}>
      <div className={`text-3xl font-bold ${textMap[color] || "text-white"}`}>{count}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}
