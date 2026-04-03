/**
 * app.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralización de información configurable de la aplicación.
 * Para modificar textos institucionales, versión o metadatos, editar
 * únicamente este archivo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════════
//  APLICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_CONFIG = {
  /** Nombre completo de la aplicación */
  name: "IR Sensor RS-485 Tester",
  /** Versión semántica */
  version: "1.1.0",
  /** Etiqueta de versión mostrada en la interfaz */
  versionBadge: "v1.1",
  /** Descripción de la aplicación */
  description:
    "Aplicación web para prueba y diagnóstico de termómetros infrarrojos con protocolo RS-485 propietario. Centro de Electricidad, Electrónica y Telecomunicaciones — SENA.",
};

// ═══════════════════════════════════════════════════════════════════════════════
//  INSTITUCIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export const INSTITUTION_CONFIG = {
  /** Nombre completo de la institución */
  name: "Servicio Nacional de Aprendizaje SENA",
  /** Nombre completo con sigla para pie de página */
  nameFull: "Servicio Nacional de Aprendizaje - SENA",
  /** Sigla institucional */
  nameShort: "SENA",
  /** Centro de formación */
  center: "Centro de Electricidad, Electrónica y Telecomunicaciones",
  /** Sigla del centro */
  centerShort: "CEET",
  /** Centro con sigla entre paréntesis */
  centerFull: "Centro de Electricidad, Electrónica y Telecomunicaciones (CEET)",
  /** Regional */
  regional: "Regional Distrito Capital",
  /** Marca institucional compacta para header y menú móvil */
  headerBrand: "SENA — CEET",
  /** Subtítulo del header */
  headerSubtitle: "Termómetro Infrarrojo · SENA CEET",
};
