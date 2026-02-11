import { cn } from "@/lib/utils";
import type { PortStatus } from "@/types/serial";

interface StatusIndicatorProps {
  status: PortStatus;
  className?: string;
}

const statusConfig = {
  disconnected: {
    color: "bg-muted-foreground",
    label: "Desconectado",
    pulse: false,
  },
  connecting: {
    color: "bg-sena-yellow",
    label: "Conectando...",
    pulse: true,
  },
  connected: {
    color: "bg-sena-green",
    label: "Conectado",
    pulse: true,
  },
  error: {
    color: "bg-destructive",
    label: "Error",
    pulse: false,
  },
};

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      title={config.label}
    >
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.color,
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            config.color,
          )}
        />
      </span>
    </div>
  );
}
