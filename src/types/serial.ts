/**
 * Tipos para la comunicación serial RS-485 con el termómetro infrarrojo.
 *
 * Protocolo propietario (NO Modbus):
 *   Header: 0x54 0x50
 *   Lectura:  TX [0x54][0x50][Addr][0xF1][CHK]           → 5 bytes
 *             RX [0x54][0x50][Addr][0xF1][DH][DL][CHK]    → 7 bytes
 *   Dirección: TX [0x54][0x50][Addr][0xF0][NewAddr][CHK]  → 6 bytes
 *   Checksum: byte bajo de la suma hexadecimal de todos los bytes previos
 *   Temp (°C) = (DataH × 256 + DataL) / 10
 *   Default: 9600 baud, 8N1, address 0x01
 */

/** Configuración del puerto serial */
export interface SerialConfig {
  baudRate: number;
  dataBits: 7 | 8;
  parity: ParityType;
  stopBits: 1 | 2;
  flowControl: FlowControlType;
}

/** Estados posibles del puerto serial */
export type PortStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/** Entrada de log para la consola técnica */
export interface LogEntry {
  timestamp: string;
  type: "tx" | "rx" | "info" | "success" | "error" | "warning";
  message: string;
}

/** Resultado de parsear una respuesta de temperatura */
export interface TemperatureReading {
  temperature: number;
  dataH: number;
  dataL: number;
  address: number;
  checksum: number;
  raw: Uint8Array;
}

/** Error de protocolo */
export interface ProtocolError {
  code: "INCOMPLETE" | "INVALID_HEADER" | "INVALID_CMD" | "CHECKSUM_FAIL" | "OUT_OF_RANGE" | "TIMEOUT";
  message: string;
  raw?: Uint8Array;
}

/** Resultado de parseo de respuesta */
export type ParseResult =
  | { ok: true; data: TemperatureReading }
  | { ok: false; error: ProtocolError };

/** Estadísticas de temperatura */
export interface TemperatureStats {
  min: number | null;
  max: number | null;
  avg: number | null;
  count: number;
  history: { temp: number; ts: number }[];
}

/** Configuración por defecto del sensor según el manual */
export const DEFAULT_CONFIG: SerialConfig = {
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: "none",
};

export const DEFAULT_ADDRESS = 0x01;
export const TEMP_MIN = 0;
export const TEMP_MAX = 500;
export const HISTORY_MAX = 100;
export const READ_TIMEOUT_MS = 3000;
