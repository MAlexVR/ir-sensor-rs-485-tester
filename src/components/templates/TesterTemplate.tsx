"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Settings2,
  Activity,
  Cable,
  FileText,
  BookOpen,
  Thermometer,
  SlidersHorizontal,
  Lock,
  Unlock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/organisms/Header";
import { ConnectionPanel } from "@/components/organisms/ConnectionPanel";
import { TemperaturePanel } from "@/components/organisms/TemperaturePanel";
import { WiringPanel, SpecsPanel } from "@/components/organisms/WiringPanel";
import { PermissionsModal } from "@/components/molecules/PermissionsModal";
import { useSerialPort } from "@/hooks/useSerialPort";
import { cn, serialTimestamp } from "@/lib/utils";
import type { LogEntry } from "@/types/serial";

/* ─── Toggle switch ─── */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-sena-green" : "bg-input",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ─── Advanced Settings Panel ─── */
function AdvancedSettingsPanel({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground/70" />
          Ajustes de Conexión Serial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Toggle row */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-muted/20">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-none">
              Configuración avanzada
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Habilita la edición de parámetros de comunicación serial
            </p>
          </div>
          <Toggle checked={enabled} onChange={onToggle} />
        </div>

        {/* Status banner */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11px] font-mono transition-colors",
            enabled
              ? "bg-sena-green/10 border border-sena-green/20 text-sena-green"
              : "bg-muted/50 border border-border text-muted-foreground",
          )}
        >
          {enabled ? (
            <Unlock className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>
            {enabled
              ? "Parámetros seriales desbloqueados. Podés modificar la configuración."
              : "Parámetros seriales bloqueados. Los valores por defecto están activos (9600 8N1)."}
          </span>
        </div>

        {/* Controlled fields list */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Parámetros controlados
          </p>
          <ul className="space-y-1">
            {[
              "Baud Rate",
              "Bits de Datos",
              "Paridad",
              "Bits de Parada",
              "Control de Flujo",
              "Control DE/RE (RS-485)",
              "Dirección del Sensor",
              "Modo Demo",
            ].map((field) => (
              <li
                key={field}
                className="flex items-center gap-2 text-[11px] text-muted-foreground"
              >
                <span
                  className={cn(
                    "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
                    enabled ? "bg-sena-green" : "bg-muted-foreground/40",
                  )}
                />
                {field}
              </li>
            ))}
          </ul>
        </div>

        {/* Note: always enabled */}
        <p className="text-[10px] text-muted-foreground/60 font-mono border-t border-border pt-3">
          El selector de puerto y el botón Conectar siempre permanecen
          habilitados.
        </p>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

export function TesterTemplate() {
  const serial = useSerialPort();
  const [activeTab, setActiveTab] = useState("control");
  const [demoActive, setDemoActive] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [advancedSettingsEnabled, setAdvancedSettingsEnabled] = useState(false);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check permissions on mount
  // Check permissions on mount
  useEffect(() => {
    // Show modal only if:
    // 1. Web Serial is supported
    // 2. Initial ports check has finished
    // 3. No ports are authorized (list is empty)
    // 4. Demo mode is NOT active
    if (
      serial.isSupported &&
      serial.hasLoadedInitialPorts &&
      serial.ports.length === 0 &&
      !demoActive
    ) {
      setPermissionsModalOpen(true);
    } else {
      setPermissionsModalOpen(false);
    }
  }, [
    serial.isSupported,
    serial.hasLoadedInitialPorts,
    serial.ports.length,
    demoActive,
  ]);

  const handleGrantPermissions = async () => {
    await serial.requestAuth();
    // Modal will close automatically via effect when ports.length > 0
  };
  const aboutRef = useRef<HTMLElement>(null);

  // ─── Demo mode ───────────────────────────────────────────
  const toggleDemo = useCallback(() => {
    if (demoActive) {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      setDemoActive(false);
    } else {
      setDemoActive(true);
    }
  }, [demoActive]);

  // Generate demo data when active
  useEffect(() => {
    if (!demoActive) return;

    const t0 = Date.now();
    const interval = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      const temp = 24 + Math.sin(s / 5) * 12 + Math.random() * 3;
      // Simulate by directly calling pushTemperature through readOnce
      // Since we can't directly push, we add a log entry
      serial.clearData(); // We won't clear - instead push via the hook
    }, 1000);

    demoIntervalRef.current = interval;
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - we handle this differently

  // Better demo implementation using a separate state
  const [demoTemp, setDemoTemp] = useState<number | null>(null);
  const [demoStats, setDemoStats] = useState(serial.stats);
  const [demoLogs, setDemoLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!demoActive) {
      setDemoTemp(null);
      setDemoStats({
        min: null,
        max: null,
        avg: null,
        count: 0,
        history: [],
      });
      setDemoLogs([]);
      return;
    }

    const t0 = Date.now();
    let count = 0;
    let min: number | null = null;
    let max: number | null = null;
    let sum = 0;
    const history: { temp: number; ts: number }[] = [];

    const iv = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      const temp = parseFloat(
        (24 + Math.sin(s / 5) * 12 + Math.random() * 3).toFixed(1),
      );
      count++;
      sum += temp;
      min = min === null ? temp : Math.min(min, temp);
      max = max === null ? temp : Math.max(max, temp);
      history.push({ temp, ts: Date.now() });
      if (history.length > 100) history.shift();

      setDemoTemp(temp);
      setDemoStats({
        min,
        max,
        avg: sum / count,
        count,
        history: [...history],
      });

      const ts = serialTimestamp();
      const dH = Math.floor((temp * 10) / 256);
      const dL = Math.floor((temp * 10) % 256);
      setDemoLogs((prev) => [
        ...prev.slice(-400),
        {
          timestamp: ts,
          type: "tx" as const,
          message: `0x54 0x50 0x01 0xF1 0x96`,
        },
        {
          timestamp: ts,
          type: "rx" as const,
          message: `0x54 0x50 0x01 0xF1 0x${dH.toString(16).padStart(2, "0").toUpperCase()} 0x${dL.toString(16).padStart(2, "0").toUpperCase()} 0x${((0x54 + 0x50 + 0x01 + 0xf1 + dH + dL) & 0xff).toString(16).padStart(2, "0").toUpperCase()}`,
        },
        {
          timestamp: ts,
          type: "success" as const,
          message: `DEMO ${temp.toFixed(1)}°C`,
        },
      ]);
    }, 1000);

    return () => clearInterval(iv);
  }, [demoActive]);

  // Merge real serial data with demo data
  const currentTemp = demoActive ? demoTemp : serial.temperature;
  const currentStats = demoActive ? demoStats : serial.stats;
  const currentLogs = demoActive ? demoLogs : serial.logs;

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PermissionsModal
        isOpen={permissionsModalOpen}
        onOpenChange={setPermissionsModalOpen}
        onGrant={handleGrantPermissions}
        hasPorts={serial.ports.length > 0}
      />
      <Header onAboutClick={scrollToAbout} />

      {/* ═══ Mobile Layout: Tabs ═══ */}
      <main className="flex-1 container px-3 py-3 md:hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-5 mb-3">
            <TabsTrigger value="control" className="text-xs px-1">
              <Settings2 className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs px-1">
              <Activity className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="wiring" className="text-xs px-1">
              <Cable className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs px-1">
              <FileText className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="ajustes" className="text-xs px-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="mt-0">
            <ConnectionPanel
              status={serial.status}
              isReading={serial.isReading}
              isSupported={serial.isSupported}
              onConnect={serial.connect}
              onDisconnect={serial.disconnect}
              onReadOnce={serial.readOnce}
              onStartContinuous={serial.startContinuous}
              onStopContinuous={serial.stopContinuous}
              onChangeAddress={serial.changeAddress}
              onToggleDemo={toggleDemo}
              demoActive={demoActive}
              ports={serial.ports}
              connectedPort={serial.connectedPort}
              advancedSettingsEnabled={advancedSettingsEnabled}
            />
          </TabsContent>

          <TabsContent value="monitor" className="mt-0">
            <TemperaturePanel
              temperature={currentTemp}
              stats={currentStats}
              logs={currentLogs}
              onClearData={demoActive ? () => {} : serial.clearData}
              onClearLogs={
                demoActive ? () => setDemoLogs([]) : serial.clearLogs
              }
              onClearAll={demoActive ? () => {} : serial.clearAll}
            />
          </TabsContent>

          <TabsContent value="wiring" className="mt-0">
            <WiringPanel />
          </TabsContent>

          <TabsContent value="specs" className="mt-0">
            <SpecsPanel />
          </TabsContent>

          <TabsContent value="ajustes" className="mt-0">
            <AdvancedSettingsPanel
              enabled={advancedSettingsEnabled}
              onToggle={() => setAdvancedSettingsEnabled((v) => !v)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* ═══ Desktop Layout: 2 columns ═══ */}
      <main className="hidden md:block flex-1 container py-4 lg:py-6">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Left column: Connection + Commands */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="sticky top-20 space-y-4">
              <ConnectionPanel
                status={serial.status}
                isReading={serial.isReading}
                isSupported={serial.isSupported}
                onConnect={serial.connect}
                onDisconnect={serial.disconnect}
                onReadOnce={serial.readOnce}
                onStartContinuous={serial.startContinuous}
                onStopContinuous={serial.stopContinuous}
                onChangeAddress={serial.changeAddress}
                onToggleDemo={toggleDemo}
                demoActive={demoActive}
                ports={serial.ports}
                connectedPort={serial.connectedPort}
              />
            </div>
          </aside>

          {/* Right column: Temperature display, chart, console */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9">
            <Tabs defaultValue="monitor" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 max-w-lg">
                <TabsTrigger value="monitor" className="text-xs">
                  <Activity className="w-3.5 h-3.5 mr-1" />
                  Monitor
                </TabsTrigger>
                <TabsTrigger value="wiring" className="text-xs">
                  <Cable className="w-3.5 h-3.5 mr-1" />
                  Cableado
                </TabsTrigger>
                <TabsTrigger value="specs" className="text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Especificaciones
                </TabsTrigger>
                <TabsTrigger value="ajustes" className="text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                  Ajustes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="monitor">
                <TemperaturePanel
                  temperature={currentTemp}
                  stats={currentStats}
                  logs={currentLogs}
                  onClearData={demoActive ? () => {} : serial.clearData}
                  onClearLogs={
                    demoActive ? () => setDemoLogs([]) : serial.clearLogs
                  }
                  onClearAll={demoActive ? () => {} : serial.clearAll}
                />
              </TabsContent>

              <TabsContent value="wiring">
                <WiringPanel />
              </TabsContent>

              <TabsContent value="specs">
                <SpecsPanel />
              </TabsContent>

              <TabsContent value="ajustes">
                <AdvancedSettingsPanel
                  enabled={advancedSettingsEnabled}
                  onToggle={() => setAdvancedSettingsEnabled((v) => !v)}
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer
        ref={aboutRef}
        className="border-t bg-muted/30 mt-auto scroll-mt-4"
      >
        <div className="container px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-sm">
            <div>
              <div className="mb-4">
                <img
                  src="/logo-grupo-investigacion.svg"
                  alt="Grupo de Investigación"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <h3 className="font-semibold mb-2 text-sena-green flex items-center gap-1.5">
                <Thermometer className="w-4 h-4" />
                ¿Qué es esta aplicación?
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                Herramienta web para prueba y diagnóstico de termómetros
                infrarrojos industriales con interfaz RS-485, usando la{" "}
                <strong className="text-foreground">Web Serial API</strong>{" "}
                directamente desde el navegador, sin necesidad de software
                adicional ni backend.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sena-green flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Protocolo del Sensor
              </h3>
              <div className="text-xs text-muted-foreground space-y-1.5 font-mono">
                <p>• Header: 0x54 0x50 (propietario, NO Modbus)</p>
                <p>• Lectura: cmd 0xF1 → T = (DH×256+DL)/10 °C</p>
                <p>• Dirección: cmd 0xF0 → cambio persistente</p>
                <p>• Checksum: Σ bytes & 0xFF</p>
                <p>• Serial: 9600 baud, 8N1 (fábrica)</p>
                <p>• Bus: hasta 256 sensores, dir. default 0x01</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sena-green">Créditos</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                <strong className="text-foreground">Institución:</strong> Centro
                de Electricidad, Electrónica y Telecomunicaciones (CEET)
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Servicio Nacional de Aprendizaje — SENA
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                <strong className="text-foreground">Programa:</strong>{" "}
                Implementación de Infraestructura de TIC / Redes y Servicios de
                Telecomunicaciones
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-3">
                Versión Web 1.0 — Next.js 15 — 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
