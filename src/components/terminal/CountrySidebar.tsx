import { useState, useMemo } from "react";
import { useCountries } from "@/hooks/use-worldbank";
import { REGIONS, INCOME_GROUPS } from "@/lib/worldbank-api";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CountrySidebarProps {
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
  comparisonCountries: string[];
  onToggleComparison: (code: string) => void;
}

export function CountrySidebar({
  selectedCountry,
  onSelectCountry,
  comparisonCountries,
  onToggleComparison,
}: CountrySidebarProps) {
  const { data: countries, isLoading } = useCountries();
  const [search, setSearch] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(["NAC"]));
  const [groupBy, setGroupBy] = useState<"region" | "income">("region");

  const filtered = useMemo(() => {
    if (!countries) return [];
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const grouped = useMemo(() => {
    const groups = groupBy === "region" ? REGIONS : INCOME_GROUPS;
    return groups.map((g) => ({
      ...g,
      countries: filtered.filter((c) =>
        groupBy === "region" ? c.region.id === g.code : c.incomeLevel.id === g.code
      ),
    }));
  }, [filtered, groupBy]);

  const toggleRegion = (code: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-card border-r border-border">
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-1 bg-secondary rounded px-2 py-1">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter..."
            className="flex-1 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex mt-1 gap-1">
          <button
            onClick={() => setGroupBy("region")}
            className={`text-[10px] px-2 py-0.5 rounded ${
              groupBy === "region" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            REGION
          </button>
          <button
            onClick={() => setGroupBy("income")}
            className={`text-[10px] px-2 py-0.5 rounded ${
              groupBy === "income" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            INCOME
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-2 text-muted-foreground text-[11px]">Loading countries...</div>
        ) : (
          <div className="py-1">
            {grouped.map((group) => (
              <div key={group.code}>
                <button
                  onClick={() => toggleRegion(group.code)}
                  className="w-full flex items-center px-2 py-1 text-[10px] font-bold text-terminal-amber hover:bg-secondary"
                >
                  {expandedRegions.has(group.code) ? (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1" />
                  )}
                  {group.name}
                  <span className="ml-auto text-muted-foreground font-normal">
                    {group.countries.length}
                  </span>
                </button>
                {expandedRegions.has(group.code) &&
                  group.countries.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center px-2 py-0.5 pl-5 cursor-pointer text-[11px] hover:bg-secondary ${
                        selectedCountry === c.id ? "bg-secondary text-terminal-green font-semibold" : "text-foreground"
                      }`}
                    >
                      <button
                        onClick={() => onSelectCountry(c.id)}
                        className="flex-1 text-left truncate"
                      >
                        <span className="text-terminal-cyan mr-1">{c.id}</span>
                        {c.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComparison(c.id);
                        }}
                        className={`text-[9px] px-1 rounded ${
                          comparisonCountries.includes(c.id)
                            ? "bg-terminal-amber text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Toggle comparison"
                      >
                        CMP
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {comparisonCountries.length > 0 && (
        <div className="border-t border-border p-2">
          <div className="text-[10px] text-terminal-amber font-bold mb-1">COMPARING</div>
          <div className="flex flex-wrap gap-1">
            {comparisonCountries.map((code) => (
              <span
                key={code}
                className="text-[10px] bg-secondary text-terminal-cyan px-1.5 py-0.5 rounded cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onToggleComparison(code)}
              >
                {code} ×
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
