/**
 * Protocolo propietario del termómetro infrarrojo RS-485.
 *
 * Formato general de trama:
 *   [0x54] [0x50] [Sensor Addr] [Command] [data...] [Checksum]
 *
 * Lectura de temperatura (sección 4.2 del manual):
 *   TX: 0x54  0x50  [Addr]  0xF1  [CHK]               → 5 bytes
 *   RX: 0x54  0x50  [Addr]  0xF1  [DataH] [DataL] [CHK] → 7 bytes
 *   Temperatura = (DataH × 256 + DataL) / 10 (°C)
 *
 * Cambio de dirección (sección 4.1 del manual):
 *   TX: 0x54  0x50  [Addr]  0xF0  [NewAddr]  [CHK]    → 6 bytes
 *
 * Checksum (manual):
 *   Suma hexadecimal de todos los bytes previos, truncada a 8 bits (& 0xFF).
 *   Ejemplo del manual: 0x54+0x50+0x01+0xF1 = 0x196 → checksum = 0x96
 *   Ejemplo del manual: 0x54+0x50+0x01+0xF1+0x00+0x72 = 0x208 → checksum = 0x08
 */

import type { ParseResult, ProtocolError, TemperatureReading } from "@/types/serial";

// Constantes del protocolo
const HEADER = [0x54, 0x50] as const;
const CMD_READ = 0xf1;
const CMD_ADDR = 0xf0;

/**
 * Calcula el checksum: byte bajo de la suma de todos los bytes.
 */
export function checksum(bytes: number[]): number {
  return bytes.reduce((sum, b) => sum + b, 0) & 0xff;
}

/**
 * Construye la trama de lectura de temperatura.
 * TX: [0x54] [0x50] [Addr] [0xF1] [CHK]
 */
export function buildReadCommand(address: number): Uint8Array {
  const payload = [HEADER[0], HEADER[1], address & 0xff, CMD_READ];
  return new Uint8Array([...payload, checksum(payload)]);
}

/**
 * Construye la trama de cambio de dirección.
 * TX: [0x54] [0x50] [Addr] [0xF0] [NewAddr] [CHK]
 */
export function buildAddressCommand(
  currentAddress: number,
  newAddress: number
): Uint8Array {
  const payload = [
    HEADER[0],
    HEADER[1],
    currentAddress & 0xff,
    CMD_ADDR,
    newAddress & 0xff,
  ];
  return new Uint8Array([...payload, checksum(payload)]);
}

/**
 * Parsea la respuesta de temperatura del sensor.
 * RX: [0x54] [0x50] [Addr] [0xF1] [DataH] [DataL] [CHK]
 *
 * Validaciones:
 *   1. Longitud >= 7 bytes
 *   2. Header = 0x54 0x50
 *   3. Comando = 0xF1
 *   4. Checksum correcto
 *   5. Temperatura dentro de rango 0–500°C
 */
export function parseTemperatureResponse(frame: Uint8Array): ParseResult {
  // 1. Validar longitud
  if (frame.length < 7) {
    return {
      ok: false,
      error: {
        code: "INCOMPLETE",
        message: `Trama incompleta: ${frame.length} bytes recibidos, se esperan 7`,
        raw: frame,
      },
    };
  }

  // 2. Validar header
  if (frame[0] !== HEADER[0] || frame[1] !== HEADER[1]) {
    return {
      ok: false,
      error: {
        code: "INVALID_HEADER",
        message: `Header inválido: ${toHex(frame.slice(0, 2))} (esperado 0x54 0x50)`,
        raw: frame,
      },
    };
  }

  // 3. Validar comando
  if (frame[3] !== CMD_READ) {
    return {
      ok: false,
      error: {
        code: "INVALID_CMD",
        message: `Comando inesperado: ${toHex([frame[3]])} (esperado 0xF1)`,
        raw: frame,
      },
    };
  }

  // 4. Validar checksum
  const expectedChk = checksum(Array.from(frame.slice(0, 6)));
  if (frame[6] !== expectedChk) {
    return {
      ok: false,
      error: {
        code: "CHECKSUM_FAIL",
        message: `Checksum inválido: recibido ${toHex([frame[6]])}, calculado ${toHex([expectedChk])}`,
        raw: frame,
      },
    };
  }

  // 5. Extraer temperatura: T = (DataH × 256 + DataL) / 10
  const dataH = frame[4];
  const dataL = frame[5];
  const temperature = (dataH * 256 + dataL) / 10;

  if (temperature < 0 || temperature > 500) {
    return {
      ok: false,
      error: {
        code: "OUT_OF_RANGE",
        message: `Temperatura fuera de rango: ${temperature.toFixed(1)}°C (válido: 0–500°C)`,
        raw: frame,
      },
    };
  }

  const reading: TemperatureReading = {
    temperature,
    dataH,
    dataL,
    address: frame[2],
    checksum: frame[6],
    raw: frame,
  };

  return { ok: true, data: reading };
}

/**
 * Busca una trama válida de 7 bytes dentro de un buffer de bytes.
 * Sincroniza buscando el header 0x54 0x50.
 * Retorna { frame, remaining } o null si no hay trama completa.
 */
export function extractFrame(
  buffer: Uint8Array
): { frame: Uint8Array; remaining: Uint8Array } | null {
  // Buscar header 0x54
  let startIdx = -1;
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === HEADER[0] && i + 1 < buffer.length && buffer[i + 1] === HEADER[1]) {
      startIdx = i;
      break;
    }
  }

  if (startIdx < 0) return null;
  if (buffer.length - startIdx < 7) return null;

  const frame = buffer.slice(startIdx, startIdx + 7);
  const remaining = buffer.slice(startIdx + 7);

  return { frame, remaining };
}

/**
 * Convierte bytes a string hexadecimal legible.
 */
export function toHex(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}
