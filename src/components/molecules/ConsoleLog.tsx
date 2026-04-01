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
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-zinc-400",
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
        className={cn(
          "h-[200px] md:h-[260px] overflow-y-auto rounded-lg p-3",
          "bg-[#0c100d] border border-sena-green/20",
          "font-mono text-[10px] md:text-xs leading-relaxed",
          /* scrollbar */
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-sena-green/20",
          "[&::-webkit-scrollbar-thumb:hover]:bg-sena-green/40"
        )}
      >
        {logs.length === 0 ? (
          <span className="text-sena-green/30 flex items-center gap-1.5">
            <span className="animate-pulse">▋</span>
            <span>Esperando actividad del sensor...</span>
          </span>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className="flex gap-1.5 hover:bg-white/[0.03] px-0.5 rounded">
              <span className="text-zinc-600 flex-shrink-0 tabular-nums">
                [{entry.timestamp}]
              </span>
              <span className={cn("flex-shrink-0 font-semibold", typeColors[entry.type])}>
                {typePrefixes[entry.type]}
              </span>
              <span className={cn(typeColors[entry.type], "opacity-90")}>
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800/80 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 cursor-pointer"
          title="Limpiar consola"
        >
          <X className="w-3 h-3 text-zinc-400" />
        </button>
      )}
    </div>
  );
}
