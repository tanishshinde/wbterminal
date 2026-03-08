import { useState } from "react";
import { useLatestIndicator } from "@/hooks/use-worldbank";
import { INDICATORS, formatValue } from "@/lib/worldbank-api";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThematicPanelProps {
  countryCode: string;
}

const THEMES = [
  { key: "economy", label: "ECON", indicators: INDICATORS.economy },
  { key: "health", label: "HLTH", indicators: INDICATORS.health },
  { key: "education", label: "EDUC", indicators: INDICATORS.education },
  { key: "environment", label: "ENV", indicators: INDICATORS.environment },
  { key: "infrastructure", label: "INFRA", indicators: INDICATORS.infrastructure },
  { key: "demographics", label: "DEMO", indicators: INDICATORS.demographics },
  { key: "trade", label: "TRADE", indicators: INDICATORS.trade },
  { key: "poverty", label: "POVTY", indicators: INDICATORS.poverty },
] as const;

function IndicatorRow({
  countryCode,
  indicator,
}: {
  countryCode: string;
  indicator: { code: string; label: string; format: string };
}) {
  const { data, isLoading } = useLatestIndicator(countryCode, indicator.code);

  return (
    <tr className="border-b border-border hover:bg-secondary">
      <td className="px-2 py-1 text-muted-foreground text-[11px]">{indicator.label}</td>
      <td className="px-2 py-1 text-right font-mono text-[11px]">
        {isLoading ? (
          <span className="text-muted-foreground animate-pulse">---</span>
        ) : (
          <span className="text-foreground font-semibold">{formatValue(data?.value, indicator.format)}</span>
        )}
      </td>
      <td className="px-2 py-1 text-right text-[10px] text-muted-foreground">
        {data?.date || "—"}
      </td>
      <td className="px-2 py-1 text-[9px] text-terminal-dim font-mono">{indicator.code}</td>
    </tr>
  );
}

export function ThematicPanel({ countryCode }: ThematicPanelProps) {
  const [activeTheme, setActiveTheme] = useState<string>("economy");

  const theme = THEMES.find((t) => t.key === activeTheme)!;
  const indicators = Object.values(theme.indicators);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-secondary flex-wrap">
        <span className="text-[10px] font-bold text-terminal-amber tracking-wider mr-2">THEMES</span>
        {THEMES.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTheme(t.key)}
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              activeTheme === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ScrollArea className="flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-2 py-1 text-[10px] text-muted-foreground font-normal">Indicator</th>
              <th className="text-right px-2 py-1 text-[10px] text-muted-foreground font-normal">Value</th>
              <th className="text-right px-2 py-1 text-[10px] text-muted-foreground font-normal">Year</th>
              <th className="text-left px-2 py-1 text-[10px] text-muted-foreground font-normal">Code</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind) => (
              <IndicatorRow
                key={ind.code}
                countryCode={countryCode}
                indicator={ind}
              />
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
