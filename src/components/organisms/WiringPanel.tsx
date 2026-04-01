"use client";

import {
  Cable,
  Zap,
  AlertTriangle,
  Thermometer,
  Settings2,
  Radio,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ═══ Wiring diagram SVG ═══ */
function WiringSVG() {
  return (
    <svg
      width="100%"
      viewBox="0 0 460 180"
      className="block"
      role="img"
      aria-label="Diagrama de conexión del sensor IR RS-485"
    >
      {/* Sensor */}
      <rect
        x="8"
        y="30"
        width="118"
        height="120"
        rx="10"
        className="fill-muted/30 stroke-border"
        strokeWidth="1.5"
      />
      <text
        x="67"
        y="52"
        textAnchor="middle"
        className="fill-foreground font-mono"
        style={{ fontSize: 11, fontWeight: 800 }}
      >
        SENSOR IR
      </text>
      <text
        x="67"
        y="67"
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        style={{ fontSize: 8 }}
      >
        M18×1 · 0-500°C
      </text>

      {/* Wires */}
      {[
        { y: 75, c: "#ef4444", l: "Rojo → V+" },
        { y: 88, c: "#78909C", l: "Negro → GND" },
        { y: 101, c: "#FDC300", l: "Amarillo → B (T−)" },
        { y: 114, c: "#50E5F9", l: "Azul → A (T+)" },
      ].map((w, i) => (
        <g key={i}>
          <line
            x1="126"
            y1={w.y}
            x2="196"
            y2={w.y + 10} // Slanting used to target converter
            stroke={w.c}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="132"
            y={w.y - 4}
            className="font-mono"
            style={{ fontSize: 7, fill: "#8899aa" }}
          >
            {w.l}
          </text>
        </g>
      ))}

      {/* Converter */}
      <rect
        x="196"
        y="70"
        width="108"
        height="80"
        rx="6"
        fill="rgba(80,229,249,0.04)"
        stroke="rgba(80,229,249,0.25)"
        strokeWidth="1.5"
      />
      <text
        x="250"
        y="90"
        textAnchor="middle"
        style={{ fontSize: 9, fill: "#50e5f9", fontWeight: 800 }}
        className="font-mono"
      >
        USB ↔ RS-485
      </text>
      <text
        x="250"
        y="102"
        textAnchor="middle"
        className="font-mono"
        style={{ fontSize: 7, fill: "#6688aa" }}
      >
        Con salida VCC (5V)
      </text>

      {/* Connector dots on converter */}
      <circle cx="200" cy="85" r="2" fill="#ef4444" />
      <circle cx="200" cy="98" r="2" fill="#78909C" />
      <circle cx="200" cy="111" r="2" fill="#FDC300" />
      <circle cx="200" cy="124" r="2" fill="#50E5F9" />

      {/* USB cable */}
      <line
        x1="304"
        y1="110"
        x2="350"
        y2="110"
        className="stroke-muted-foreground"
        strokeWidth="2"
        strokeDasharray="5 3"
      />
      <text
        x="327"
        y="104"
        textAnchor="middle"
        className="font-mono"
        style={{ fontSize: 7, fill: "#6688aa" }}
      >
        USB
      </text>

      {/* PC */}
      <rect
        x="350"
        y="82"
        width="92"
        height="56"
        rx="10"
        className="fill-muted/30 stroke-border"
        strokeWidth="1.5"
      />
      <text
        x="396"
        y="104"
        textAnchor="middle"
        className="fill-foreground font-mono"
        style={{ fontSize: 9, fontWeight: 800 }}
      >
        PC / Laptop
      </text>
      <text
        x="396"
        y="118"
        textAnchor="middle"
        style={{ fontSize: 7, fill: "#71277a" }}
        className="font-mono"
      >
        Chrome 89+
      </text>
      <text
        x="396"
        y="130"
        textAnchor="middle"
        className="font-mono"
        style={{ fontSize: 7, fill: "#6688aa" }}
      >
        Web Serial API
      </text>

      {/* Title */}
      <text
        x="230"
        y="18"
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}
      >
        DIAGRAMA DE CONEXIÓN
      </text>
    </svg>
  );
}

/* ═══ Stat line for specs ═══ */
function SpecLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold font-mono",
          color || "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

export function WiringPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <Card className="glass">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cable className="w-4 h-4 text-sena-cyan" />
            Diagrama de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WiringSVG />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-sena-yellow" />
            Identificación de Cables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { c: "#ef4444", l: "Rojo", f: "V+ (5V desde USB o externa)" },
            { c: "#78909C", l: "Negro", f: "GND (Alimentación negativa)" },
            { c: "#FDC300", l: "Amarillo", f: "485T−/B (Datos −)" },
            { c: "#50E5F9", l: "Azul", f: "485T+/A (Datos +)" },
          ].map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg border"
              style={{
                background: w.c + "08",
                borderColor: w.c + "20",
              }}
            >
              <span
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ background: w.c }}
              />
              <span className="text-xs text-muted-foreground">
                <strong style={{ color: w.c }}>{w.l}</strong> → {w.f}
              </span>
            </div>
          ))}

          <div className="mt-3 p-3 rounded-lg bg-sena-yellow/5 border border-sena-yellow/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-sena-yellow" />
              <span className="text-[10px] font-bold text-sena-yellow">
                IMPORTANTE
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Verifique A↔A y B↔B entre sensor y conversor. Una inversión impide
              la comunicación pero no daña el equipo. GND de fuente debe ser
              común con el del conversor USB-RS485.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SpecsPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <Card className="glass">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sena-green" />
            Parámetros de Medición
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpecLine label="Rango espectral" value="8 ~ 14 μm" />
          <SpecLine label="Temperatura" value="0 – 500 °C" />
          <SpecLine label="Resolución óptica" value="20:1 D:S" />
          <SpecLine label="Respuesta" value="100 ms (95%)" />
          <SpecLine label="Precisión" value="±1% ó ±2°C" />
          <SpecLine label="Repetibilidad" value="±0.5% ó ±2°C" />
          <SpecLine label="Emisividad" value="0.95 fijo" />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-sena-purple" />
            Características Físicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpecLine label="Protección" value="IP65 (NEMA-4)" />
          <SpecLine label="Temp. operación" value="0 ~ 60 °C" />
          <SpecLine label="Almacenamiento" value="-20 ~ 80 °C" />
          <SpecLine label="Humedad" value="10–95% sin cond." />
          <SpecLine label="Material" value="Acero inoxidable" />
          <SpecLine label="Tamaño" value="M18×1 · 106×Ø18mm" />
          <SpecLine label="Alimentación" value="5 – 12 VDC (USB 5V OK)" />
          <SpecLine label="Corriente máx." value="50 mA" />
          <SpecLine label="Cable" value="1.5 m (customizable)" />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-sena-cyan" />
            Comunicación RS-485
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpecLine label="Protocolo" value="Propietario (hex)" />
          <SpecLine label="Header fijo" value="0x54 0x50" />
          <SpecLine label="Baud rate" value="9600 (fábrica)" />
          <SpecLine label="Formato" value="8N1" />
          <SpecLine label="Dir. fábrica" value="0x01" />
          <SpecLine label="Máx. sensores" value="256 en bus" />
          <SpecLine label="Cmd lectura" value="0xF1" />
          <SpecLine label="Cmd dirección" value="0xF0" />
          <SpecLine label="Checksum" value="Σ bytes & 0xFF" />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border/50 rounded-t-xl">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sena-yellow" />
            Requisitos del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              icon: CheckCircle2,
              t: "Chrome 89+ o Edge 89+",
              d: "Web Serial API requerida",
              c: "text-sena-green",
            },
            {
              icon: Cable,
              t: "Conversor USB ↔ RS-485",
              d: "FTDI, CH340 o CP2102",
              c: "text-sena-cyan",
            },
            {
              icon: Zap,
              t: "Alimentación eléctrica",
              d: "5V desde USB o externa",
              c: "text-sena-yellow",
            },
            {
              icon: AlertTriangle,
              t: "Driver del conversor",
              d: "Instalado en el sistema",
              c: "text-sena-purple",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1">
              <item.icon
                className={cn("w-4 h-4 flex-shrink-0 mt-0.5", item.c)}
              />
              <div>
                <p className={cn("text-xs font-semibold", item.c)}>
                  {item.t}
                </p>
                <p className="text-[11px] text-muted-foreground">{item.d}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
