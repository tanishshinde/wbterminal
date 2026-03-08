import { useLatestIndicator } from "@/hooks/use-worldbank";
import { INDICATORS, formatValue } from "@/lib/worldbank-api";

interface CountryOverviewProps {
  countryCode: string;
  countryName: string;
}

const KEY_STATS = [
  { ...INDICATORS.economy.gdp, key: "gdp" },
  { ...INDICATORS.economy.gdpGrowth, key: "gdpGrowth" },
  { ...INDICATORS.economy.gdpPerCapita, key: "gdpPerCapita" },
  { ...INDICATORS.economy.gniPerCapita, key: "gniPerCapita" },
  { ...INDICATORS.economy.inflation, key: "inflation" },
  { ...INDICATORS.economy.unemployment, key: "unemployment" },
  { ...INDICATORS.demographics.population, key: "population" },
  { ...INDICATORS.demographics.urbanPop, key: "urbanPop" },
  { ...INDICATORS.demographics.popGrowth, key: "popGrowth" },
  { ...INDICATORS.health.lifeExpectancy, key: "lifeExpectancy" },
  { ...INDICATORS.health.infantMortality, key: "infantMortality" },
  { ...INDICATORS.education.literacy, key: "literacy" },
  { ...INDICATORS.environment.co2Emissions, key: "co2" },
  { ...INDICATORS.infrastructure.internetUsers, key: "internet" },
  { ...INDICATORS.trade.exports, key: "exports" },
  { ...INDICATORS.trade.imports, key: "imports" },
];

function StatCell({ countryCode, indicator }: { countryCode: string; indicator: typeof KEY_STATS[0] }) {
  const { data, isLoading } = useLatestIndicator(countryCode, indicator.code);

  const value = data?.value;
  const isPositive = indicator.key === "gdpGrowth" || indicator.key === "popGrowth"
    ? (value ?? 0) > 0
    : undefined;

  return (
    <div className="bg-secondary border border-border rounded p-1.5">
      <div className="text-[9px] text-muted-foreground truncate mb-0.5">{indicator.label}</div>
      {isLoading ? (
        <div className="text-[11px] text-muted-foreground animate-pulse">---</div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span
            className={`text-[13px] font-bold ${
              isPositive === true
                ? "text-terminal-green"
                : isPositive === false
                ? "text-terminal-red"
                : "text-foreground"
            }`}
          >
            {formatValue(value, indicator.format)}
          </span>
          {data?.date && (
            <span className="text-[9px] text-muted-foreground">{data.date}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function CountryOverview({ countryCode, countryName }: CountryOverviewProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-terminal-amber tracking-wider">OVERVIEW</span>
          <span className="text-[12px] font-bold text-terminal-green">{countryCode}</span>
          <span className="text-[11px] text-foreground">{countryName}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-2">
        <div className="grid grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-1">
          {KEY_STATS.map((stat) => (
            <StatCell key={stat.key} countryCode={countryCode} indicator={stat} />
          ))}
        </div>
      </div>
    </div>
  );
}
