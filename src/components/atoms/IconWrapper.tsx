import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconWrapperProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "green" | "cyan" | "yellow" | "purple" | "danger" | "muted";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const variantClasses = {
  default: "text-foreground",
  green: "text-sena-green",
  cyan: "text-sena-cyan",
  yellow: "text-sena-yellow",
  purple: "text-sena-purple",
  danger: "text-destructive",
  muted: "text-muted-foreground",
};

export function IconWrapper({
  icon: Icon,
  size = "md",
  variant = "default",
  className,
}: IconWrapperProps) {
  return (
    <Icon
      className={cn(sizeClasses[size], variantClasses[variant], className)}
    />
  );
}
