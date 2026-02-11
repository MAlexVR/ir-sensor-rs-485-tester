"use client";

import { cn } from "@/lib/utils";

interface SevenSegmentDisplayProps {
  value: number | null;
  unit?: string;
  className?: string;
}

/**
 * Display tipo 7-segmentos para temperatura.
 * Usa DSEG7 font con fallback a JetBrains Mono.
 * Muestra fondo tenue "888.88" como segments apagados.
 */
export function SevenSegmentDisplay({
  value,
  unit = "°C",
  className,
}: SevenSegmentDisplayProps) {
  const displayValue = value !== null ? value.toFixed(1) : "---.-";

  // Color basado en temperatura
  const getColor = (v: number | null) => {
    if (v === null) return "text-muted-foreground/60";
    if (v < 50) return "text-sena-cyan";
    if (v < 150) return "text-sena-green";
    if (v < 350) return "text-sena-yellow";
    return "text-destructive";
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-card to-background",
        "border border-border/50",
        "p-4 md:p-6",
        className
      )}
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sena-green/5 via-transparent to-transparent" />

      {/* Label */}
      <p className="relative text-[10px] md:text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2 md:mb-3">
        Temperatura medida
      </p>

      {/* Display principal */}
      <div className="relative flex items-baseline gap-2 md:gap-3">
        {/* Segmentos apagados (ghost) */}
        <span className="absolute font-7seg text-4xl md:text-6xl lg:text-7xl text-muted/20 select-none pointer-events-none tracking-wider">
          888.8
        </span>

        {/* Valor real */}
        <span
          className={cn(
            "relative font-7seg text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider transition-colors duration-300",
            getColor(value),
            value !== null && "animate-segment-glow"
          )}
        >
          {displayValue}
        </span>

        {/* Unidad */}
        <span className="relative text-lg md:text-2xl text-muted-foreground font-mono">
          {unit}
        </span>
      </div>

      {/* Barra de rango visual */}
      {value !== null && (
        <div className="relative mt-3 md:mt-4">
          <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-sena-cyan via-sena-green via-sena-yellow to-destructive"
              style={{ width: `${Math.min(100, (value / 500) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground font-mono">
              0°C
            </span>
            <span className="text-[9px] text-muted-foreground font-mono">
              500°C
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
