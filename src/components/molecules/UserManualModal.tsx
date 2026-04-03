"use client";

import { useState } from "react";
import {
  HelpCircle,
  Monitor,
  Cable,
  SlidersHorizontal,
  Plug,
  Radio,
  Tag,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/atoms/Modal";
import { APP_CONFIG, INSTITUTION_CONFIG } from "@/config/app.config";

interface UserManualModalProps {
  triggerClassName?: string;
  children?: React.ReactNode;
}

const DEFAULT_TRIGGER_CLASS =
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors";

export function UserManualModal({
  triggerClassName,
  children,
}: UserManualModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={triggerClassName ?? DEFAULT_TRIGGER_CLASS}
        onClick={() => setOpen(true)}
      >
        {children || (
          <>
            <HelpCircle className="h-4 w-4 text-sena-green" />
            <span className="hidden md:inline">Manual de Uso</span>
            <span className="md:hidden">Ayuda</span>
          </>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="2xl"
        description="Manual de uso del probador de sensor IR RS-485"
        title={
          <>
            <HelpCircle className="h-5 w-5 text-sena-green" />
            Manual de Uso — IR Sensor RS-485 Tester v1.1
          </>
        }
        footer={
          <span className="text-[10px] text-gray-400">
            {APP_CONFIG.versionBadge} · {INSTITUTION_CONFIG.headerBrand}
          </span>
        }
      >
        <div className="space-y-6 text-sm text-gray-700">

          {/* 1. Requisitos */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <Monitor className="h-4 w-4 text-sena-green" /> 1. Requisitos del
              Sistema
            </h3>
            <div className="ml-6 grid gap-2 md:grid-cols-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-1 text-gray-700">Navegador</h4>
                <p className="text-xs text-gray-500">
                  Chrome 89+ o Edge 89+. Firefox y Safari{" "}
                  <strong>NO</strong> soportan Web Serial API.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-1 text-gray-700">Drivers</h4>
                <p className="text-xs text-gray-500">
                  Instalar driver del conversor USB-RS485: FTDI, CH340 o
                  CP2102.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Conexión física */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <Cable className="h-4 w-4 text-sena-green" /> 2. Conexión Física
            </h3>
            <div className="ml-6 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 pr-3 font-medium text-gray-500">
                      Cable
                    </th>
                    <th className="text-left py-1 pr-3 font-medium text-gray-500">
                      Terminal sensor
                    </th>
                    <th className="text-left py-1 font-medium text-gray-500">
                      Conversor
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-500">
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-3 font-medium text-red-500">
                      Rojo
                    </td>
                    <td className="py-1 pr-3">V+ (5–12 VDC)</td>
                    <td className="py-1">VCC / 5V</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-3 font-medium text-gray-700">
                      Negro
                    </td>
                    <td className="py-1 pr-3">GND</td>
                    <td className="py-1">GND</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-3 font-medium text-yellow-600">
                      Amarillo
                    </td>
                    <td className="py-1 pr-3">B (T−)</td>
                    <td className="py-1">B−</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 font-medium text-blue-500">
                      Azul
                    </td>
                    <td className="py-1 pr-3">A (T+)</td>
                    <td className="py-1">A+</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              El sensor puede alimentarse desde la salida 5V del conversor si
              la corriente es suficiente (máx. 50 mA).
            </p>
          </section>

          {/* 3. Configuración */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-sena-green" /> 3.
              Configuración Serial (Ajustes)
            </h3>
            <p className="text-gray-500 ml-6 text-xs">
              Por defecto los parámetros están bloqueados con los valores de
              fábrica. Active el interruptor en el tab{" "}
              <strong>Ajustes</strong> para modificarlos.
            </p>
            <div className="ml-6 grid gap-2 md:grid-cols-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-1 text-gray-700">
                  Valores de fábrica
                </h4>
                <p className="text-xs text-gray-500 font-mono">
                  9600 baud · 8N1 · Dir. 0x01
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-1 text-gray-700">
                  Parámetros configurables
                </h4>
                <p className="text-xs text-gray-500">
                  Baud Rate, Data Bits, Paridad, Stop Bits, Flow Control,
                  DE/RE.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Conectar y leer */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <Plug className="h-4 w-4 text-sena-green" /> 4. Conectar y Leer
            </h3>
            <ol className="list-decimal ml-10 space-y-1 text-gray-500 text-xs">
              <li>
                Seleccione el puerto en el dropdown <strong>Puerto / Dispositivo</strong>.
              </li>
              <li>
                Haga clic en <strong>Conectar Puerto Serial</strong>. El
                navegador mostrará los puertos COM disponibles.
              </li>
              <li>
                Use <strong>Continua</strong> para muestreo automático cada
                segundo, o active los Ajustes y use <strong>Leer 1×</strong>{" "}
                para lectura puntual.
              </li>
            </ol>
          </section>

          {/* 5. Protocolo */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <Radio className="h-4 w-4 text-sena-green" /> 5. Protocolo RS-485
            </h3>
            <div className="ml-6 bg-gray-50 rounded-lg border border-gray-100 p-3 font-mono text-xs space-y-1 text-gray-600">
              <p>
                <span className="text-sena-yellow font-semibold">TX</span>{" "}
                0x54 0x50 [Dir] 0xF1 [CHK]
              </p>
              <p>
                <span className="text-sena-cyan font-semibold">RX</span>{" "}
                0x54 0x50 [Dir] 0xF1 [DH] [DL] [CHK]
              </p>
              <p>
                <span className="text-sena-green font-semibold">T°</span> =
                (DH × 256 + DL) / 10 °C
              </p>
              <p>
                <span className="text-sena-purple font-semibold">CHK</span> =
                byte bajo de Σ bytes previos
              </p>
            </div>
          </section>

          {/* 6. Operaciones avanzadas */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <Tag className="h-4 w-4 text-sena-green" /> 6. Operaciones
              Avanzadas
            </h3>
            <div className="ml-6 grid gap-2 md:grid-cols-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-1 text-gray-700">
                  Cambiar dirección
                </h4>
                <p className="text-xs text-gray-500">
                  Fábrica: 0x01. Rango 0x00–0xFF. Hasta 256 sensores en bus.
                  El cambio es persistente en memoria del sensor.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-1 text-gray-700">Modo Demo</h4>
                <p className="text-xs text-gray-500">
                  Active <strong>Configuración Avanzada</strong> en Ajustes y
                  presione <strong>Modo Demo</strong> para probar la interfaz
                  sin hardware.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Limpiar datos */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-sena-green" /> 7. Gestión de
              Datos
            </h3>
            <ul className="list-disc ml-10 space-y-1 text-gray-500 text-xs">
              <li>
                <strong>Limpiar todo:</strong> borra lecturas, estadísticas y
                logs.
              </li>
              <li>
                <strong>↺ Resetear mediciones:</strong> solo reinicia
                estadísticas.
              </li>
              <li>
                <strong>✕ Consola:</strong> limpia únicamente los registros
                TX/RX.
              </li>
            </ul>
          </section>

          {/* Precauciones */}
          <div className="bg-sena-yellow/10 border border-sena-yellow/30 p-4 rounded-lg flex gap-3">
            <AlertTriangle className="h-4 w-4 text-sena-yellow flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              <strong>Precauciones:</strong> No apunte al sol ni a fuentes
              láser. Rango: 0–500 °C. Verifique la polaridad antes de
              energizar. Consumo máx.: 50 mA @ 5–12 VDC.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
