# IR Sensor RS-485 Tester — SENA CEET

Aplicación web mobile-first para prueba y diagnóstico de termómetros infrarrojos industriales con interfaz RS-485, usando la **Web Serial API** directamente desde el navegador.

## Stack Tecnológico

- **Next.js 15** App Router con TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Atomic Design** (atoms → molecules → organisms → templates)
- **Web Serial API** (sin backend)
- **Lucide React** (iconos)
- **Work Sans** + **JetBrains Mono** (tipografía)

## Paleta Institucional SENA

| Color           | Hex       | Uso                        |
| --------------- | --------- | -------------------------- |
| Verde brillante | `#39A900` | Primario, conectado, éxito |
| Verde oscuro    | `#007832` | Hover primario             |
| Azul marino     | `#00304D` | Fondos, accent             |
| Morado          | `#71277A` | Datos secundarios          |
| Cyan            | `#50E5F9` | Datos RX, info             |
| Amarillo        | `#FDC300` | Warnings, TX               |

## Protocolo del Sensor (verificado contra datasheet)

```
Header:     0x54 0x50 (propietario, NO Modbus)
Lectura:    TX [0x54][0x50][Addr][0xF1][CHK]           → 5 bytes
            RX [0x54][0x50][Addr][0xF1][DH][DL][CHK]    → 7 bytes
Dirección:  TX [0x54][0x50][Addr][0xF0][NewAddr][CHK]  → 6 bytes
Checksum:   byte bajo de la suma hex de todos los bytes previos
Temperatura: (DataH × 256 + DataL) / 10 → °C
Default:    9600 baud, 8N1, address 0x01
```

### Ejemplo del manual:

- TX lectura: `0x54 + 0x50 + 0x01 + 0xF1 = 0x196` → checksum = `0x96`
- RX con 7.2°C: `0x54 + 0x50 + 0x01 + 0xF1 + 0x00 + 0x72 = 0x208` → checksum = `0x08`

## Instalación

```bash
# Clonar / descomprimir
cd ir-sensor-rs485-tester

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build && npm start
```

## Requisitos

### Hardware

- Sensor IR RS-485 (M18×1, 0-500°C)
- Conversor USB ↔ RS-485 (FTDI, CH340 o CP2102)
- Alimentación: Vía conversor USB (si tiene salida 5V) o fuente externa 5–12 VDC

### Software

- **Chrome 89+** o **Edge 89+** (Web Serial API)
- Driver del conversor USB-Serial instalado

> **IMPORTANTE**: La Web Serial API NO funciona en iframes (como previews de IDEs).
> Debe abrir la app directamente en `http://localhost:3000`.

## Características Principales

- **Selector de Puertos Inteligente**: Identificación de dispositivos mediante Vendor ID (VID) y Product ID (PID).
- **Gestión de Permisos**: Modal automático para solicitar acceso a puertos COM si no se detectan dispositivos autorizados.
- **Gráficas en Tiempo Real**: Visualización del historial de temperatura.
- **Consola RS-485**: Inspector de tramas TX/RX para depuración de protocolo.
- **Modo Demo**: Simulación de sensor para pruebas sin hardware.

## Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css          # Variables CSS SENA, dark mode, 7-seg font
│   ├── layout.tsx           # Work Sans + JetBrains Mono
│   └── page.tsx             # Entry point
├── components/
│   ├── atoms/               # StatusIndicator, IconWrapper
│   ├── molecules/           # SevenSegmentDisplay, StatCard, ConsoleLog, UserManualModal
│   ├── organisms/           # Header, ConnectionPanel, TemperaturePanel, WiringPanel
│   ├── templates/           # TesterTemplate (main orchestrator)
│   └── ui/                  # shadcn/ui components
├── hooks/
│   └── useSerialPort.ts     # Custom hook Web Serial API
├── lib/
│   ├── protocol.ts          # Builder/parser de tramas RS-485
│   └── utils.ts             # cn(), serialTimestamp()
└── types/
    └── serial.ts            # Interfaces TypeScript
```

## Uso

1.  **Permisos Iniciales**: Al abrir la app, si no hay dispositivos autorizados, aparecerá una ventana emergente. Haga clic en **"Buscar Dispositivos"** y seleccione su puerto COM (ch340, FTDI, etc.) para autorizarlo.
2.  **Configuración**: Verifique los parámetros seriales (Default: 9600, 8N1).
3.  **Conexión**:
    - Seleccione el puerto en el dropdown "Puerto / Dispositivo".
    - El dropdown muestra el **VID/PID** del dispositivo para fácil identificación (ej. `VID:1A86 PID:7523`).
    - Haga clic en **"Conectar Puerto Serial"**.
4.  **Lectura**: Use **"Leer 1×"** para lectura manual o **"Continua"** para muestreo automático.
5.  **Visualización**: Monitoree la temperatura en tiempo real, el gráfico histórico y la consola de comandos RS-485.

## Modo Demo

Clic en **"Modo Demo"** para probar la interfaz sin hardware. Genera datos simulados.

## Créditos

**Centro de Electricidad, Electrónica y Telecomunicaciones (CEET)**  
Servicio Nacional de Aprendizaje — SENA — Bogotá, Colombia
