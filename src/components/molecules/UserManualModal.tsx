"use client";

import { useState } from "react";
import {
  Cable,
  Monitor,
  Settings2,
  Plug,
  Thermometer,
  Radio,
  Tag,
  Eye,
  Trash2,
  AlertTriangle,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserManualModalProps {
  triggerVariant?: "ghost" | "outline" | "default";
  triggerClassName?: string;
  children?: React.ReactNode;
}

const steps = [
  {
    icon: Cable,
    title: "Conexión física",
    color: "text-sena-yellow",
    bg: "bg-sena-yellow/10 border-sena-yellow/20",
    text: "Rojo → V+ (5-12VDC), Negro → GND, Amarillo → B (T−), Azul → A (T+). Puede alimentar el sensor desde el conversor si tiene salida 5V/VCC.",
  },
  {
    icon: Monitor,
    title: "Navegador compatible",
    color: "text-sena-purple",
    bg: "bg-sena-purple/10 border-sena-purple/20",
    text: "Chrome 89+ o Edge 89+. Firefox y Safari NO soportan Web Serial API. Instalar driver del conversor (FTDI/CH340/CP2102).",
  },
  {
    icon: Settings2,
    title: "Configuración serial",
    color: "text-sena-cyan",
    bg: "bg-sena-cyan/10 border-sena-cyan/20",
    text: "Valores de fábrica: 9600 baud, 8 bits de datos, sin paridad, 1 bit de parada. Configurar antes de conectar.",
  },
  {
    icon: Plug,
    title: "Conectar puerto",
    color: "text-sena-green",
    bg: "bg-sena-green/10 border-sena-green/20",
    text: "Clic en 'Conectar'. El navegador muestra los puertos COM disponibles. Seleccionar el del conversor USB-RS485.",
  },
  {
    icon: Thermometer,
    title: "Lectura de temperatura",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    text: "'Leer 1×' para lectura puntual. 'Continua' para muestreo automático cada segundo. Los datos se muestran en el display y la gráfica.",
  },
  {
    icon: Radio,
    title: "Protocolo RS-485",
    color: "text-sena-cyan",
    bg: "bg-sena-cyan/10 border-sena-cyan/20",
    text: "TX: [0x54 0x50 Dir 0xF1 CHK]. RX: [0x54 0x50 Dir 0xF1 DH DL CHK]. Temp = (DH×256+DL)/10 °C. Checksum = byte bajo de la suma hex.",
  },
  {
    icon: Tag,
    title: "Cambiar dirección",
    color: "text-sena-purple",
    bg: "bg-sena-purple/10 border-sena-purple/20",
    text: "Fábrica: 0x01. Trama: [0x54 0x50 Dir 0xF0 NuevDir CHK]. Hasta 256 sensores en bus RS-485. El cambio es persistente.",
  },
  {
    icon: SlidersHorizontal,
    title: "Ajustes de conexión serial",
    color: "text-sena-green",
    bg: "bg-sena-green/10 border-sena-green/20",
    text: "En el tab 'Ajustes' encontrás el interruptor de Configuración Avanzada. Por defecto está deshabilitado (valores de fábrica). Activalo para modificar Baud Rate, Bits de Datos, Paridad, Bits de Parada, Control de Flujo, Control DE/RE y Dirección del Sensor. También habilita el Modo Demo.",
  },
  {
    icon: Eye,
    title: "Modo demo",
    color: "text-sena-yellow",
    bg: "bg-sena-yellow/10 border-sena-yellow/20",
    text: "Activá 'Configuración Avanzada' en el tab Ajustes y luego presioná 'Demo' para probar la interfaz sin hardware. Genera datos simulados para familiarizarse con la aplicación.",
  },
  {
    icon: Trash2,
    title: "Limpiar datos",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    text: "'Limpiar todo' borra lecturas, estadísticas y logs. El icono ↺ solo resetea mediciones. El ✕ en la consola limpia solo los registros.",
  },
];

export function UserManualModal({
  triggerVariant = "ghost",
  triggerClassName,
  children,
}: UserManualModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm" className={triggerClassName}>
          {children || (
            <>
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Manual de Uso</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-5 py-4 border-b bg-muted/20 flex-none m-0">
          <DialogTitle className="flex items-center gap-2 text-sena-cyan font-mono text-sm uppercase">
            <HelpCircle className="w-4 h-4" />
            Guía de Uso
          </DialogTitle>
        </DialogHeader>

        {/* Steps - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={cn("flex gap-3 p-3 rounded-xl border", step.bg)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <step.icon className={cn("w-4 h-4", step.color)} />
              </div>
              <div>
                <p
                  className={cn("text-xs font-bold font-mono mb-1", step.color)}
                >
                  {step.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </div>
          ))}

          {/* Warning */}
          <div className="p-3 rounded-xl bg-sena-yellow/5 border border-sena-yellow/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-sena-yellow" />
              <span className="text-xs font-bold text-sena-yellow font-mono">
                PRECAUCIONES
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              No apunte al sol ni fuentes láser. Rango: 0–500°C. Verifique
              polaridad antes de energizar. Consumo máx: 50mA @ 5-12VDC.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t bg-muted/20 md:hidden">
          <Button
            onClick={() => setOpen(false)}
            className="w-full"
            variant="outline"
          >
            Cerrar Guía
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
