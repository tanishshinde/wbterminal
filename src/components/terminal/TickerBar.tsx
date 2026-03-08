import { useTickerData } from "@/hooks/use-worldbank";
import { formatValue } from "@/lib/worldbank-api";

export function TickerBar() {
  const { data: tickerData, isLoading } = useTickerData();

  if (isLoading || !tickerData) {
    return (
      <div className="h-6 bg-secondary border-b border-border flex items-center overflow-hidden">
        <span className="text-muted-foreground text-[11px] px-4 animate-pulse">
          LOADING GLOBAL DATA FEED...
        </span>
      </div>
    );
  }

  const items = tickerData.filter((t: any) => t.value !== null);

  return (
    <div className="h-6 bg-secondary border-b border-border flex items-center overflow-hidden">
      <div className="flex-shrink-0 bg-primary text-primary-foreground px-2 text-[10px] font-bold tracking-wider h-full flex items-center">
        LIVE
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...items, ...items].map((item: any, i: number) => (
            <span key={i} className="inline-flex items-center mx-4 text-[11px]">
              <span className="text-terminal-amber font-semibold">{item.label}</span>
              <span className="mx-1 text-muted-foreground">|</span>
              <span className={`font-bold ${item.value >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                {typeof item.value === "number"
                  ? item.code.includes("ZG") || item.code.includes("ZS")
                    ? `${item.value.toFixed(2)}%`
                    : formatValue(item.value, "number")
                  : "N/A"}
              </span>
              {item.date && (
                <span className="text-muted-foreground text-[10px] ml-1">({item.date})</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
