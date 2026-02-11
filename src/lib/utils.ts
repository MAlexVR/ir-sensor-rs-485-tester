import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un timestamp formateado para la consola serial.
 */
export function serialTimestamp(): string {
  const now = new Date();
  return (
    now.toLocaleTimeString("es-CO", { hour12: false }) +
    "." +
    String(now.getMilliseconds()).padStart(3, "0")
  );
}
