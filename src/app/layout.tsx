import type { Metadata, Viewport } from "next";
import { Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IR Sensor RS-485 Tester | SENA CEET",
  description:
    "Aplicación web para prueba y diagnóstico de termómetros infrarrojos con protocolo RS-485 propietario. Centro de Electricidad, Electrónica y Telecomunicaciones — SENA.",
  keywords: [
    "termómetro infrarrojo",
    "RS-485",
    "sensor temperatura",
    "Web Serial API",
    "SENA",
    "CEET",
    "comunicaciones industriales",
  ],
  icons: {
    icon: "/favicon/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IR485 Tester",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#39a900",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${workSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
