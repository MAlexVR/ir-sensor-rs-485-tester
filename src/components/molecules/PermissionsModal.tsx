"use client";
import { useState, useEffect } from "react";
import { Plug, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sena-green">
            <Plug className="w-5 h-5" />
            Permisos de Puerto Serial
          </DialogTitle>
          <DialogDescription>
            Para comunicarse con el sensor, el navegador requiere acceso a los
            puertos COM.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm text-muted-foreground space-y-2">
            <p>
              1. Haga clic en <strong>"Buscar Dispositivos"</strong>.
            </p>
            <p>
              2. Seleccione su dispositivo (ej. <em>USB-Serial Controller</em>)
              en la ventana emergente.
            </p>
            <p>
              3. Haga clic en <strong>"Conectar"</strong> en esa ventana.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300">
              <p className="font-semibold mb-1">¿No aparece su dispositivo?</p>
              <p>
                Verifique que el cable USB-RS485 esté conectado y los drivers
                instalados. Si persiste, recargue la página.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onGrant}
            className="bg-sena-green hover:bg-sena-green-dark text-white"
          >
            <Plug className="w-4 h-4 mr-2" />
            Buscar Dispositivos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
