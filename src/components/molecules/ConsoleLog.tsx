"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/types/serial";

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
  className?: string;
}

const typeColors: Record<LogEntry["type"], string> = {
  tx: "text-sena-yellow",
  rx: "text-sena-cyan",
  success: "text-sena-green",
  error: "text-destructive",
  warning: "text-sena-yellow",
  info: "text-muted-foreground",
};

const typePrefixes: Record<LogEntry["type"], string> = {
  tx: "TX →",
  rx: "RX ←",
  success: " OK ",
  error: "ERR ",
  warning: "WARN",
  info: "    ",
};

export function ConsoleLog({ logs, onClear, className }: ConsoleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={cn("relative group", className)}>
      <div
        ref={scrollRef}
        className="h-[200px] md:h-[260px] overflow-y-auto rounded-lg p-3 bg-background border border-border font-mono text-[10px] md:text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <span className="text-muted-foreground/40">
            {"// Esperando actividad del sensor..."}
          </span>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className="flex gap-1.5">
              <span className="text-muted-foreground/50 flex-shrink-0">
                [{entry.timestamp}]
              </span>
              <span className={cn("flex-shrink-0", typeColors[entry.type])}>
                {typePrefixes[entry.type]}
              </span>
              <span className={typeColors[entry.type]}>{entry.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Botón limpiar */}
      {logs.length > 0 && (
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1 rounded-md bg-muted/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer"
          title="Limpiar consola"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
