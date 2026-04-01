"use client";

import { cn } from "@/lib/utils";

interface SevenSegmentDisplayProps {
  value: number | null;
  unit?: string;
  className?: string;
}

/** Color del display según rango de temperatura */
function getTempColor(v: number | null): string {
  if (v === null) return "text-zinc-600";
  if (v < 50) return "text-sena-cyan";
  if (v < 150) return "text-sena-green";
  if (v < 350) return "text-sena-yellow";
  return "text-red-400";
}

function getTempGlow(v: number | null): string {
  if (v === null) return "";
  if (v < 50) return "drop-shadow-[0_0_8px_#50e5f9]";
  if (v < 150) return "drop-shadow-[0_0_8px_#39a900]";
  if (v < 350) return "drop-shadow-[0_0_8px_#fdc300]";
  return "drop-shadow-[0_0_8px_#f87171]";
}

export function SevenSegmentDisplay({
  value,
  unit = "°C",
  className,
}: SevenSegmentDisplayProps) {
  const displayValue = value !== null ? value.toFixed(1) : "--.-";
  const color = getTempColor(value);
  const glow = getTempGlow(value);

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-[#0a0f0a] border border-sena-green/20",
        "p-4 md:p-6",
        className
      )}
    >
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#39a90008_0%,_transparent_70%)]" />

      {/* Label */}
      <p className="relative text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-[0.2em] mb-3 md:mb-4">
        Temperatura medida
      </p>

      {/* Número principal */}
      <div className="relative flex items-baseline gap-3 md:gap-4">
        <span
          className={cn(
            "font-mono font-bold tracking-tight transition-colors duration-300",
            "text-5xl md:text-7xl lg:text-8xl",
            color,
            glow,
            value !== null && "animate-segment-glow"
          )}
        >
          {displayValue}
        </span>
        <span className={cn("font-mono text-xl md:text-3xl", color, "opacity-70")}>
          {unit}
        </span>
      </div>

      {/* Barra de rango */}
      {value !== null && (
        <div className="relative mt-4 md:mt-5">
          <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-sena-cyan via-sena-green via-sena-yellow to-red-400"
              style={{ width: `${Math.min(100, (value / 500) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-zinc-600 font-mono">0°C</span>
            <span className="text-[9px] text-zinc-600 font-mono">500°C</span>
          </div>
        </div>
      )}
    </div>
  );
}
