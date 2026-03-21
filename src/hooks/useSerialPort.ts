"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  buildReadCommand,
  buildAddressCommand,
  extractFrame,
  parseTemperatureResponse,
  toHex,
} from "@/lib/protocol";
import { serialTimestamp } from "@/lib/utils";
import type {
  SerialConfig,
  PortStatus,
  LogEntry,
  TemperatureStats,
  TemperatureReading,
} from "@/types/serial";
import { HISTORY_MAX, READ_TIMEOUT_MS } from "@/types/serial";

interface UseSerialPortReturn {
  // Estado
  status: PortStatus;
  temperature: number | null;
  stats: TemperatureStats;
  logs: LogEntry[];
  isReading: boolean;
  isSupported: boolean;

  // Acciones
  connect: (config: SerialConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  readOnce: (address: number) => Promise<void>;
  startContinuous: (address: number) => void;
  stopContinuous: () => void;
  changeAddress: (currentAddr: number, newAddr: number) => Promise<void>;
  clearLogs: () => void;
  clearData: () => void;
  clearAll: () => void;
}

export function useSerialPort(): UseSerialPortReturn & {
  ports: SerialPort[];
  canRequestPort: boolean;
  connectedPort: SerialPort | null;
  requestAuth: () => Promise<void>;
  hasLoadedInitialPorts: boolean;
} {
  const [status, setStatus] = useState<PortStatus>("disconnected");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [stats, setStats] = useState<TemperatureStats>({
    min: null,
    max: null,
    avg: null,
    count: 0,
    history: [],
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [hasLoadedInitialPorts, setHasLoadedInitialPorts] = useState(false);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const configRef = useRef<SerialConfig | null>(null);
  const readLoopActiveRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bufferRef = useRef<Uint8Array>(new Uint8Array(0));
  const pendingResolveRef = useRef<
    ((reading: TemperatureReading) => void) | null
  >(null);
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null);

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && "serial" in navigator);
  }, []);

  // ─── Manage Ports ────────────────────────────────────────
  const updatePorts = useCallback(async () => {
    if (!isSupported) return;
    try {
      const p = await navigator.serial.getPorts();
      setPorts(p);
    } catch (err) {
      console.error("Error getting ports:", err);
    } finally {
      setHasLoadedInitialPorts(true);
    }
  }, [isSupported]);

  useEffect(() => {
    updatePorts();
    if (isSupported) {
      navigator.serial.addEventListener("connect", updatePorts);
      navigator.serial.addEventListener("disconnect", updatePorts);
      return () => {
        navigator.serial.removeEventListener("connect", updatePorts);
        navigator.serial.removeEventListener("disconnect", updatePorts);
      };
    }
  }, [isSupported, updatePorts]);

  // ─── Logging ─────────────────────────────────────────────
  const addLog = useCallback(
    (message: string, type: LogEntry["type"] = "info") => {
      const entry: LogEntry = { timestamp: serialTimestamp(), type, message };
      setLogs((prev) => [...prev.slice(-500), entry]);
    },
    [],
  );

  // ─── Push temperature + update stats ─────────────────────
  const pushTemperature = useCallback((temp: number) => {
    setTemperature(temp);
    setStats((prev) => {
      const count = prev.count + 1;
      const history = [...prev.history, { temp, ts: Date.now() }].slice(
        -HISTORY_MAX,
      );
      return {
        min: prev.min === null ? temp : Math.min(prev.min, temp),
        max: prev.max === null ? temp : Math.max(prev.max, temp),
        avg: prev.avg === null ? temp : (prev.avg * (count - 1) + temp) / count,
        count,
        history,
      };
    });
  }, []);

  // ─── Process received bytes ──────────────────────────────
  const processBuffer = useCallback(() => {
    let currentBuffer = bufferRef.current;

    while (true) {
      const result = extractFrame(currentBuffer);
      if (!result) break;

      const { frame, remaining } = result;
      currentBuffer = remaining;

      const parsed = parseTemperatureResponse(frame);

      if (parsed.ok) {
        const r = parsed.data;
        pushTemperature(r.temperature);
        addLog(
          `${r.temperature.toFixed(1)}°C  [DH=${toHex([r.dataH])} DL=${toHex([r.dataL])} CHK=${toHex([r.checksum])}]`,
          "success",
        );
        // Resolver promesa pendiente si existe
        if (pendingResolveRef.current) {
          pendingResolveRef.current(r);
          pendingResolveRef.current = null;
          pendingRejectRef.current = null;
        }
      } else {
        addLog(parsed.error.message, "error");
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error(parsed.error.message));
          pendingResolveRef.current = null;
          pendingRejectRef.current = null;
        }
      }
    }

    bufferRef.current = currentBuffer;
  }, [addLog, pushTemperature]);

  // ─── Read loop ───────────────────────────────────────────
  const startReadLoop = useCallback(
    async (reader: ReadableStreamDefaultReader) => {
      readLoopActiveRef.current = true;
      try {
        while (readLoopActiveRef.current) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            const bytes = new Uint8Array(value);
            addLog(toHex(bytes), "rx");
            // Concatenar al buffer
            const combined = new Uint8Array(
              bufferRef.current.length + bytes.length,
            );
            combined.set(bufferRef.current, 0);
            combined.set(bytes, bufferRef.current.length);
            bufferRef.current = combined;
            processBuffer();
          }
        }
      } catch (err) {
        if (readLoopActiveRef.current) {
          addLog(`Error de lectura: ${(err as Error).message}`, "error");
        }
      }
    },
    [addLog, processBuffer],
  );

  // ─── Connect ─────────────────────────────────────────────
  const connect = useCallback(
    async (config: SerialConfig, specificPort?: SerialPort) => {
      if (!isSupported) {
        addLog("Web Serial API no disponible en este navegador", "error");
        setStatus("error");
        return;
      }

      try {
        setStatus("connecting");

        let port = specificPort;
        if (!port) {
          addLog("Solicitando nuevo puerto serial...", "info");
          port = await navigator.serial.requestPort();
        } else {
          addLog("Abriendo puerto seleccionado...", "info");
        }

        await port.open({
          baudRate: config.baudRate,
          dataBits: config.dataBits,
          parity: config.parity,
          stopBits: config.stopBits,
          flowControl: config.flowControl,
        });

        const writer = port.writable!.getWriter();
        const reader = port.readable!.getReader();

        portRef.current = port;
        writerRef.current = writer;
        readerRef.current = reader;
        configRef.current = config;
        bufferRef.current = new Uint8Array(0);

        setStatus("connected");
        addLog(
          `Conectado — ${config.baudRate} baud, ${config.dataBits} data bits, paridad: ${config.parity}, stop: ${config.stopBits}`,
          "success",
        );

        // Update ports list in case it was a new one
        updatePorts();

        startReadLoop(reader);
      } catch (err) {
        const msg = (err as Error).message;
        addLog(`Error de conexión: ${msg}`, "error");
        setStatus("error");
      }
    },
    [isSupported, addLog, startReadLoop, updatePorts],
  );

  // ─── Disconnect ──────────────────────────────────────────
  const disconnect = useCallback(async () => {
    // Detener lectura continua
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsReading(false);
    readLoopActiveRef.current = false;

    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      if (writerRef.current) {
        writerRef.current.releaseLock();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {
      // Ignorar errores de cierre
    }

    setStatus("disconnected");
    addLog("Puerto serial cerrado", "info");
  }, [addLog]);

  // ─── Send raw command ────────────────────────────────────
  const sendCommand = useCallback(
    async (cmd: Uint8Array) => {
      if (!writerRef.current || !portRef.current) {
        addLog("No hay puerto conectado", "error");
        return;
      }
      try {
        addLog(toHex(cmd), "tx");
        const rtsMode = configRef.current?.rtsMode ?? "none";
        const baudRate = configRef.current?.baudRate ?? 9600;
        if (rtsMode !== "none") {
          // RS-485 half-duplex: activar DE antes de transmitir
          const txActive = rtsMode === "active-high";
          await portRef.current.setSignals({ requestToSend: txActive });
        }
        await writerRef.current.write(cmd);
        if (rtsMode !== "none") {
          // Esperar que los bytes salgan físicamente (10 bits/byte)
          const txDelayMs = Math.ceil((cmd.length * 10) / baudRate * 1000) + 5;
          await new Promise((r) => setTimeout(r, txDelayMs));
          // Liberar bus → adaptador vuelve a modo RX
          const rxActive = rtsMode === "active-high";
          await portRef.current.setSignals({ requestToSend: !rxActive });
        }
      } catch (err) {
        addLog(`Error de envío: ${(err as Error).message}`, "error");
      }
    },
    [addLog],
  );

  // ─── Read once (con timeout) ──────────────────────────────────
  const readOnce = useCallback(
    async (address: number) => {
      const cmd = buildReadCommand(address);
      await sendCommand(cmd);

      // Esperar respuesta con timeout
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (pendingResolveRef.current) {
            addLog(
              `Sin respuesta del sensor (timeout ${READ_TIMEOUT_MS}ms)`,
              "warning",
            );
            pendingResolveRef.current = null;
            pendingRejectRef.current = null;
          }
          resolve();
        }, READ_TIMEOUT_MS);

        pendingResolveRef.current = () => {
          clearTimeout(timeout);
          resolve();
        };
        pendingRejectRef.current = () => {
          clearTimeout(timeout);
          resolve();
        };
      });
    },
    [sendCommand, addLog],
  );

  // ─── Continuous reading ──────────────────────────────────
  const startContinuous = useCallback(
    (address: number) => {
      if (intervalRef.current) return;

      // Lectura inmediata
      const cmd = buildReadCommand(address);
      sendCommand(cmd);

      intervalRef.current = setInterval(() => {
        sendCommand(buildReadCommand(address));
      }, 1000);

      setIsReading(true);
      addLog("Lectura continua iniciada — intervalo 1s", "success");
    },
    [sendCommand, addLog],
  );

  const stopContinuous = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsReading(false);
    addLog("Lectura continua detenida", "info");
  }, [addLog]);

  // ─── Request Auth (Just Add Port) ────────────────────────
  const requestAuth = useCallback(async () => {
    if (!isSupported) return;
    try {
      await navigator.serial.requestPort();
      await updatePorts(); // Refresh list immediately
    } catch (err) {
      console.log("User cancelled selection or error", err);
    }
  }, [isSupported, updatePorts]);

  // ─── Change address ──────────────────────────────────────
  const changeAddress = useCallback(
    async (currentAddr: number, newAddr: number) => {
      const cmd = buildAddressCommand(currentAddr, newAddr);
      await sendCommand(cmd);
      addLog(
        `Comando de cambio de dirección enviado: 0x${currentAddr.toString(16).toUpperCase().padStart(2, "0")} → 0x${newAddr.toString(16).toUpperCase().padStart(2, "0")}`,
        "info",
      );
    },
    [sendCommand, addLog],
  );

  // ─── Clear functions ─────────────────────────────────────
  const clearLogs = useCallback(() => setLogs([]), []);

  const clearData = useCallback(() => {
    setTemperature(null);
    setStats({ min: null, max: null, avg: null, count: 0, history: [] });
  }, []);

  const clearAll = useCallback(() => {
    clearLogs();
    clearData();
    addLog("Datos limpiados", "info");
  }, [clearLogs, clearData, addLog]);

  // ─── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      readLoopActiveRef.current = false;
    };
  }, []);

  return {
    status,
    temperature,
    stats,
    logs,
    isReading,
    isSupported,
    connect,
    disconnect,
    readOnce,
    startContinuous,
    stopContinuous,
    changeAddress,
    clearLogs,
    clearData,
    clearAll,
    ports,
    canRequestPort: isSupported,
    connectedPort: portRef.current,
    requestAuth,
    hasLoadedInitialPorts,
  };
}
