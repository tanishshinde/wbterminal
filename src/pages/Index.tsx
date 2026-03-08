import { useState, useCallback, useMemo } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TickerBar } from "@/components/terminal/TickerBar";
import { CommandBar } from "@/components/terminal/CommandBar";
import { CountrySidebar } from "@/components/terminal/CountrySidebar";
import { CountryOverview } from "@/components/terminal/CountryOverview";
import { TimeSeriesChart } from "@/components/terminal/TimeSeriesChart";
import { ComparisonTable } from "@/components/terminal/ComparisonTable";
import { ThematicPanel } from "@/components/terminal/ThematicPanel";
import { useCountries } from "@/hooks/use-worldbank";

const Index = () => {
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [comparisonCountries, setComparisonCountries] = useState<string[]>(["USA", "CHN", "IND"]);
  const { data: countries } = useCountries();

  const countryName = useMemo(() => {
    return countries?.find((c) => c.id === selectedCountry)?.name || selectedCountry;
  }, [countries, selectedCountry]);

  const handleToggleComparison = useCallback((code: string) => {
    setComparisonCountries((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= 5) return prev;
      return [...prev, code];
    });
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query || !countries) return;
      const q = query.trim().toUpperCase();
      const match = countries.find(
        (c) => c.id === q || c.name.toUpperCase().includes(q) || c.iso2Code?.toUpperCase() === q
      );
      if (match) {
        setSelectedCountry(match.id);
      }
      return !!match;
    },
    [countries]
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <CommandBar onSearch={handleSearch} />
      <TickerBar />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Country Sidebar */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
            <CountrySidebar
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              comparisonCountries={comparisonCountries}
              onToggleComparison={handleToggleComparison}
            />
          </ResizablePanel>
          <ResizableHandle />

          {/* Main Content */}
          <ResizablePanel defaultSize={85}>
            <ResizablePanelGroup direction="vertical">
              {/* Top Row: Overview + Chart */}
              <ResizablePanel defaultSize={45} minSize={25}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={45} minSize={25}>
                    <div className="h-full overflow-hidden border-b border-border">
                      <CountryOverview countryCode={selectedCountry} countryName={countryName} />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={55} minSize={30}>
                    <div className="h-full overflow-hidden border-b border-border">
                      <TimeSeriesChart countryCode={selectedCountry} />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle />

              {/* Bottom Row: Comparison + Thematic */}
              <ResizablePanel defaultSize={55} minSize={25}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={50} minSize={25}>
                    <div className="h-full overflow-hidden">
                      <ComparisonTable countryCodes={comparisonCountries} />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={50} minSize={25}>
                    <div className="h-full overflow-hidden">
                      <ThematicPanel countryCode={selectedCountry} />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-5 bg-secondary border-t border-border flex items-center px-2 text-[10px] gap-4">
        <span className="text-terminal-green">● CONNECTED</span>
        <span className="text-muted-foreground">SOURCE: api.worldbank.org/v2</span>
        <span className="text-muted-foreground">SELECTED: {selectedCountry}</span>
        <span className="text-muted-foreground">COMPARING: {comparisonCountries.length} countries</span>
        <span className="ml-auto text-muted-foreground">World Bank Open Data Terminal v1.0</span>
      </div>
    </div>
  );
};

export default Index;
