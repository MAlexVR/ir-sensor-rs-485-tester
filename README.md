# IR Sensor RS-485 Tester — SENA CEET

![versión](https://img.shields.io/badge/versión-1.2.0-sena--green?color=39a900)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)
![licencia](https://img.shields.io/badge/licencia-MIT-green)

Aplicación web mobile-first para prueba y diagnóstico de termómetros infrarrojos industriales con interfaz RS-485, usando la **Web Serial API** directamente desde el navegador, sin backend ni software adicional.

## Stack Tecnológico

- **Next.js 16** App Router con TypeScript 6
- **Tailwind CSS v4** (CSS-first, `@theme {}`) + **shadcn/ui** (Radix UI)
- **Atomic Design** (atoms → molecules → organisms → templates)
- **Web Serial API** (sin backend)
- **Lucide React 1.x** (iconos)
- **Work Sans** + **JetBrains Mono** (tipografía institucional SENA)
- **tw-animate-css** (animaciones Tailwind v4)

## Paleta Institucional SENA

| Color           | Hex       | Uso                              |
| --------------- | --------- | -------------------------------- |
| Verde SENA      | `#39A900` | Primario, header, footer, éxito  |
| Verde oscuro    | `#007832` | Hover primario                   |
| Azul SENA       | `#00324D` | Headings, borde header/footer    |
| Azul navy       | `#00304D` | Accent, fondos                   |
| Amarillo        | `#FDC300` | Warnings, tramas TX              |
| Cyan            | `#50E5F9` | Datos RX, info                   |
| Morado          | `#71277A` | Datos secundarios                |

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

- **Header y Footer institucionales**: Diseño alineado con la identidad SENA CEET — logo LEPS, colores y bordes institucionales.
- **Selector de Puertos Inteligente**: Identificación de dispositivos mediante Vendor ID (VID) y Product ID (PID).
- **Gestión de Permisos**: Modal rediseñado para solicitar acceso a puertos COM con pasos claros y guía de troubleshooting.
- **Gráficas en Tiempo Real**: Visualización del historial de temperatura.
- **Consola RS-485**: Inspector de tramas TX/RX para depuración de protocolo.
- **Ajustes de Conexión Serial**: Tab dedicado con interruptor para habilitar/deshabilitar parámetros de configuración serial. Deshabilitado por defecto (valores de fábrica 9600 8N1).
- **Modo Demo**: Simulación de sensor para pruebas sin hardware. Requiere activar Ajustes primero.
- **Manual de Uso**: Modal rediseñado con secciones organizadas, tablas y ejemplos del protocolo.

## Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css          # Tailwind v4: @theme SENA, @utility, animaciones, scrollbar
│   ├── layout.tsx           # Work Sans + JetBrains Mono, light mode
│   └── page.tsx             # Entry point
├── components/
│   ├── atoms/               # StatusIndicator, IconWrapper, Modal
│   ├── molecules/           # SevenSegmentDisplay, StatCard, ConsoleLog,
│   │                        # UserManualModal, PermissionsModal
│   ├── organisms/           # Header, Footer, ConnectionPanel, TemperaturePanel, WiringPanel
│   ├── templates/           # TesterTemplate (main orchestrator)
│   └── ui/                  # shadcn/ui components
├── hooks/
│   └── useSerialPort.ts     # Custom hook Web Serial API
├── lib/
│   ├── protocol.ts          # Builder/parser de tramas RS-485
│   └── utils.ts             # cn(), serialTimestamp()
└── types/
    └── serial.ts            # Interfaces TypeScript (tipos de configuración serial)
```

## Uso

1. **Permisos Iniciales**: Al abrir la app sin dispositivos autorizados aparece el modal de permisos. Clic en **"Buscar Dispositivos"** y seleccione su puerto COM.
2. **Ajustes** *(opcional)*: Los parámetros seriales están bloqueados por defecto (9600 8N1). Active el interruptor en el tab **"Ajustes"** para modificarlos.
3. **Conexión**:
   - Seleccione el puerto en el dropdown "Puerto / Dispositivo" (muestra VID/PID).
   - Haga clic en **"Conectar Puerto Serial"**.
4. **Lectura**: Use **"Continua"** para muestreo automático cada segundo. Active Ajustes para usar **"Leer 1×"** para lectura puntual.
5. **Visualización**: Monitoree temperatura en tiempo real, gráfico histórico y consola TX/RX.

## Tab Ajustes

El tab **"Ajustes"** controla mediante un interruptor los parámetros avanzados: Baud Rate, Bits de Datos, Paridad, Bits de Parada, Control de Flujo, Control DE/RE, Dirección del Sensor, Lectura 1×, Cambiar Dirección y Modo Demo. El selector de puerto y el botón Conectar siempre permanecen activos.

## Modo Demo

Active la **Configuración avanzada** en Ajustes y presione **"Modo Demo"** para probar la interfaz sin hardware. Genera datos simulados con variación sinusoidal.

## Créditos

**Centro de Electricidad, Electrónica y Telecomunicaciones (CEET)**  
Servicio Nacional de Aprendizaje — SENA — Bogotá, Colombia  
Laboratorio de Electrónica, Potencia y Sistemas — LEPS
