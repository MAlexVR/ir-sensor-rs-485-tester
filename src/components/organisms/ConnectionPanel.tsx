"use client";

import { useState, useEffect } from "react";
import {
  Plug,
  Unplug,
  Thermometer,
  Play,
  Square,
  Tag,
  Send,
  Settings2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusIndicator } from "@/components/atoms/StatusIndicator";
import { cn } from "@/lib/utils";
import type { SerialConfig, PortStatus } from "@/types/serial";
import { DEFAULT_CONFIG } from "@/types/serial";

/* ─── Tooltip inline ─── */
function FieldTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-[11px] leading-relaxed bg-card border border-border shadow-xl w-52 text-muted-foreground font-normal normal-case tracking-normal">
          {text}
        </span>
      )}
    </span>
  );
}

/* ─── Select field ─── */
function SelectField({
  label,
  value,
  onChange,
  options,
  tip,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tip?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          {label}
        </label>
        {tip && <FieldTip text={tip} />}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-mono",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Text input field ─── */
function InputField({
  label,
  value,
  onChange,
  placeholder,
  tip,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tip?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          {label}
        </label>
        {tip && <FieldTip text={tip} />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-mono",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

interface ConnectionPanelProps {
  status: PortStatus;
  isReading: boolean;
  isSupported: boolean;
  onConnect: (config: SerialConfig, port?: SerialPort) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onReadOnce: (address: number) => Promise<void>;
  onStartContinuous: (address: number) => void;
  onStopContinuous: () => void;
  onChangeAddress: (current: number, newAddr: number) => Promise<void>;
  onToggleDemo: () => void;
  demoActive: boolean;
  ports: SerialPort[];
  connectedPort: SerialPort | null;
}

export function ConnectionPanel({
  status,
  isReading,
  isSupported,
  onConnect,
  onDisconnect,
  onReadOnce,
  onStartContinuous,
  onStopContinuous,
  onChangeAddress,
  onToggleDemo,
  demoActive,
  ports,
  connectedPort,
}: ConnectionPanelProps) {
  const [config, setConfig] = useState<SerialConfig>({ ...DEFAULT_CONFIG });
  const [address, setAddress] = useState("01");
  const [newAddress, setNewAddress] = useState("02");
  const [confirmAddr, setConfirmAddr] = useState(false);
  const [selectedPortIdx, setSelectedPortIdx] = useState<string>("new");

  // Auto-select connected port
  useEffect(() => {
    if (status === "connected" && connectedPort) {
      const idx = ports.indexOf(connectedPort);
      if (idx >= 0) {
        setSelectedPortIdx(String(idx));
      }
    }
  }, [status, connectedPort, ports]);

  const connected = status === "connected";
  const canSend = connected || demoActive;

  const parsedAddr = parseInt(address, 16) || 0x01;
  const parsedNewAddr = parseInt(newAddress, 16) || 0x02;

  const handleConnect = () => {
    if (selectedPortIdx === "new") {
      onConnect(config);
    } else {
      const port = ports[parseInt(selectedPortIdx)];
      onConnect(config, port); // TypeScript might complain if onConnect signature isn't updated in props, but checking useSerialPort it is.
      // Wait, ConnectionPanelProps definition of onConnect is: (config: SerialConfig) => Promise<void>;
      // I need to update that too.
    }
  };
  const handleDisconnect = () => onDisconnect();

  const handleAddrChange = () => {
    if (!confirmAddr) {
      setConfirmAddr(true);
      return;
    }
    onChangeAddress(parsedAddr, parsedNewAddr);
    setAddress(newAddress);
    setConfirmAddr(false);
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ─── Conexión serial ─── */}

      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <StatusIndicator status={demoActive ? "connected" : status} />
              Conexión Serial
            </CardTitle>
            <Settings2 className="w-4 h-4 text-muted-foreground/50" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Internal Header with Badges */}
          <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-5 px-1.5 font-mono tracking-wide border-0",
                connected
                  ? "bg-sena-green/10 text-sena-green"
                  : demoActive
                    ? "bg-sena-yellow/10 text-sena-yellow"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {connected
                ? "✓ CONECTADO"
                : demoActive
                  ? "⚠ MODO DEMO"
                  : "✕ DESCONECTADO"}
            </Badge>
            {!isSupported && (
              <span className="text-[9px] text-destructive font-mono">
                Api no soportada
              </span>
            )}
          </div>

          {/* Parámetros serial — grid 2×2 */}

          <div className="mb-2">
            <SelectField
              label="Puerto / Dispositivo"
              value={selectedPortIdx}
              onChange={setSelectedPortIdx}
              disabled={connected}
              tip="Seleccione un puerto previamente autorizado o 'Agregar nuevo' para abrir el selector del navegador."
              options={[
                ...ports.map((p, i) => {
                  const info = p.getInfo();
                  const label =
                    info.usbVendorId && info.usbProductId
                      ? `Port #${i + 1} (VID:${info.usbVendorId.toString(16).padStart(4, "0")} PID:${info.usbProductId.toString(16).padStart(4, "0")})`
                      : `Dispositivo Autorizado #${i + 1}`;
                  return { value: String(i), label };
                }),
                {
                  value: "new",
                  label: "🔌 Seleccionar nuevo puerto (Sistema)...",
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SelectField
              label="Baud Rate"
              value={String(config.baudRate)}
              onChange={(v) =>
                setConfig((p) => ({ ...p, baudRate: parseInt(v) }))
              }
              disabled={connected}
              tip="Velocidad de transmisión serial. El sensor viene de fábrica en 9600 bps."
              options={[
                { value: "4800", label: "4800" },
                { value: "9600", label: "9600 ✦" },
                { value: "19200", label: "19200" },
                { value: "38400", label: "38400" },
                { value: "57600", label: "57600" },
                { value: "115200", label: "115200" },
              ]}
            />
            <SelectField
              label="Bits de datos"
              value={String(config.dataBits)}
              onChange={(v) =>
                setConfig((p) => ({
                  ...p,
                  dataBits: parseInt(v) as 7 | 8,
                }))
              }
              disabled={connected}
              tip="Cantidad de bits de datos por trama. Manual del sensor: 8 bits."
              options={[
                { value: "7", label: "7 bits" },
                { value: "8", label: "8 bits ✦" },
              ]}
            />
            <SelectField
              label="Paridad"
              value={config.parity}
              onChange={(v) =>
                setConfig((p) => ({ ...p, parity: v as ParityType }))
              }
              disabled={connected}
              tip="Bit de verificación de paridad. Manual: ninguna (N)."
              options={[
                { value: "none", label: "Ninguna ✦" },
                { value: "even", label: "Par (Even)" },
                { value: "odd", label: "Impar (Odd)" },
              ]}
            />
            <SelectField
              label="Bits de parada"
              value={String(config.stopBits)}
              onChange={(v) =>
                setConfig((p) => ({
                  ...p,
                  stopBits: parseInt(v) as 1 | 2,
                }))
              }
              disabled={connected}
              tip="Bits de parada al final de cada trama. Manual: 1 stop bit."
              options={[
                { value: "1", label: "1 bit ✦" },
                { value: "2", label: "2 bits" },
              ]}
            />
          </div>

          <SelectField
            label="Control de flujo"
            value={config.flowControl}
            onChange={(v) =>
              setConfig((p) => ({
                ...p,
                flowControl: v as FlowControlType,
              }))
            }
            disabled={connected}
            tip="Control de flujo hardware. RS-485 half-duplex no lo requiere."
            options={[
              { value: "none", label: "Ninguno ✦" },
              { value: "hardware", label: "Hardware (RTS/CTS)" },
            ]}
          />

          <InputField
            label="Dirección del sensor (hex)"
            value={address}
            onChange={setAddress}
            placeholder="01"
            tip="Dirección hexadecimal del sensor en el bus RS-485. Fábrica: 0x01. Rango: 0x00–0xFF."
          />

          <p className="text-[9px] text-muted-foreground/70 font-mono bg-muted/50 p-2 rounded border border-border/50">
            <Info className="inline w-3 h-3 mr-1 -mt-0.5" />
            Al hacer clic en <strong>Conectar</strong>, el navegador abrirá una
            ventana emergente para seleccionar el puerto COM.
          </p>

          {/* Botón conectar/desconectar */}
          {!connected ? (
            <Button
              onClick={handleConnect}
              disabled={!isSupported}
              className="w-full bg-sena-green hover:bg-sena-green-dark text-white"
              size="lg"
            >
              <Plug className="w-4 h-4" />
              Conectar Puerto Serial
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <Unplug className="w-4 h-4" />
              Desconectar
            </Button>
          )}

          {/* Botón demo */}
          <Button
            onClick={onToggleDemo}
            variant={demoActive ? "destructive" : "outline"}
            className="w-full"
            size="sm"
          >
            {demoActive ? (
              <>
                <Square className="w-3.5 h-3.5" /> Detener Demo
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Modo Demo (sin hardware)
              </>
            )}
          </Button>

          {/* Logo Centro de Formación */}
          <div className="flex justify-center pt-4 pb-1">
            <img
              src="/logo-centro-formacion.svg"
              alt="Centro de Formación"
              className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Comandos ─── */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-sena-yellow" />
            Comandos
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Referencia rápida del protocolo */}
          <div className="rounded-lg p-2.5 bg-background border border-border font-mono text-[10px] leading-[1.9]">
            <div>
              <span className="text-sena-yellow">TX</span>{" "}
              <span className="text-muted-foreground/50">0x54 0x50</span> [Dir]{" "}
              <span className="text-muted-foreground/50">0xF1</span> [CHK]
            </div>
            <div>
              <span className="text-sena-cyan">RX</span>{" "}
              <span className="text-muted-foreground/50">0x54 0x50</span> [Dir]{" "}
              <span className="text-muted-foreground/50">0xF1</span> [DH] [DL]
              [CHK]
            </div>
            <div>
              <span className="text-sena-green">T°</span> = (DH × 256 + DL) / 10
              °C
            </div>
            <div>
              <span className="text-sena-purple">CHK</span> = byte bajo de Σ
              bytes previos
            </div>
          </div>

          {/* Botones de lectura */}
          <div className="flex gap-2">
            <Button
              onClick={() => onReadOnce(parsedAddr)}
              disabled={!canSend}
              className="flex-1 bg-sena-green hover:bg-sena-green-dark text-white"
            >
              <Thermometer className="w-4 h-4" />
              Leer 1×
            </Button>
            <Button
              onClick={() =>
                isReading ? onStopContinuous() : onStartContinuous(parsedAddr)
              }
              disabled={!canSend}
              variant={isReading ? "destructive" : "outline"}
              className="flex-1"
            >
              {isReading ? (
                <>
                  <Square className="w-3.5 h-3.5" /> Detener
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Continua
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Cambiar dirección */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Cambiar dirección del sensor
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <InputField
                  label="Nueva dirección (hex)"
                  value={newAddress}
                  onChange={(v) => {
                    setNewAddress(v);
                    setConfirmAddr(false);
                  }}
                  placeholder="02"
                  tip="Cambio persistente en memoria. Trama: 0x54 0x50 [Dir] 0xF0 [Nueva] [CHK]."
                />
              </div>
              <Button
                onClick={handleAddrChange}
                disabled={!canSend}
                variant={confirmAddr ? "destructive" : "outline"}
                size="default"
                className="flex-shrink-0"
              >
                <Tag className="w-4 h-4" />
                {confirmAddr ? "Confirmar" : "Cambiar"}
              </Button>
            </div>
            {confirmAddr && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-sena-yellow/10 border border-sena-yellow/20">
                <AlertTriangle className="w-3.5 h-3.5 text-sena-yellow flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-sena-yellow leading-relaxed">
                  ¿Cambiar dirección de 0x
                  {address.toUpperCase().padStart(2, "0")} a 0x
                  {newAddress.toUpperCase().padStart(2, "0")}? El cambio es
                  persistente.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
