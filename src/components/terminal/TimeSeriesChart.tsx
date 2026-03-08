import { useState, useMemo } from "react";
import { useIndicatorData } from "@/hooks/use-worldbank";
import { INDICATORS, ALL_INDICATORS, formatValue } from "@/lib/worldbank-api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TimeSeriesChartProps {
  countryCode: string;
}

const QUICK_INDICATORS = [
  { code: INDICATORS.economy.gdpGrowth.code, label: "GDP Growth", format: "percent" },
  { code: INDICATORS.economy.gdp.code, label: "GDP", format: "currency" },
  { code: INDICATORS.demographics.population.code, label: "Population", format: "number" },
  { code: INDICATORS.economy.inflation.code, label: "Inflation", format: "percent" },
  { code: INDICATORS.health.lifeExpectancy.code, label: "Life Exp.", format: "number" },
  { code: INDICATORS.environment.co2Emissions.code, label: "CO2/capita", format: "number" },
  { code: INDICATORS.infrastructure.internetUsers.code, label: "Internet %", format: "percent" },
  { code: INDICATORS.trade.exports.code, label: "Exports", format: "currency" },
];

export function TimeSeriesChart({ countryCode }: TimeSeriesChartProps) {
  const [selectedIndicator, setSelectedIndicator] = useState(QUICK_INDICATORS[0]);
  const { data: rawData, isLoading } = useIndicatorData(countryCode, selectedIndicator.code);

  const chartData = useMemo(() => {
    if (!rawData) return [];
    return rawData
      .filter((d) => d.value !== null)
      .map((d) => ({ year: d.date, value: d.value! }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [rawData]);

  const indicatorMeta = ALL_INDICATORS.find((i) => i.code === selectedIndicator.code);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-secondary flex-wrap">
        <span className="text-[10px] font-bold text-terminal-amber tracking-wider mr-2">CHART</span>
        {QUICK_INDICATORS.map((ind) => (
          <button
            key={ind.code}
            onClick={() => setSelectedIndicator(ind)}
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              selectedIndicator.code === ind.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {ind.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 p-2 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-[11px]">
            Loading {selectedIndicator.label} data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-[11px]">
            No data available for {selectedIndicator.label}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 12%)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 45%)" }}
                axisLine={{ stroke: "hsl(220, 15%, 12%)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 45%)" }}
                axisLine={{ stroke: "hsl(220, 15%, 12%)" }}
                tickLine={false}
                tickFormatter={(v) => formatValue(v, selectedIndicator.format)}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 7%)",
                  border: "1px solid hsl(220, 15%, 15%)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "hsl(210, 20%, 80%)",
                }}
                formatter={(value: number) => [
                  formatValue(value, selectedIndicator.format),
                  indicatorMeta?.label || selectedIndicator.label,
                ]}
                labelStyle={{ color: "hsl(45, 90%, 55%)" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(142, 70%, 45%)"
                strokeWidth={1.5}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
