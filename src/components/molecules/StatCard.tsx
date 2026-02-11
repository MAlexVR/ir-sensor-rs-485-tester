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
  green: "from-sena-green/20 to-sena-green-dark/10 border-sena-green/30",
  cyan: "from-sena-cyan/15 to-sena-cyan/5 border-sena-cyan/25",
  yellow: "from-sena-yellow/15 to-sena-yellow/5 border-sena-yellow/25",
  purple: "from-sena-purple/15 to-sena-purple/5 border-sena-purple/25",
  danger: "from-destructive/15 to-destructive/5 border-destructive/25",
  default: "from-muted/50 to-muted/30 border-border",
};

const iconStyles = {
  green: "text-sena-green",
  cyan: "text-sena-cyan",
  yellow: "text-sena-yellow",
  purple: "text-sena-purple",
  danger: "text-destructive",
  default: "text-muted-foreground",
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
        "rounded-xl bg-gradient-to-br border backdrop-blur-sm",
        variantStyles[variant],
        compact ? "p-2.5" : "p-3 md:p-4"
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <Icon className={cn("w-4 h-4", iconStyles[variant])} />
      </div>
      <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 truncate">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold font-mono text-foreground",
            compact ? "text-base" : "text-lg md:text-xl"
          )}
        >
          {value}
        </span>
        <span className="text-[10px] md:text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}
