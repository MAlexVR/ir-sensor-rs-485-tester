"use client";

import { Plug, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/atoms/Modal";

interface PermissionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: () => Promise<void>;
  hasPorts: boolean;
}

export function PermissionsModal({
  isOpen,
  onOpenChange,
  onGrant,
  hasPorts,
}: PermissionsModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={() => onOpenChange(false)}
      maxWidth="md"
      description="Solicitud de acceso al puerto serial para comunicarse con el sensor"
      title={
        <>
          <Plug className="h-5 w-5 text-sena-green" />
          Permisos de Puerto Serial
        </>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onGrant}
            className="bg-sena-green hover:bg-sena-green-dark text-white shadow-lg shadow-sena-green/25"
          >
            <Plug className="w-4 h-4" />
            Buscar Dispositivos
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-sm text-gray-700">
        <p className="text-gray-500">
          Para comunicarse con el sensor, el navegador requiere acceso a los
          puertos COM.
        </p>

        {/* Pasos */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-sena-blue flex items-center gap-2">
            <Info className="h-4 w-4 text-sena-green" /> Pasos
          </h3>
          <ol className="ml-6 space-y-2">
            {[
              <>
                Haga clic en{" "}
                <strong className="text-gray-700">"Buscar Dispositivos"</strong>
                .
              </>,
              <>
                Seleccione su conversor USB-RS485 (ej.{" "}
                <em>USB-Serial Controller</em>, <em>CH340</em>, <em>FTDI</em>)
                en la ventana emergente.
              </>,
              <>
                Haga clic en{" "}
                <strong className="text-gray-700">"Conectar"</strong> en esa
                ventana.
              </>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sena-green/10 text-sena-green text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-500">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Ayuda */}
        <div className="bg-sena-yellow/10 border border-sena-yellow/30 p-3 rounded-lg flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 text-sena-yellow flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-semibold mb-0.5 text-gray-700">
              ¿No aparece su dispositivo?
            </p>
            <p>
              Verifique que el cable USB-RS485 esté conectado y los drivers
              instalados (FTDI / CH340 / CP2102). Si persiste, recargue la
              página.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
