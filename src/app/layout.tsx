import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-archivo" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black" });

export const metadata: Metadata = {
  title: "Angle Miner — Deine Reviews wissen, was verkauft",
  description:
    "Lade den CSV-Export deiner Reviews hoch und bekomme in Minuten eine belegte Angle-Map, Objection-Bank und Scrollstopper-Zitate. Für DTC-Brands im DACH-Raum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${archivoBlack.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
