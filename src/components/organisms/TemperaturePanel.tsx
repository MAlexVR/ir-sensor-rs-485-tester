"use client";

import {
  Activity,
  TrendingDown,
  TrendingUp,
  Hash,
  Waves,
  RotateCcw,
  Radio,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SevenSegmentDisplay } from "@/components/molecules/SevenSegmentDisplay";
import { StatCard } from "@/components/molecules/StatCard";
import { ConsoleLog } from "@/components/molecules/ConsoleLog";
import type { TemperatureStats, LogEntry } from "@/types/serial";

/* ═══ Mini chart SVG ═══ */
function TemperatureChart({
  data,
}: {
  data: { temp: number; ts: number }[];
}) {
  const w = 560;
  const h = 140;
  const pad = { t: 10, r: 10, b: 24, l: 44 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[120px] rounded-lg border border-dashed border-sena-green/20 bg-[#0c100d]">
        <div className="text-center">
          <Activity className="w-5 h-5 text-sena-green/20 mx-auto mb-1.5" />
          <p className="text-xs text-zinc-600 font-mono">
            Sin datos — inicie lectura
          </p>
        </div>
      </div>
    );
  }

  const vals = data.map((d) => d.temp);
  const mn = Math.max(0, Math.min(...vals) - 5);
  const mx = Math.max(...vals) + 5;
  const rg = mx - mn || 1;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * pw,
    y: pad.t + ph - ((d.temp - mn) / rg) * ph,
  }));

  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const area =
    line +
    ` L${pts[pts.length - 1].x} ${pad.t + ph} L${pts[0].x} ${pad.t + ph}Z`;

  return (
    <div className="rounded-lg overflow-hidden bg-[#0c100d] border border-sena-green/15 p-1">
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        className="block"
        role="img"
        aria-label="Historial de temperatura"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39a900" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#39a900" stopOpacity="0.02" />
          </linearGradient>
          <filter id="lineglow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        {Array.from({ length: 5 }, (_, i) => mn + (rg / 4) * i).map((v, i) => {
          const y = pad.t + ph - ((v - mn) / rg) * ph;
          return (
            <g key={i}>
              <line
                x1={pad.l} y1={y} x2={w - pad.r} y2={y}
                stroke="#39a900" strokeWidth="0.4" strokeOpacity="0.15"
                strokeDasharray="4 4"
              />
              <text
                x={pad.l - 6} y={y + 3}
                textAnchor="end"
                fill="#4a5568"
                style={{ fontSize: 8, fontFamily: "monospace" }}
              >
                {v.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={area} fill="url(#chartGrad)" />

        {/* Main line with glow */}
        <path
          d={line}
          fill="none"
          stroke="#39a900"
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#lineglow)"
        />

        {/* Current point */}
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r="4"
          fill="#39a900"
          stroke="#0c100d"
          strokeWidth="2"
          filter="url(#lineglow)"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

interface TemperaturePanelProps {
  temperature: number | null;
  stats: TemperatureStats;
  logs: LogEntry[];
  onClearData: () => void;
  onClearLogs: () => void;
  onClearAll: () => void;
}

export function TemperaturePanel({
  temperature,
  stats,
  logs,
  onClearData,
  onClearLogs,
  onClearAll,
}: TemperaturePanelProps) {
  const fmt = (v: number | null) => (v !== null ? v.toFixed(1) : "---");
  const range =
    stats.min !== null && stats.max !== null
      ? (stats.max - stats.min).toFixed(1)
      : "---";

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ─── Display temperatura ─── */}
      <Card className="overflow-hidden border-sena-green/20 bg-card">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sena-blue">
              <Activity className="w-4 h-4 text-sena-green" />
              Temperatura en Tiempo Real
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearData}
                title="Resetear mediciones"
                className="text-muted-foreground hover:text-sena-blue"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearAll}
                title="Limpiar todo"
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <SevenSegmentDisplay value={temperature} />
        </CardContent>
      </Card>

      {/* ─── Estadísticas ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <StatCard
          icon={TrendingDown}
          label="Mínima"
          value={fmt(stats.min)}
          unit="°C"
          variant="cyan"
          compact
        />
        <StatCard
          icon={TrendingUp}
          label="Máxima"
          value={fmt(stats.max)}
          unit="°C"
          variant="danger"
          compact
        />
        <StatCard
          icon={Activity}
          label="Promedio"
          value={fmt(stats.avg)}
          unit="°C"
          variant="green"
          compact
        />
        <StatCard
          icon={Hash}
          label="Lecturas"
          value={String(stats.count)}
          unit=""
          variant="purple"
          compact
        />
        <StatCard
          icon={Waves}
          label="Rango"
          value={range}
          unit="Δ°C"
          variant="yellow"
          compact
        />
      </div>

      {/* ─── Historial gráfico ─── */}
      <Card className="border-sena-green/20 bg-card">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2 text-sena-blue">
            <Activity className="w-4 h-4 text-sena-green" />
            Historial de Temperatura
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <TemperatureChart data={stats.history} />
        </CardContent>
      </Card>

      {/* ─── Consola RS-485 ─── */}
      <Card className="border-sena-green/20 bg-card">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sena-blue">
              <Radio className="w-4 h-4 text-sena-green" />
              Consola RS-485
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-sena-yellow/60 bg-sena-yellow/5 border border-sena-yellow/15 px-1.5 py-0.5 rounded">TX</span>
              <span className="text-[9px] font-mono text-sena-cyan/60 bg-sena-cyan/5 border border-sena-cyan/15 px-1.5 py-0.5 rounded">RX</span>
              <span className="text-[9px] font-mono text-sena-green/60 bg-sena-green/5 border border-sena-green/15 px-1.5 py-0.5 rounded">OK</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <ConsoleLog logs={logs} onClear={onClearLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
