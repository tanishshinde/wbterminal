import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface CommandBarProps {
  onSearch: (query: string) => boolean | void;
}

export function CommandBar({ onSearch }: CommandBarProps) {
  const [time, setTime] = useState(new Date());
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState<"success" | "error" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = onSearch(query);
    if (found) {
      setFlash("success");
      setQuery("");
    } else {
      setFlash("error");
    }
    setTimeout(() => setFlash(null), 600);
  };

  return (
    <div className="h-8 bg-card border-b border-border flex items-center px-2 gap-2">
      <span className="text-terminal-amber font-bold text-[11px] tracking-wider flex-shrink-0">
        WB TERMINAL
      </span>
      <div className="w-px h-4 bg-border" />
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <Search className={`w-3 h-3 mr-1 flex-shrink-0 transition-colors ${
          flash === "success" ? "text-terminal-green" : flash === "error" ? "text-terminal-red" : "text-muted-foreground"
        }`} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country... (e.g. USA, India, BRA)  ⌘K"
          className={`flex-1 bg-transparent text-foreground text-[11px] outline-none placeholder:text-muted-foreground transition-colors ${
            flash === "error" ? "text-terminal-red" : ""
          }`}
        />
        {flash === "error" && (
          <span className="text-[10px] text-terminal-red flex-shrink-0 mr-1">NOT FOUND</span>
        )}
      </form>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2 text-[10px] flex-shrink-0">
        <span className="text-terminal-cyan">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
        <span className="text-muted-foreground">
          {time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
