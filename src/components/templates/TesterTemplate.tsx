"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Settings2,
  Activity,
  Cable,
  FileText,
  BookOpen,
  Thermometer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/organisms/Header";
import { ConnectionPanel } from "@/components/organisms/ConnectionPanel";
import { TemperaturePanel } from "@/components/organisms/TemperaturePanel";
import { WiringPanel, SpecsPanel } from "@/components/organisms/WiringPanel";
import { PermissionsModal } from "@/components/molecules/PermissionsModal";
import { useSerialPort } from "@/hooks/useSerialPort";
import { serialTimestamp } from "@/lib/utils";
import type { LogEntry } from "@/types/serial";

export function TesterTemplate() {
  const serial = useSerialPort();
  const [activeTab, setActiveTab] = useState("control");
  const [demoActive, setDemoActive] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
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
          <TabsList className="grid w-full grid-cols-4 mb-3">
            <TabsTrigger value="control" className="text-xs">
              <Settings2 className="w-3.5 h-3.5 mr-1" />
              Control
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="wiring" className="text-xs">
              <Cable className="w-3.5 h-3.5 mr-1" />
              Cables
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Specs
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
              <TabsList className="grid w-full grid-cols-3 max-w-md">
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
