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
  const pad = { t: 8, r: 8, b: 22, l: 42 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[120px] rounded-lg border border-dashed border-border">
        <div className="text-center">
          <Activity className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground/50 font-mono">
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

  const line = pts
    .map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`)
    .join(" ");
  const area =
    line +
    ` L${pts[pts.length - 1].x} ${pad.t + ph} L${pts[0].x} ${pad.t + ph}Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      className="block"
      role="img"
      aria-label="Historial de temperatura"
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#50e5f9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#50e5f9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {Array.from({ length: 5 }, (_, i) => mn + (rg / 4) * i).map(
        (v, i) => {
          const y = pad.t + ph - ((v - mn) / rg) * ph;
          return (
            <g key={i}>
              <line
                x1={pad.l}
                y1={y}
                x2={w - pad.r}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
              <text
                x={pad.l - 5}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground/50 font-mono"
                style={{ fontSize: 8 }}
              >
                {v.toFixed(0)}
              </text>
            </g>
          );
        }
      )}
      {/* Area fill */}
      <path d={area} fill="url(#chartGrad)" />
      {/* Line */}
      <path
        d={line}
        fill="none"
        stroke="#50e5f9"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Current point */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="3.5"
        fill="#50e5f9"
        stroke="hsl(var(--card))"
        strokeWidth="2"
      />
    </svg>
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
      {/* ─── Display 7 segmentos ─── */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-sena-green" />
              Temperatura en Tiempo Real
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearData}
                title="Resetear mediciones"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearAll}
                title="Limpiar todo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-sena-cyan" />
            Historial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemperatureChart data={stats.history} />
        </CardContent>
      </Card>

      {/* ─── Consola RS-485 ─── */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-sena-purple" />
            Consola RS-485
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConsoleLog logs={logs} onClear={onClearLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
