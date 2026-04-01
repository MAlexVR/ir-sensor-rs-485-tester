import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  variant?: "green" | "cyan" | "yellow" | "purple" | "danger" | "default";
  compact?: boolean;
}

const variantStyles = {
  green:   "from-sena-green/25 to-sena-green/5   border-sena-green/40  bg-sena-green/5",
  cyan:    "from-sena-cyan/20  to-sena-cyan/5    border-sena-cyan/30   bg-sena-cyan/5",
  yellow:  "from-sena-yellow/20 to-sena-yellow/5  border-sena-yellow/30 bg-sena-yellow/5",
  purple:  "from-sena-purple/20 to-sena-purple/5  border-sena-purple/30 bg-sena-purple/5",
  danger:  "from-red-500/20    to-red-500/5      border-red-400/30     bg-red-500/5",
  default: "from-muted/50      to-muted/30       border-border",
};

const iconBgStyles = {
  green:   "bg-sena-green/15  text-sena-green",
  cyan:    "bg-sena-cyan/15   text-sena-cyan",
  yellow:  "bg-sena-yellow/15 text-sena-yellow",
  purple:  "bg-sena-purple/15 text-sena-purple",
  danger:  "bg-red-500/15     text-red-400",
  default: "bg-muted          text-muted-foreground",
};

const valueColors = {
  green:   "text-sena-green",
  cyan:    "text-sena-cyan",
  yellow:  "text-sena-yellow",
  purple:  "text-sena-purple",
  danger:  "text-red-400",
  default: "text-foreground",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  variant = "default",
  compact = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-br border backdrop-blur-sm transition-all",
        variantStyles[variant],
        compact ? "p-3" : "p-3 md:p-4"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", iconBgStyles[variant])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground truncate leading-tight">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold font-mono tabular-nums",
            compact ? "text-base md:text-lg" : "text-lg md:text-xl",
            valueColors[variant]
          )}
        >
          {value}
        </span>
        <span className="text-[10px] md:text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
