import { useQueries } from "@tanstack/react-query";
import { fetchLatestIndicatorMulti, formatValue, INDICATORS } from "@/lib/worldbank-api";
import type { WBIndicatorValue } from "@/lib/worldbank-api";

interface ComparisonTableProps {
  countryCodes: string[];
}

const COMPARISON_INDICATORS = [
  INDICATORS.economy.gdp,
  INDICATORS.economy.gdpGrowth,
  INDICATORS.economy.gdpPerCapita,
  INDICATORS.economy.inflation,
  INDICATORS.economy.unemployment,
  INDICATORS.demographics.population,
  INDICATORS.demographics.urbanPop,
  INDICATORS.health.lifeExpectancy,
  INDICATORS.health.infantMortality,
  INDICATORS.education.literacy,
  INDICATORS.environment.co2Emissions,
  INDICATORS.environment.electricityAccess,
  INDICATORS.infrastructure.internetUsers,
  INDICATORS.trade.exports,
  INDICATORS.trade.imports,
  INDICATORS.economy.fdi,
  INDICATORS.economy.debt,
  INDICATORS.demographics.fertilityRate,
  INDICATORS.health.healthExpenditure,
  INDICATORS.education.educationSpending,
];

export function ComparisonTable({ countryCodes }: ComparisonTableProps) {
  // One query per indicator (batching all countries in one request)
  const queries = useQueries({
    queries: COMPARISON_INDICATORS.map((ind) => ({
      queryKey: ["wb-compare", countryCodes.join(","), ind.code],
      queryFn: () => fetchLatestIndicatorMulti(countryCodes, ind.code),
      staleTime: 60 * 60 * 1000,
      enabled: countryCodes.length > 0,
    })),
  });

  // Lookup: find value for a country in the multi-country result
  const getValue = (indicatorIdx: number, countryCode: string) => {
    const q = queries[indicatorIdx];
    if (!q || q.isLoading) return { loading: true, value: null };
    const results = q.data as WBIndicatorValue[] | undefined;
    if (!results) return { loading: false, value: null };
    const match = results.find(
      (d) => (d.countryiso3code === countryCode || d.country?.id === countryCode) && d.value !== null
    );
    return { loading: false, value: match?.value ?? null };
  };

  if (countryCodes.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center px-2 py-1 border-b border-border bg-secondary">
          <span className="text-[10px] font-bold text-terminal-amber tracking-wider">COMPARISON</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-[11px]">
          Select countries using CMP button to compare
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center px-2 py-1 border-b border-border bg-secondary flex-shrink-0">
        <span className="text-[10px] font-bold text-terminal-amber tracking-wider">COMPARISON</span>
        <span className="text-[10px] text-muted-foreground ml-2">
          {countryCodes.join(" vs ")}
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="text-left px-2 py-1 text-muted-foreground font-normal sticky left-0 bg-card z-20 whitespace-nowrap">
                Indicator
              </th>
              {countryCodes.map((cc) => (
                <th key={cc} className="text-right px-2 py-1 text-terminal-cyan font-bold whitespace-nowrap min-w-[90px]">
                  {cc}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_INDICATORS.map((ind, indIdx) => (
              <tr key={ind.code} className="border-b border-border hover:bg-secondary">
                <td className="px-2 py-1 text-muted-foreground whitespace-nowrap sticky left-0 bg-card">
                  {ind.label}
                </td>
                {countryCodes.map((cc) => {
                  const { loading, value } = getValue(indIdx, cc);
                  return (
                    <td key={cc} className="text-right px-2 py-1 font-mono whitespace-nowrap">
                      {loading ? (
                        <span className="text-muted-foreground animate-pulse">---</span>
                      ) : (
                        <span className="text-foreground">
                          {formatValue(value, ind.format)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
